# AI Integration Plan - Tauri Backend Wiring

> **Branch:** `feat/ai-integration`
> **Worktree:** `~/.git-worktrees/scribe/ai-integration`
> **Base:** `dev` branch
> **Created:** 2026-01-08
> **Status:** Ready to start

---

## Overview

**Goal:** Wire existing AI UI components to Tauri backend with Claude/Gemini CLI integration.

**Current State:**
- ✅ All UI Complete: Claude Tab, Quick Chat, Quick Actions
- ✅ 197 tests passing (102 unit + 95 E2E)
- ❌ Browser mode stub: Returns "AI features unavailable"

**Target:** Functional AI features in desktop app via CLI-only (no API keys required)

---

## Phase 1: Claude CLI Integration (2-3 hours)

**Status:** 🚧 Ready to implement

### Backend Implementation

**New File:** `src-tauri/src/ai/claude.rs` (150-200 lines)

```rust
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeRequest {
    pub prompt: String,
    pub context: String,
    pub model: Option<String>, // "sonnet" | "opus" | "haiku"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeResponse {
    pub content: String,
    pub model_used: String,
    pub tokens: Option<u32>,
}

/// Check if Claude CLI is available
pub fn is_claude_available() -> bool {
    Command::new("which")
        .arg("claude")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

/// Execute Claude CLI with prompt and context
pub async fn run_claude(
    prompt: &str,
    context: &str,
    model: Option<&str>,
) -> Result<String, String> {
    // Build command: echo "$context" | claude --print "$prompt"
    let mut cmd = Command::new("claude");
    cmd.arg("--print").arg(prompt);

    if let Some(m) = model {
        cmd.arg("--model").arg(m);
    }

    // Pipe context via stdin
    cmd.stdin(std::process::Stdio::piped());
    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| {
        format!("Failed to spawn Claude CLI: {}. Is Claude installed?", e)
    })?;

    // Write context to stdin
    use std::io::Write;
    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(context.as_bytes()).map_err(|e| {
            format!("Failed to write context to Claude: {}", e)
        })?;
    }

    // Wait for completion and read output
    let output = child.wait_with_output().map_err(|e| {
        format!("Failed to read Claude output: {}", e)
    })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Claude CLI error: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_claude_availability() {
        // This test will pass if Claude is installed
        let available = is_claude_available();
        println!("Claude available: {}", available);
    }

    #[tokio::test]
    async fn test_claude_execution() {
        if !is_claude_available() {
            println!("Skipping test: Claude not installed");
            return;
        }

        let result = run_claude(
            "What is 2+2?",
            "You are a helpful math tutor.",
            Some("haiku")
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.contains("4"));
    }
}
```

**New File:** `src-tauri/src/ai/mod.rs` (50 lines)

```rust
pub mod claude;
pub mod gemini;

pub use claude::{run_claude, is_claude_available};
pub use gemini::{run_gemini, is_gemini_available};

/// AI provider enum
#[derive(Debug, Clone, Copy)]
pub enum AiProvider {
    Claude,
    Gemini,
}

impl AiProvider {
    pub fn is_available(&self) -> bool {
        match self {
            AiProvider::Claude => is_claude_available(),
            AiProvider::Gemini => is_gemini_available(),
        }
    }
}
```

### Tauri Commands

**File:** `src-tauri/src/commands.rs` (add new commands)

```rust
use crate::ai::{run_claude, run_gemini, is_claude_available, is_gemini_available};

#[tauri::command]
async fn ai_run_claude(
    prompt: String,
    context: String,
    model: Option<String>,
) -> Result<String, String> {
    run_claude(&prompt, &context, model.as_deref()).await
}

#[tauri::command]
fn ai_is_claude_available() -> bool {
    is_claude_available()
}

#[tauri::command]
async fn ai_run_gemini(
    prompt: String,
    context: String,
    model: Option<String>,
) -> Result<String, String> {
    run_gemini(&prompt, &context, model.as_deref()).await
}

#[tauri::command]
fn ai_is_gemini_available() -> bool {
    is_gemini_available()
}

// Register in lib.rs:
// .invoke_handler(tauri::generate_handler![
//     ai_run_claude,
//     ai_is_claude_available,
//     ai_run_gemini,
//     ai_is_gemini_available,
// ])
```

### Frontend Integration

**File:** `src/renderer/src/lib/api.ts` (update existing stubs)

```typescript
// Current browser-mode stub:
async runClaude(prompt: string, context: string, model?: string): Promise<string> {
  if (isTauri()) {
    return await invoke('ai_run_claude', { prompt, context, model })
  }
  return "AI features are only available in the desktop app."
}

async runGemini(prompt: string, context: string, model?: string): Promise<string> {
  if (isTauri()) {
    return await invoke('ai_run_gemini', { prompt, context, model })
  }
  return "AI features are only available in the desktop app."
}

async isClaudeAvailable(): Promise<boolean> {
  if (isTauri()) {
    return await invoke('ai_is_claude_available')
  }
  return false
}

async isGeminiAvailable(): Promise<boolean> {
  if (isTauri()) {
    return await invoke('ai_is_gemini_available')
  }
  return false
}
```

### Testing

**Unit Tests (Rust):**
- `ai/claude.rs`: CLI availability check, command building, output parsing
- `ai/gemini.rs`: Same as Claude

**Integration Tests (Frontend):**
- Update existing ClaudeChatPanel tests to verify Tauri invocation
- Test error handling (CLI not installed, execution failure)
- Test model selection (sonnet, opus, haiku)

**E2E Tests (Playwright):**
- Skip in browser mode
- Run in Tauri mode only (requires Claude/Gemini CLI installed)

---

## Phase 2: Gemini CLI Integration (1-2 hours)

**Status:** 📋 After Phase 1

**New File:** `src-tauri/src/ai/gemini.rs` (100-150 lines)

```rust
use std::process::Command;

/// Check if Gemini CLI is available
pub fn is_gemini_available() -> bool {
    Command::new("which")
        .arg("gemini")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

/// Execute Gemini CLI with prompt and context
pub async fn run_gemini(
    prompt: &str,
    context: &str,
    model: Option<&str>,
) -> Result<String, String> {
    // Similar to Claude implementation
    // Command: echo "$context" | gemini --print "$prompt"

    let mut cmd = Command::new("gemini");
    cmd.arg("--print").arg(prompt);

    if let Some(m) = model {
        cmd.arg("--model").arg(m);
    }

    // ... (similar stdin/stdout handling as Claude)
}
```

**Integration:** Use same Tauri command pattern as Claude

---

## Phase 3: Quick Actions Enhancement (1 hour)

**Status:** 📋 After Phase 1

### Current State

**File:** `src/renderer/src/store/useSettingsStore.ts`

Already has 5 default Quick Actions:
1. ✨ Improve - Polish clarity and flow
2. 📝 Expand - Add depth and examples
3. 📋 Summarize - Create concise summaries
4. 💡 Explain - Clarify complex concepts
5. 🔍 Research - Generate research questions

### Enhancement: Wire to AI Backend

**File:** `src/renderer/src/components/QuickActions.tsx` (update)

```typescript
const handleQuickAction = async (action: QuickAction) => {
  if (!selectedNote) return

  const context = selectedNote.content
  const prompt = action.prompt
  const model = action.model // 'claude' | 'gemini'

  setIsLoading(true)
  try {
    const response = model === 'claude'
      ? await api.runClaude(prompt, context, 'sonnet')
      : await api.runGemini(prompt, context)

    // Display response in Claude tab or inline
    showResponse(response)
  } catch (error) {
    toast.error(`AI Error: ${error.message}`)
  } finally {
    setIsLoading(false)
  }
}
```

### Features

- [ ] Execute Quick Actions via Claude/Gemini CLI
- [ ] Show loading indicator during execution
- [ ] Display response in Claude tab (or inline modal)
- [ ] Error handling with user-friendly messages
- [ ] Model selection per action (already in settings)

---

## Phase 4: Chat History Backend (30 minutes)

**Status:** 📋 After Phase 1

### Current State

✅ Frontend complete with Migration 009:
- `chat_sessions` table
- `chat_messages` table
- Auto-save/load per note

### Enhancement: Persist AI Responses

**File:** `src/renderer/src/components/ClaudeChatPanel.tsx` (update)

```typescript
const handleSubmit = async () => {
  // ... existing code ...

  try {
    const response = await api.runClaude(input, contextString, 'sonnet')

    // Save both user message and assistant response
    await api.saveChatMessage(sessionId, {
      role: 'user',
      content: input,
      timestamp: Date.now()
    })

    await api.saveChatMessage(sessionId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    })

    // Update UI
    setMessages([...messages, userMsg, assistantMsg])
  } catch (error) {
    // ... error handling ...
  }
}
```

**Already Implemented:** Database persistence, session management, auto-load

**New:** Connect to actual Claude CLI instead of returning stub

---

## Phase 5: Error Handling & UX (1 hour)

**Status:** 📋 Final polish

### CLI Not Installed Detection

**On App Startup:**

```typescript
// src/renderer/src/App.tsx
useEffect(() => {
  const checkAiAvailability = async () => {
    const claudeAvailable = await api.isClaudeAvailable()
    const geminiAvailable = await api.isGeminiAvailable()

    if (!claudeAvailable && !geminiAvailable) {
      toast.warn(
        'AI features require Claude or Gemini CLI. Install from: https://claude.com/cli',
        { duration: 10000 }
      )
    }
  }

  if (isTauri()) {
    checkAiAvailability()
  }
}, [])
```

### Settings UI

**File:** `src/renderer/src/components/SettingsModal.tsx` (add AI section)

**New Tab:** "AI" category

```
┌─────────────────────────────────────────────────┐
│  AI Configuration                               │
├─────────────────────────────────────────────────┤
│  ☑ Enable Claude AI                            │
│    Status: ● Installed (claude --version 1.2.0) │
│                                                 │
│  ☑ Enable Gemini AI                            │
│    Status: ○ Not installed [Install Guide →]   │
│                                                 │
│  Default Model: ○ Claude Sonnet                │
│                 ○ Claude Opus                   │
│                 ○ Claude Haiku                  │
│                 ○ Gemini Pro                    │
│                                                 │
│  ☑ Show AI suggestions inline                  │
│  ☑ Enable @ references in chat                 │
│  ☑ Auto-save chat history                      │
└─────────────────────────────────────────────────┘
```

### Error Messages

**User-Friendly Errors:**

| Error | Message | Action |
|-------|---------|--------|
| CLI not installed | "Claude CLI not found. Install from claude.com/cli" | Show install guide |
| CLI execution failed | "Claude returned an error. Check your internet connection." | Retry button |
| Timeout (>30s) | "AI request timed out. Try a shorter prompt." | Cancel + retry |
| Rate limit | "Claude rate limit reached. Try again in a few minutes." | Exponential backoff |

---

## Testing Strategy

### Unit Tests (Rust)

**File:** `src-tauri/src/ai/tests.rs` (20-25 tests)

- [ ] `test_claude_availability()`
- [ ] `test_gemini_availability()`
- [ ] `test_claude_execution()`
- [ ] `test_gemini_execution()`
- [ ] `test_error_handling_cli_not_found()`
- [ ] `test_error_handling_execution_failure()`
- [ ] `test_model_selection()`
- [ ] `test_stdin_context_passing()`
- [ ] `test_stdout_parsing()`

### Integration Tests (Frontend)

**Files:** `src/renderer/src/__tests__/AiIntegration.test.tsx` (30-40 tests)

- [ ] Claude chat panel integration
- [ ] Quick Chat integration
- [ ] Quick Actions execution
- [ ] Error handling flows
- [ ] Model selection
- [ ] Chat history persistence

### E2E Tests (Playwright)

**Files:** `e2e/ai-features.spec.ts` (15-20 tests)

- [ ] Send message in Claude tab
- [ ] Use Quick Chat (⌘J)
- [ ] Execute Quick Action
- [ ] Verify chat history loads
- [ ] Test @ references
- [ ] Export conversation
- [ ] Handle errors (CLI not installed)

**Note:** E2E tests require Claude CLI installed

---

## Implementation Checklist

### Phase 1: Claude CLI (2-3 hours)

- [ ] Create `src-tauri/src/ai/mod.rs`
- [ ] Create `src-tauri/src/ai/claude.rs`
- [ ] Implement `is_claude_available()`
- [ ] Implement `run_claude()` with stdin/stdout
- [ ] Add Tauri commands to `commands.rs`
- [ ] Register commands in `lib.rs`
- [ ] Update `api.ts` to invoke Tauri commands
- [ ] Test in Tauri desktop app
- [ ] Write 20 Rust unit tests
- [ ] Update 38 frontend tests

### Phase 2: Gemini CLI (1-2 hours)

- [ ] Create `src-tauri/src/ai/gemini.rs`
- [ ] Implement `is_gemini_available()`
- [ ] Implement `run_gemini()` with stdin/stdout
- [ ] Add Tauri commands
- [ ] Update `api.ts`
- [ ] Test both providers
- [ ] Write 15 Rust unit tests

### Phase 3: Quick Actions (1 hour)

- [ ] Wire QuickActions.tsx to AI backend
- [ ] Add loading states
- [ ] Display responses
- [ ] Error handling
- [ ] Update 20 tests

### Phase 4: Chat History (30 minutes)

- [ ] Connect ClaudeChatPanel to AI backend
- [ ] Auto-save responses
- [ ] Verify session management
- [ ] Update 38 tests

### Phase 5: Polish (1 hour)

- [ ] Startup availability check
- [ ] Settings UI for AI config
- [ ] User-friendly error messages
- [ ] Install guides
- [ ] Write 15-20 E2E tests

---

## Release Strategy

**When Complete:**

1. **Merge to dev:**
   ```bash
   cd ~/.git-worktrees/scribe/ai-integration
   git checkout dev
   git merge feat/ai-integration --no-ff -m "Merge AI Integration - Claude/Gemini CLI"
   git push origin dev
   ```

2. **Create PR to main:**
   ```bash
   gh pr create --base main --head dev --title "v1.17.0: AI Integration (Claude/Gemini CLI)"
   ```

3. **Tag release:**
   ```bash
   git tag -a v1.17.0 -m "v1.17.0 - AI Integration with Claude/Gemini CLI"
   git push origin v1.17.0
   ```

---

## Dependencies

**Cargo.toml:**
```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

**No additional dependencies needed** - uses standard library `std::process::Command`

---

## Documentation

**User Guides to Create:**
1. Installing Claude CLI (link to claude.com/cli)
2. Installing Gemini CLI (link to gemini docs)
3. Configuring AI providers in Settings
4. Using @ references in chat
5. Quick Actions reference
6. Troubleshooting AI errors

**Developer Docs:**
1. AI module architecture
2. Adding new AI providers
3. Testing AI features
4. Error handling patterns

---

## Notes

**ADHD Considerations:**
- Instant feedback (loading indicators)
- Clear error messages (actionable)
- No hidden complexity (CLI-only, no API keys)
- Quick Actions for common tasks (one-click)

**Security:**
- CLI-only (no API keys in codebase)
- No data sent to third parties
- Local execution only
- User controls all prompts

**Browser Mode:**
- Remains stub ("AI features unavailable")
- No degradation of existing features
- Clear messaging about desktop-only

---

**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Next Review:** After Phase 1 completion
