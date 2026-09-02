# 🏗️ Build System Guide

**Quick Reference for Development & Deployment**

---

## ⚡ Quick Start

### Development
```bash
# Install dependencies (first time only)
npm install

# Start dev server (with hot reload)
npm run dev

# Backend server (separate terminal)
npm run server:dev

# Both together
npm run dev:full
```

Open: **http://localhost:5173**

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Full build pipeline (build + optimize + verify)
npm run build:all
```

Preview at: **http://localhost:5000**

---

## 📝 Common Tasks

### Linting & Formatting

```bash
# Check for code issues
npm run lint

# Auto-fix code issues
npm run lint:fix

# Format all code (Prettier)
npm run format

# Check if code is formatted
npm run format:check

# Combined check (before commit)
npm run ci
```

### Testing

```bash
# Run Playwright tests
npm run test

# Run tests with browser visible
npm run test:headed

# Interactive test UI
npm run test:ui

# View test report
npm run test:report

# Run all tests + security
npm run test:all
```

### Build Verification

```bash
# Verify build is valid
npm run build:verify

# Analyze build size & compression
npm run optimize

# Check for security issues
npm run security:audit
```

---

## 📊 npm Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start Vite dev server (port 5173) |
| `build` | Production build (creates dist/) |
| `preview` | Preview build locally (port 5000) |
| `build:all` | Build + optimize + verify (full pipeline) |
| `build:verify` | Verify build completeness |
| `optimize` | Analyze build & get recommendations |
| `lint` | Run ESLint checks |
| `lint:fix` | Auto-fix ESLint issues |
| `format` | Format code with Prettier |
| `format:check` | Check formatting |
| `test` | Run Playwright tests |
| `test:headed` | Tests with browser window |
| `test:ui` | Interactive test runner |
| `test:report` | Show test report |
| `security:audit` | Run security checks |
| `ci` | Full CI validation (lint + build + test) |
| `dev:full` | Start frontend + backend |
| `server` | Start backend server |
| `server:dev` | Backend with auto-reload |

---

## 🔨 Build Process

### What Happens with `npm run build`

```
Vite Build Process:
├─ Parse HTML files (31 pages)
├─ Extract & process CSS
├─ Minify CSS
├─ Bundle JavaScript
├─ Minify JavaScript (Terser)
├─ Hash asset names (cache-busting)
├─ Organize output:
│  └─ dist/
│     ├─ index.html
│     ├─ about.html
│     ├─ ... (31 HTML files)
│     ├─ manifest.json
│     └─ assets/
│        ├─ js/
│        ├─ css/
│        ├─ images/
│        └─ fonts/
└─ Done!
```

### Build Output

```
dist/
├── 31 HTML files          (Original pages, minified)
├── manifest.json          (Asset map for Vite)
└── assets/
    ├── js/                (Minified, hashed JS)
    ├── css/               (Minified, hashed CSS)
    ├── images/            (Optimized images)
    └── fonts/             (Web fonts)
```

**Total Size:** Usually 2-4 MB  
**Time:** ~10-20 seconds  

---

## ✅ Quality Checks

### Before Committing

```bash
# 1. Format code
npm run lint:fix
npm run format

# 2. Verify quality
npm run lint
npm run format:check

# 3. Run tests
npm run test

# Or all at once:
npm run ci
```

### Before Deploying

```bash
# Full production build pipeline
npm run build:all

# Checks:
# ✓ ESLint validation
# ✓ Vite build
# ✓ Build verification
# ✓ Asset optimization
# ✓ Size analysis
```

---

## 🚀 Deployment

### Automatic (GitHub Actions)

1. **Push to main branch**
   - Runs all tests & linting
   - Builds production
   - Deploys to GitHub Pages

2. **Check status**
   - Visit: `github.com/hatsey-kaleb/hotel-website/actions`
   - Latest workflow shows status
   - Deployment URL provided when complete

### Manual (Local)

```bash
# 1. Make sure everything passes
npm run ci

# 2. Build for production
npm run build:all

# 3. Push to main
git push origin main

# 4. GitHub Actions handles deployment
# (Monitor in Actions tab)
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Port Already in Use

```bash
# Change port for dev
PORT=3000 npm run dev

# Change port for preview
npm run preview -- --port 4000

# Or kill the process
lsof -ti:5173 | xargs kill -9
```

### Linting Fails

```bash
# Auto-fix most issues
npm run lint:fix

# Format everything
npm run format

# Check what failed
npm run lint
```

### Tests Fail

```bash
# Run with visible browser
npm run test:headed

# Interactive UI
npm run test:ui

# View report
npm run test:report
```

### Module Not Found

```bash
# Reinstall and clear cache
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## 📁 Project Structure

```
/
├── index.html              Main page
├── rooms.html
├── booking.html
├── contact.html
├── ... (28 more HTML pages)
├── server.js               Backend API
├── vite.config.js          Build config
├── .eslintrc.json          Linting rules
├── .prettierrc.json        Format rules
├── package.json            Dependencies
├── .gitignore              Git exclusions
├── dist/                   Production build (created by npm run build)
├── assets/
│   ├── js/
│   ├── css/
│   ├── images/
│   └── fonts/
├── build-scripts/
│   ├── optimize.js         Build analyzer
│   └── verify-build.js     Build validator
└── .github/workflows/
    ├── ci.yml              CI pipeline
    └── deploy.yml          Deployment
```

---

## 💡 Tips

✅ **Keep dist/ out of git** (it's in .gitignore)
- Rebuild on every deployment
- Prevents merge conflicts

✅ **Use npm run dev** for development
- Hot reload on file changes
- Faster than rebuilding

✅ **Use npm run preview** to test production locally
- More realistic than dev
- Shows actual minified output

✅ **Run npm run ci before committing**
- Catches issues early
- Prevents broken builds

✅ **Check Actions tab after pushing**
- See all build/test results
- Download artifacts if needed

---

## 📚 Documentation

- **[PHASE_6A_BUILD_SYSTEM.md](PHASE_6A_BUILD_SYSTEM.md)** - Complete Phase 6A details
- **[.github/workflows/ci.yml](.github/workflows/ci.yml)** - CI pipeline definition
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - Deployment definition
- **[vite.config.js](vite.config.js)** - Vite build configuration
- **[.eslintrc.json](.eslintrc.json)** - ESLint rules
- **[.prettierrc.json](.prettierrc.json)** - Prettier formatting

---

## 🆘 Support

1. **Check the docs first**
   - This guide
   - PHASE_6A_BUILD_SYSTEM.md
   - README.md

2. **Run npm run ci**
   - Simulates CI pipeline
   - Shows any issues

3. **Check GitHub Actions**
   - `github.com/hatsey-kaleb/hotel-website/actions`
   - Detailed error messages

4. **Review error output**
   - ESLint: `npm run lint`
   - Tests: `npm run test`
   - Build: `npm run build`

---

**Happy Building!** 🚀
