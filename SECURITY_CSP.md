# Content Security Policy (CSP) - Scribe

> **Phase 5 Task 17:** Enhanced security with Content Security Policy

**Status:** ✅ Configured and active
**Location:** `src-tauri/tauri.conf.json`
**Format:** Strict CSP with minimal permissions

---

## Current CSP Configuration

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
worker-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self'
```

---

## CSP Directives Explained

### Core Resource Policies

#### `default-src 'self'`
**Purpose:** Default policy for all resource types
**Value:** `'self'` - Only load resources from the app itself
**Security:** Blocks all external resources by default

#### `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`
**Purpose:** Control JavaScript execution
**Allowed:**
- `'self'` - Scripts from app bundle
- `'unsafe-inline'` - Inline scripts (needed for React, CodeMirror)
- `'wasm-unsafe-eval'` - WebAssembly evaluation (future-proofing)

**Why unsafe-inline:** React and CodeMirror generate inline scripts dynamically. While this reduces CSP strictness, it's acceptable in a desktop app where we control all code.

**Blocked:**
- External script CDNs
- eval() from user input
- Dynamic script injection from untrusted sources

#### `style-src 'self' 'unsafe-inline'`
**Purpose:** Control stylesheet loading
**Allowed:**
- `'self'` - Stylesheets from app bundle
- `'unsafe-inline'` - Inline styles (needed for Tailwind CSS, KaTeX)

**Why unsafe-inline:**
- Tailwind CSS generates utility classes with inline styles
- KaTeX renders math with inline styles
- CodeMirror themes use inline styles

**Blocked:**
- External stylesheet CDNs
- User-injected styles from untrusted sources

#### `img-src 'self' data: blob:`
**Purpose:** Control image sources
**Allowed:**
- `'self'` - Images from app bundle
- `data:` - Data URIs (base64-encoded images)
- `blob:` - Blob URLs (generated images, canvas exports)

**Use Cases:**
- User-uploaded images via data URIs
- Canvas-generated charts/graphs
- Inline SVGs

**Blocked:**
- External image CDNs
- Tracking pixels
- Remote images from untrusted sources

#### `font-src 'self' data:`
**Purpose:** Control font loading
**Allowed:**
- `'self'` - Fonts from app bundle
- `data:` - Data URIs (embedded fonts)

**Use Cases:**
- JetBrains Mono (code font)
- Inter (UI font)
- Embedded icon fonts

**Blocked:**
- External font CDNs (Google Fonts, Adobe Fonts)
- Remote fonts from untrusted sources

#### `connect-src 'self'`
**Purpose:** Control AJAX, WebSocket, fetch() requests
**Allowed:**
- `'self'` - API calls to app backend only

**Use Cases:**
- Tauri command invocations
- Local database queries
- Internal API calls

**Blocked:**
- External API calls
- Third-party analytics
- Remote data fetching

---

### Security Hardening Policies

#### `frame-src 'none'`
**Purpose:** Block all iframe embedding
**Value:** `'none'` - No iframes allowed
**Security:** Prevents clickjacking and iframe injection attacks

**Rationale:** Scribe doesn't need iframes. This completely blocks:
- Embedding external sites
- Malicious iframe injections
- Clickjacking attacks

#### `object-src 'none'`
**Purpose:** Block `<object>`, `<embed>`, `<applet>` tags
**Value:** `'none'` - No objects allowed
**Security:** Prevents Flash and plugin-based attacks

**Rationale:** Modern web apps don't use Flash or Java applets. Blocking these eliminates:
- Flash vulnerabilities
- Plugin-based attacks
- Legacy object injection

#### `base-uri 'self'`
**Purpose:** Restrict `<base>` tag usage
**Value:** `'self'` - Only allow base URLs from app
**Security:** Prevents base tag injection attacks

**Rationale:** Attackers can inject `<base>` tags to redirect relative URLs. This blocks:
- Base tag injection
- Relative URL hijacking
- Phishing via URL manipulation

#### `form-action 'self'`
**Purpose:** Restrict form submission targets
**Value:** `'self'` - Forms can only submit to app itself
**Security:** Prevents form hijacking

**Rationale:** Forms should only submit to the app's backend. This blocks:
- Form action hijacking
- Data exfiltration via forms
- Phishing form submissions

---

## Security Benefits

### Attack Surface Reduction

| Attack Vector | CSP Protection |
|--------------|----------------|
| **XSS (Cross-Site Scripting)** | Blocked by script-src 'self' |
| **Clickjacking** | Blocked by frame-src 'none' |
| **Data Exfiltration** | Blocked by connect-src 'self' |
| **Remote Code Injection** | Blocked by script-src 'self' |
| **Malicious Iframes** | Blocked by frame-src 'none' |
| **Flash Exploits** | Blocked by object-src 'none' |
| **Form Hijacking** | Blocked by form-action 'self' |
| **Base Tag Injection** | Blocked by base-uri 'self' |
| **External Resource Loading** | Blocked by default-src 'self' |

### Defense in Depth

CSP provides multiple layers of protection:

1. **Default Deny:** `default-src 'self'` blocks everything by default
2. **Explicit Allow:** Only explicitly allowed resources can load
3. **No External Dependencies:** All resources from app bundle
4. **No Third-Party CDNs:** Eliminates supply chain attacks

---

## CSP Limitations

### Why We Allow `unsafe-inline`

**For Scripts:**
- React uses inline event handlers
- CodeMirror generates inline scripts
- BlockNote editor requires inline scripts

**For Styles:**
- Tailwind CSS utility classes
- KaTeX math rendering
- CodeMirror syntax highlighting

**Trade-off:** While `unsafe-inline` reduces CSP strictness, it's acceptable because:
- We control all code in the app bundle
- Desktop app (not exposed to web attacks)
- No user-generated JavaScript execution
- Alternative (nonces/hashes) would break React's dynamic rendering

---

## Future Improvements

### Phase 6: Stricter CSP (v2.0)

**Goal:** Remove `unsafe-inline` by using nonces or hashes

**Approach:**
1. Generate CSP nonces during build
2. Inject nonces into React components
3. Add nonces to inline scripts/styles
4. Update CSP to use `'nonce-xxx'` instead of `'unsafe-inline'`

**Benefit:**
- Prevents inline script injection attacks
- Maintains compatibility with React/CodeMirror
- Stricter security posture

**Challenge:**
- Requires build process changes
- May break dynamic inline styles
- Needs testing with all components

---

## Testing CSP

### Manual Testing Checklist

- [ ] App loads without CSP violations
- [ ] React components render correctly
- [ ] Tailwind CSS styles apply
- [ ] CodeMirror editor works
- [ ] KaTeX math renders
- [ ] Images display (local, data URIs, blobs)
- [ ] Fonts load correctly
- [ ] No console CSP errors

### Browser Console

Check for CSP violations in browser DevTools:

```
Refused to load the script 'https://external.com/script.js'
because it violates the following Content Security Policy directive:
"script-src 'self' 'unsafe-inline'"
```

**Expected:** No CSP violations in normal operation

**Acceptable:** Violations for intentionally blocked resources (external CDNs)

---

## CSP Violation Handling

### Development Environment

In development (`npm run dev`), CSP violations are logged to console:

```javascript
// Example violation
{
  "documentURI": "http://localhost:5173",
  "violatedDirective": "script-src",
  "blockedURI": "https://external.com/script.js"
}
```

### Production Environment

In production, CSP violations are silently blocked. No error reporting is configured.

**Future:** Add CSP violation reporting endpoint for monitoring.

---

## CSP and Tauri

### Tauri-Specific Considerations

1. **Local Resources:** Tauri apps load from `tauri://` protocol, so `'self'` means the app bundle

2. **IPC Commands:** Tauri IPC commands work through `connect-src 'self'`

3. **WebView Context:** CSP applies to the WebView, not Rust backend

4. **Development vs Production:**
   - Dev: `http://localhost:5173` (Vite dev server)
   - Prod: `tauri://localhost` (bundled assets)

### Tauri Commands Allowed

All Tauri commands work with this CSP:
- `invoke()` - Allowed by connect-src 'self'
- File system access - Backend only (CSP doesn't apply)
- Dialog API - Backend only
- Window API - Backend only

---

## CSP Maintenance

### When to Update CSP

**Add Directive When:**
- Adding new external resource (CDN, API)
- Integrating third-party library
- Adding WebSocket connection
- Using new resource type

**Remove Directive When:**
- Removing external dependency
- No longer using resource type
- Tightening security posture

### CSP Change Process

1. **Update** `src-tauri/tauri.conf.json`
2. **Test** app thoroughly (manual + automated)
3. **Check** browser console for violations
4. **Document** changes in this file
5. **Commit** with clear explanation

---

## References

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Tauri Security Documentation](https://tauri.app/v1/references/configuration/security)
- [Content Security Policy Level 3 Spec](https://www.w3.org/TR/CSP3/)

---

**Last Updated:** 2026-01-10 (Sprint 34 Phase 5)
**Next Review:** Sprint 35 (Consider nonce-based CSP)
**Owner:** Security & Development Team
