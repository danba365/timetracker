# Manual Deployment Guide (Drag & Drop)

This guide walks you through deploying TimeTracker manually to Netlify with Supabase.

## ✅ Complete Checklist

### Phase 1: Supabase Setup (10 minutes)

- [ ] **1.1** Go to [https://supabase.com](https://supabase.com)
- [ ] **1.2** Sign up/Sign in
- [ ] **1.3** Click "New Project"
- [ ] **1.4** Fill in:
  - Name: TimeTracker
  - Database Password: (save it!)
  - Region: (choose closest)
- [ ] **1.5** Click "Create new project"
- [ ] **1.6** Wait 2-3 minutes for provisioning
- [ ] **1.7** Go to "SQL Editor" in left sidebar
- [ ] **1.8** Click "New query"
- [ ] **1.9** Copy contents of `supabase-schema.sql`
- [ ] **1.10** Paste and click "Run"
- [ ] **1.11** Verify success message
- [ ] **1.12** Go to Settings → API
- [ ] **1.13** Copy "Project URL"
- [ ] **1.14** Copy "anon public" key

**✅ Supabase Ready!**

---

### Phase 2: Configure & Build (5 minutes)

- [ ] **2.1** Open project folder in Finder/Explorer
- [ ] **2.2** Open `.env` file (or create it)
- [ ] **2.3** Add these lines:
  ```env
  VITE_SUPABASE_URL=your_project_url_here
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```
- [ ] **2.4** Replace with your actual Supabase credentials
- [ ] **2.5** Save the `.env` file
- [ ] **2.6** Open Terminal/Command Prompt
- [ ] **2.7** Navigate to project folder:
  ```bash
  cd "/Users/danb/Documents/PROJECTS/TEST_PROJECTS/Personal Management Time"
  ```
- [ ] **2.8** Run build command:
  ```bash
  npm run build
  ```
- [ ] **2.9** Wait for "built in" success message
- [ ] **2.10** Verify `dist` folder exists

**✅ Build Complete!**

---

### Phase 3: Netlify Deployment (3 minutes)

- [ ] **3.1** Go to [https://app.netlify.com](https://app.netlify.com)
- [ ] **3.2** Sign up/Sign in
- [ ] **3.3** Scroll to "Want to deploy a new site without connecting to Git?"
- [ ] **3.4** Find the drag & drop area
- [ ] **3.5** Open Finder/Explorer
- [ ] **3.6** Navigate to project folder
- [ ] **3.7** Find the `dist` folder
- [ ] **3.8** **Drag the entire `dist` folder** to Netlify
- [ ] **3.9** Wait 10-30 seconds for upload
- [ ] **3.10** Copy your new site URL (e.g., `https://random-name.netlify.app`)

**✅ Site Deployed!**

---

### Phase 4: Test Your Deployment (2 minutes)

- [ ] **4.1** Visit your Netlify URL
- [ ] **4.2** Test creating a task
- [ ] **4.3** Test editing a task
- [ ] **4.4** Test deleting a task
- [ ] **4.5** Test switching views (Daily/Weekly/Monthly)
- [ ] **4.6** Test language switch (EN ↔ HE)
- [ ] **4.7** Test drag & drop (Weekly view)
- [ ] **4.8** Refresh page and verify data persists

**✅ Everything Works!**

---

## 🎯 Quick Reference

### Your Credentials

**Supabase:**
- Project URL: `_______________________`
- Anon Key: `_______________________`
- Dashboard: https://app.supabase.com

**Netlify:**
- Site URL: `_______________________`
- Dashboard: https://app.netlify.com

### Key Files

- **`.env`** - Your Supabase credentials (local only)
- **`dist/`** - Built files to upload to Netlify
- **`supabase-schema.sql`** - Database setup script

### Important Commands

```bash
# Build the project
npm run build

# Preview locally before deploying
npm run preview
```

---

## 🔄 Updating Your Site

When you make changes to your code:

1. **Make your changes** to the source code
2. **Rebuild**:
   ```bash
   npm run build
   ```
3. **Go to Netlify dashboard**
4. **Click on your site**
5. **Go to "Deploys" tab**
6. **Drag the new `dist` folder** to the drop zone
7. **Wait 10-30 seconds**
8. **Refresh your site** to see changes

---

## 🎨 Customizing Your Site

### Change Site Name (Netlify)

1. Go to your Netlify site dashboard
2. Click "Site settings"
3. Click "Change site name"
4. Enter your preferred name
5. Your new URL: `https://your-name.netlify.app`

### Add Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In Netlify, go to "Domain settings"
3. Click "Add custom domain"
4. Follow instructions to update DNS records
5. Wait for DNS propagation (can take 24 hours)

---

## ❗ Troubleshooting

### Problem: "Failed to fetch" errors

**Solution:**
1. Check your `.env` file has correct Supabase credentials
2. Rebuild: `npm run build`
3. Re-upload `dist` folder to Netlify

### Problem: Tasks not saving

**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Verify Supabase project is active (not paused)
4. Check Supabase → Logs for errors

### Problem: Blank page after deployment

**Solution:**
1. Verify `dist` folder contains files
2. Check `dist/_redirects` file exists
3. In Netlify dashboard, check "Deploy log" for errors
4. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Problem: 404 on page refresh

**Solution:**
The `_redirects` file should handle this. If not:
1. In Netlify dashboard → Site settings
2. Build & deploy → Post processing
3. Add redirect rule: `/*` → `/index.html` (200)

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ You can create tasks and they save
✅ You can refresh the page and tasks remain
✅ You can switch between views
✅ You can drag and drop tasks
✅ Language switching works
✅ All features work on mobile

---

## 📞 Need Help?

- **Supabase Issues**: Check [https://supabase.com/docs](https://supabase.com/docs)
- **Netlify Issues**: Check [https://docs.netlify.com](https://docs.netlify.com)
- **App Issues**: Check browser console (F12) for errors

---

## 🚀 You're All Set!

Your TimeTracker app is now:
- ✅ Running on Netlify
- ✅ Connected to Supabase
- ✅ Accessible from anywhere
- ✅ Ready to use!

**Share your site URL with friends and family!** 🎊

---

**Pro Tip:** Bookmark your Netlify dashboard URL so you can easily re-deploy updates later!

