# Useful Commands

Quick reference for all npm scripts and common commands.

## Development

### Start Development Server
```bash
npm run dev
```
- Starts Vite dev server
- Hot reload enabled
- Opens at http://localhost:5173

### Type Check
```bash
npm run build
```
- Runs TypeScript compiler
- Builds production bundle
- Output in `dist/` folder
- Shows any TypeScript errors

### Preview Production Build
```bash
npm run preview
```
- Preview the production build locally
- Runs after `npm run build`
- Opens at http://localhost:4173

## Database

### Initialize Supabase Database
```bash
# Copy the SQL and run in Supabase SQL Editor
cat supabase-schema.sql
```

## Code Quality

### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

### Format Code (if you add Prettier)
```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Dependencies

### Install All Dependencies
```bash
npm install
```

### Update Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Audit for Vulnerabilities
```bash
npm audit
npm audit fix
```

## Clean Up

### Remove node_modules
```bash
rm -rf node_modules
npm install
```

### Remove Build Files
```bash
rm -rf dist
```

### Complete Clean
```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

## Environment Variables

### View Current Environment
```bash
cat .env
```

### Set Environment Variables (Vercel)
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Set Environment Variables (Netlify)
```bash
netlify env:set VITE_SUPABASE_URL "your-value"
netlify env:set VITE_SUPABASE_ANON_KEY "your-value"
```

## Git (if you initialize a repo)

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit: Complete TimeTracker app"
```

### Add Remote and Push
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

### Create .gitignore (already created)
Already includes:
- node_modules
- dist
- .env files
- OS files

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear NPM Cache
```bash
npm cache clean --force
```

### Reinstall Everything
```bash
rm -rf node_modules package-lock.json
npm install
```

### Fix TypeScript Errors
```bash
npm run build
# Read errors and fix them
```

## Package Scripts (package.json)

All available scripts:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Common Workflows

### Daily Development
```bash
npm run dev
# Make changes
# Test in browser
# Commit when ready
```

### Before Committing
```bash
npm run build
# Fix any errors
git add .
git commit -m "Your message"
```

### Deploying Updates
```bash
npm run build
# Test with npm run preview
vercel --prod
# or
netlify deploy --prod --dir=dist
```

## Quick Links

- Dev Server: http://localhost:5173
- Preview Server: http://localhost:4173
- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Netlify Dashboard: https://app.netlify.com

## Notes

- All commands assume you're in the project root directory
- Windows users: Replace `rm -rf` with `rmdir /s /q` or use Git Bash
- Mac/Linux users: May need `sudo` for global installs

