# CI/CD Workflow Diagram

## Release Pipeline Overview

```
                    Developer Action
                          ↓
                   git tag v1.16.3
                   git push origin v1.16.3
                          ↓
        GitHub Actions: Release Workflow Triggered
        (on: push tags: 'v*')
                          ↓
        ┌──────────────────┴──────────────────┐
        ↓                                     ↓
    ┌─────────────┐                  ┌─────────────┐
    │  Build x64  │ (parallel)       │ Build ARM64 │
    │   (Intel)   │                  │(Apple Si.)  │
    │             │                  │             │
    │ 1. Setup    │                  │ 1. Setup    │
    │ 2. Build    │                  │ 2. Build    │
    │ 3. Generate │                  │ 3. Generate │
    │    SHA256   │                  │    SHA256   │
    │ 4. Upload   │                  │ 4. Upload   │
    │   to GitHub │                  │   to GitHub │
    │ Duration:   │                  │ Duration:   │
    │  8-10 min   │                  │  8-10 min   │
    └─────┬───────┘                  └──────┬──────┘
          │                                  │
          └──────────────┬───────────────────┘
                         ↓
          ┌─────────────────────────────┐
          │ Wait: Both builds complete  │
          │ (jobs.[*].status == success)│
          └────────────┬────────────────┘
                       ↓
          ┌────────────────────────────┐
          │  create-checksums (job 2)  │
          │                            │
          │ 1. Download both DMGs      │
          │ 2. Calculate SHA-256 each  │
          │ 3. Create CHECKSUMS.txt:   │
          │    SHA256_1  Scribe...dmg  │
          │    SHA256_2  Scribe...dmg  │
          │ 4. Upload CHECKSUMS.txt    │
          │    to release assets       │
          │                            │
          │ Duration: 2-3 min          │
          └────────────┬───────────────┘
                       ↓
          ┌────────────────────────────┐
          │  update-homebrew (job 3)   │
          │                            │
          │ Phase 1: Download & Verify │
          │  - Get DMGs from release   │
          │  - Download CHECKSUMS.txt  │
          │  - Run: shasum -a 256 -c   │
          │    CHECKSUMS.txt           │
          │  ✓ Exit if verification    │
          │    fails                   │
          │                            │
          │ Phase 2: Update Formula    │
          │  - Checkout homebrew-tap   │
          │  - Run Ruby script to      │
          │    update Casks/scribe.rb: │
          │      version "1.16.3"      │
          │      on_arm do             │
          │        sha256 "abc123..."  │
          │      end                   │
          │      on_intel do           │
          │        sha256 "def456..."  │
          │      end                   │
          │  - Extract SHA values      │
          │                            │
          │ Phase 3: Validate Formula  │
          │  - Run: brew audit --cask  │
          │  - Check syntax & fields   │
          │  ✓ Exit if validation      │
          │    fails                   │
          │                            │
          │ Phase 4: Commit & Push     │
          │  - git add Casks/scribe.rb │
          │  - git commit -m "..."     │
          │  - git push origin main    │
          │                            │
          │ Duration: 3-5 min          │
          └────────────┬───────────────┘
                       ↓
          ┌────────────────────────────┐
          │verify-installation (job 4) │
          │                            │
          │ 1. brew tap data-wise/tap  │
          │ 2. Install:                │
          │    brew install --cask     │
          │    data-wise/tap/scribe    │
          │ 3. Verify:                 │
          │    ls /Applications/       │
          │    Scribe.app              │
          │ 4. Report success          │
          │                            │
          │ Duration: 5-7 min          │
          └────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │  ✅ RELEASE COMPLETE         │
        │                              │
        │ - All artifacts uploaded     │
        │ - Checksums generated        │
        │ - Formula updated in tap     │
        │ - Installation verified      │
        │                              │
        │ Users can now install:       │
        │ brew install --cask          │
        │   data-wise/tap/scribe       │
        └──────────────────────────────┘

Total Duration: 15-20 minutes (sequential)
```

---

## Job Dependencies Graph

```
                    build_x64
                   /          \
                  /            \
           build_aarch64         |
                  \              /
                   \            /
                    v          v
                   both_complete
                        |
                        v
              create_checksums
                        |
                        v
              update_homebrew
                        |
                        v
            verify_installation
                        |
                        v
              ✅ Release Complete
```

---

## Workflow State Machine

```
                        START
                         |
                         v
                   Tag Pushed (v*)
                         |
                    trigger: on: push: tags
                         |
                         v
                ┌─────────────────┐
                │ Parallel Build  │
                │  ├─ build_x64   │
                │  └─ build_aarch │
                │                 │
                │ Status:         │
                │  ✓ Running      │
                └────────┬────────┘
                         |
              (8-10 min both complete)
                         |
                         v
                ┌─────────────────┐
                │ Checksum Gen    │
                │                 │
                │ Status:         │
                │  ✓ Running      │
                └────────┬────────┘
                         |
                      (2-3 min)
                         |
                         v
                ┌─────────────────┐
                │ Update Formula  │
                │                 │
                │ Step 1: Verify  │──→ ❌ FAIL
                │ Step 2: Update  │    (Exit)
                │ Step 3: Validate│
                │ Step 4: Push    │
                │                 │
                │ Status:         │
                │  ✓ Running      │
                └────────┬────────┘
                         |
                      (3-5 min)
                         |
                         v
                ┌─────────────────┐
                │ Test Install    │
                │                 │
                │ Status:         │
                │  ✓ Running      │
                └────────┬────────┘
                         |
                      (5-7 min)
                         |
                         v
                  ✅ SUCCESS
            (All jobs completed)
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Release                            │
│                                                              │
│  Artifacts:                                                 │
│  ├─ Scribe_1.16.3_x64.dmg        (from build_x64)          │
│  ├─ Scribe_1.16.3_aarch64.dmg    (from build_aarch64)      │
│  └─ CHECKSUMS.txt                (from create_checksums)   │
│                                                              │
│  body: |                                                    │
│    Installation: brew install --cask ...                   │
│    Verification: See CHECKSUMS.txt                         │
│    What's New: See CHANGELOG.md                            │
└──────────────────────────────────────────────────────────────┘
                         ↑
                    (upload to)
                         |
      ┌──────────────────┼──────────────────┐
      |                  |                  |
      ↓                  ↓                  ↓
┌──────────┐      ┌───────────┐      ┌─────────┐
│ build    │      │ create    │      │ update  │
│ jobs:    │      │checksums: │      │homebrew:│
│          │      │           │      │         │
│ x64:     │      │ Download  │      │ Verify  │
│ ✓ SHA256 │      │ both DMGs │      │ →       │
│          │      │           │      │ Update  │
│ aarch64: │      │ Calculate │      │ →       │
│ ✓ SHA256 │      │ SHA256    │      │ Validate│
│          │      │           │      │ →       │
│ Upload   │      │ Generate  │      │ Publish │
│ DMGs     │      │ CHECKSUMS │      │         │
└──────────┘      │ .txt      │      └─────────┘
                  │           │            |
                  │ Upload    │            ↓
                  │ to        │      ┌──────────────┐
                  │ release   │      │homebrew-tap  │
                  └────┬──────┘      │ repo:        │
                       |            │              │
                       └────→────────│ Casks/      │
                                    │ scribe.rb   │
                                    │ (updated)   │
                                    └──────────────┘
```

---

## Error Handling Flow

```
                    START WORKFLOW
                         |
                         v
    ┌──────────────────────────────────┐
    │ Build Artifacts (x64 + aarch64)  │
    └──────────┬──────────────────────┬┘
               |                      |
          Build OK                 ❌ BUILD FAILED
               |                      |
               v                      v
    ┌──────────────────┐         [EXIT]
    │Create Checksums  │      Stop Workflow
    └────────┬─────────┘
             |
        SHA256 OK
             |
             v
    ┌──────────────────────────┐
    │ Download & Verify        │
    └──────────┬───────────────┘
               |
    ┌──────────┴──────────────┐
    v                         v
Checksum OK             ❌ CHECKSUM FAILED
    |                         |
    v                         v
Continue                   [EXIT]
    |                    Stop Workflow
    v                    Report error
┌──────────────────────────┐
│ Update Formula (Ruby)    │
└────────┬────────┬────────┘
         |        |
     OK  |        |  ❌ ERROR
         v        v
      Continue  [EXIT]
         |      Stop
         v      Report
┌──────────────────┐
│ Brew Audit       │
└────────┬──────┬──┘
         |      |
     OK  |      |  ❌ FAILED
         v      v
      Continue [EXIT]
         |      Stop
         v      Report
┌────────────────────┐
│ Commit & Push      │
└────────┬──────┬────┘
         |      |
     OK  |      |  ❌ FAILED
         v      v
      Continue [EXIT]
         |      Stop
         v      Report
┌────────────────────┐
│ Verify Install     │
└────────┬──────┬────┘
         |      |
     OK  |      |  ❌ FAILED
         v      v
    ✅ SUCCESS  [EXIT]
    All jobs ok  Stop
                 Report
```

---

## Sequence Diagram: Complete Release

```
Developer          GitHub             Build           Homebrew-tap
   |                 |                  |                   |
   |─── git tag ────→|                  |                   |
   |                 |                  |                   |
   |                 |─ trigger ─→ build_x64                |
   |                 |─ trigger ─→ build_aarch64            |
   |                 |                  |                   |
   |                 |         (8-10 min, parallel)          |
   |                 |                  |                   |
   |                 |←── artifacts ────|                   |
   |                 |                  |                   |
   |                 |─ trigger → create_checksums          |
   |                 |           (download, hash)           |
   |                 |←── CHECKSUMS.txt ─|                  |
   |                 |                  |                   |
   |                 |─ trigger → update_homebrew ─→←─ clone
   |                 |    (verify, update, validate)  cask
   |                 |                  |              file
   |                 |                  |   ←─ audit ──|
   |                 |                  |              |
   |                 |                  |    commit ──→|
   |                 |                  |    push ────→|
   |                 |                  |              |
   |                 |─ trigger → verify_installation
   |                 |           (install, test)
   |                 |
   |                 |←─ ✅ Success! ──|
   |
   |← notification ──|
   |
   | (tests installation locally)
   |
   |─ brew install ──→| ← fetch from homebrew-tap
   |
   |← ✅ Installed!   |
```

---

## File Modification Timeline

```
2026-01-25 14:00 - Fix v1.16.2 checksum
                   └─ Casks/scribe.rb: 5ca34f → 390574

2026-01-25 14:15 - Add release checklist
                   └─ RELEASE-CHECKLIST.md (218 lines)

2026-01-25 14:30 - Document checksum fix
                   └─ CHECKSUM-FIX-SUMMARY.md (166 lines)

2026-01-25 14:45 - Overhaul CI workflow
                   └─ .github/workflows/release.yml (+190 lines)

2026-01-25 15:00 - Document CI workflow
                   └─ CI-WORKFLOW-GUIDE.md (448 lines)

2026-01-25 15:15 - Summarize automation
                   └─ CI-AUTOMATION-SUMMARY.md (400 lines)

2026-01-25 15:30 - This diagram
                   └─ CI-WORKFLOW-DIAGRAM.md (you are here)
```

---

## Performance Metrics

```
Stage                  Duration    Status
─────────────────────────────────────────
Build x64              8-10 min    Compile
Build aarch64          8-10 min    Compile (parallel)
Create checksums       2-3 min     Fast
Update homebrew        3-5 min     Safe
Verify installation    5-7 min     Test
─────────────────────────────────────────
Total (sequential)     15-20 min   Per release

Parallelization:
├─ build_x64 (8 min)  ─┐
├─ build_aarch64 (8 min)─ Parallel (8 min total)
└─ create_checksums (2 min) → update_homebrew (3 min) → verify_install (5 min)

Result: One release every 15-20 minutes
```

---

**Generated:** 2026-01-25
**Purpose:** Visual reference for CI/CD workflow
**Status:** ✅ Complete
