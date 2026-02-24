# Documentation TODOs

## Screenshots & Media

### Theme Screenshots
- [ ] Capture individual theme screenshots in browser mode (`npm run dev:vite`)
- [ ] Browser mode keyboard simulation works more reliably than Tauri
- [ ] Create theme showcase composite image

### Animated Demos
- [ ] Use screen recording software (OBS, QuickTime) for GIF capture
- [ ] Record focus mode toggle animation
- [ ] Record theme switching demo
- [ ] Record command palette usage

## Technical Notes

### AppleScript + Tauri Limitation
Theme shortcuts (`⌘⌥+[1-0]`) don't trigger reliably via AppleScript keystroke simulation with Tauri apps. Workarounds:
1. Use Settings modal for theme changes
2. Use browser mode where JS keyboard events work
3. Use native screen recording software

---
*Added: 2025-12-31*
