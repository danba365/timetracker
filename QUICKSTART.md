# Quick Start Guide

Get your TimeTracker app running in under 5 minutes!

## Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works great)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Name it "TimeTracker" and choose a password
4. Select your region
5. Click "Create new project"

### Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy everything from `supabase-schema.sql`
4. Paste and click **Run**
5. You should see: "Success. No rows returned"

### Get Your API Keys

1. Go to **Settings** (gear icon)
2. Click **API**
3. Copy:
   - Project URL
   - anon public key

## Step 3: Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials.

## Step 4: Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Create Your First Task

1. Click **"Add Task"** button in the sidebar
2. Fill in:
   - Title: "My First Task"
   - Date: Today
   - Category: Personal
   - Priority: Medium
3. Click **Save**

Congratulations! Your task is now saved in the cloud! 🎉

## Quick Tips

### Navigation
- Use the **Daily**, **Weekly**, **Monthly** tabs to switch views
- Click **Previous** / **Next** to navigate dates
- Click **Today** to jump to today

### Task Management
- Click any task to edit it
- Click the checkbox to mark complete
- Drag tasks to different days (in Weekly view)

### Language
- Click **EN** / **HE** button to switch languages
- The entire UI will flip to RTL for Hebrew

### Mobile
- The app automatically adapts to mobile
- Use the bottom navigation bar
- Swipe to scroll through weeks/days

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
- Check your `.env` file has the correct credentials
- Verify your Supabase project is active (not paused)
- Make sure you ran the SQL schema

### Tasks not saving
- Open browser DevTools (F12)
- Check Console for error messages
- Verify your Supabase URL and key are correct

### Blank screen
- Check browser console for errors
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Verify `.env` file exists and has correct values

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Check [FEATURES.md](FEATURES.md) to see what's implemented
- Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production

## Need Help?

- Check the [README.md](README.md) troubleshooting section
- Review Supabase logs in your dashboard
- Open an issue on GitHub

Happy planning! ✨

