# Nexus Desktop - Quick Start

> **Get up and running in under 2 minutes**

---

## 🚀 Installation (One-Time Setup)

### Method 1: Automatic Installation (Recommended)

```bash
cd ~/projects/dev-tools/nexus/nexus-desktop
./install.sh
```

That's it! The script will:
- ✅ Check Node.js & npm versions
- ✅ Install all dependencies
- ✅ Rebuild native modules
- ✅ Show you how to launch Nexus

---

## 🎯 Launching Nexus

### Method 1: Using npm (Simplest)

```bash
cd ~/projects/dev-tools/nexus/nexus-desktop
npm start
```

### Method 2: Using the launcher script

```bash
cd ~/projects/dev-tools/nexus/nexus-desktop
./nexus
```

### Method 3: Shell alias (Launch from anywhere)

**One-time setup:**
```bash
cd ~/projects/dev-tools/nexus/nexus-desktop
./setup-alias.sh
source ~/.zshrc  # or restart terminal
```

**Then from anywhere:**
```bash
nexus  # That's it!
```

---

## 📋 Quick Commands

| Command | Description |
|---------|-------------|
| `npm start` | Launch Nexus (same as `npm run dev`) |
| `npm test` | Run tests |
| `npm run test:ui` | Open test UI |
| `npm run build` | Build for production |
| `npm run typecheck` | Check TypeScript types |

---

## ⚡ Super Quick Reference

**First time?**
```bash
./install.sh        # Install dependencies
./setup-alias.sh    # Set up 'nexus' command
source ~/.zshrc     # Activate alias
nexus               # Launch!
```

**Already installed?**
```bash
nexus               # If alias is set up
# OR
npm start           # From project directory
```

---

## 🔧 Troubleshooting

### "Node.js not found"
Install Node.js 18+ from: https://nodejs.org/

### "better-sqlite3 module version mismatch"
```bash
npx electron-rebuild
```

### "Command not found: nexus"
Make sure you ran `./setup-alias.sh` and restarted your terminal.

### Database locked error
```bash
# Quit all Nexus instances, then:
rm ~/Library/Application\ Support/nexus-desktop/data/*.db-wal
rm ~/Library/Application\ Support/nexus-desktop/data/*.db-shm
```

---

## 📚 Next Steps

- **User Guide**: [GETTING-STARTED.md](GETTING-STARTED.md) - Complete features walkthrough
- **Features**: [README.md](README.md) - What Nexus can do
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) - Version history

---

## 💡 Pro Tips

1. **Keyboard Shortcuts**
   - `Cmd+K` - Focus search
   - `Cmd+N` - New note
   - `Cmd+Q` - Quit app

2. **Database Location**
   - `~/Library/Application Support/nexus-desktop/data/nexus.db`

3. **Dev Tools**
   - Press `Cmd+Option+I` to open DevTools (debug mode)

4. **Logs**
   - Main process: Terminal running `npm start`
   - Renderer: DevTools console

---

**That's it! You're ready to use Nexus. 🎉**

For the complete guide, see [GETTING-STARTED.md](GETTING-STARTED.md)
