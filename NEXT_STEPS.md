# Next Steps - Mission Control HUD

## Testing (Browser Mode)

- [ ] Test creating a new note (⌘N)
- [ ] Test the Settings modal (⌘, or click gear icon)
- [ ] Try the "Clear All Data" / "Restore Demo Data" in Settings → General → Browser Mode
- [ ] Check PWA install option in Chrome (address bar install icon)
- [ ] Test offline mode after PWA install

## Testing (Desktop Mode)

- [ ] Run `npm run dev` to test Tauri desktop mode
- [ ] Verify Claude/Gemini AI features work (desktop only)
- [ ] Test Obsidian sync functionality (desktop only)
- [ ] Compare behavior between browser and desktop modes

## PR & Merge

- [ ] Create PR from `feat/mission-control-hud` to `main`
- [ ] Review all commits in the branch
- [ ] Merge after approval

## Future Enhancements

- [ ] Add E2E tests with Playwright or Cypress
- [ ] Add more edge case tests for error handling
- [ ] Consider adding data export/import for browser mode
- [ ] Add service worker update notifications
- [ ] Improve PWA offline experience with better caching strategies

## Dev Server

Running on: `http://localhost:5180`
Start command: `npm run dev:vite -- --port 5180`

---
*Generated: 2025-12-28*
