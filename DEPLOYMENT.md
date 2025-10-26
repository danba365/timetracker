# Deployment Guide

This guide will walk you through deploying your TimeTracker application to production.

## Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- A Vercel or Netlify account for hosting
- The application code (completed)

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: TimeTracker (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for the database to be provisioned

### 1.2 Run the Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" or press Ctrl/Cmd + Enter
6. Verify the tables were created by checking the "Table Editor" section

### 1.3 Get Your API Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon) in the left sidebar
2. Click on "API" in the settings menu
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon public key** (under "Project API keys" → "anon public")

Keep these values handy for the next step.

## Step 2: Deploy to Vercel (Recommended)

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure your project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     - `VITE_SUPABASE_URL` = your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
6. Click "Deploy"

Your app will be live in 2-3 minutes!

### 2.3 Deploy via CLI

If you prefer the command line:

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - What's your project's name? timetracker
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase Anon Key when prompted

# Deploy to production
vercel --prod
```

## Step 3: Deploy to Netlify (Alternative)

### 3.1 Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### 3.2 Deploy via Netlify Dashboard

1. Go to [https://netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables:
   - Click "Show advanced"
   - Click "New variable"
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
6. Click "Deploy site"

### 3.3 Deploy via CLI

```bash
# From your project directory
netlify init

# Follow the prompts to create a new site

# Set environment variables
netlify env:set VITE_SUPABASE_URL "your-supabase-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## Step 4: Configure Custom Domain (Optional)

### On Vercel

1. Go to your project dashboard
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Follow the instructions to update your DNS records

### On Netlify

1. Go to your site dashboard
2. Click on "Domain settings"
3. Click "Add custom domain"
4. Follow the instructions to update your DNS records

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Test the following functionality:
   - Switch between Daily, Weekly, and Monthly views
   - Create a new task
   - Edit an existing task
   - Delete a task
   - Drag and drop tasks in Weekly view
   - Change task status (checkbox)
   - Switch language (EN ↔ HE)
   - Test responsive design on mobile

## Troubleshooting

### Build Fails

**Issue**: Build fails with "Cannot find module" errors
**Solution**: Make sure all dependencies are installed:
```bash
npm install
npm run build
```

### Supabase Connection Errors

**Issue**: "Failed to fetch" or connection errors
**Solution**: 
1. Verify your Supabase URL and Anon Key are correct
2. Check that the environment variables are set correctly in Vercel/Netlify
3. Ensure Row Level Security (RLS) is disabled on your tables

### Tasks Not Saving

**Issue**: Tasks appear to save but don't persist
**Solution**:
1. Check your browser console for errors
2. Verify your Supabase project is running (not paused)
3. Check the Supabase logs in the dashboard

### Blank Page After Deployment

**Issue**: App shows a blank page
**Solution**:
1. Check the browser console for errors
2. Verify environment variables are set
3. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Performance Optimization

### Enable Caching

Add a `vercel.json` or `netlify.toml` file for better caching:

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**netlify.toml:**
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Enable Compression

Both Vercel and Netlify automatically enable gzip/brotli compression. No additional configuration needed!

## Monitoring

### Vercel Analytics

1. Go to your project dashboard
2. Click on "Analytics" tab
3. Enable Vercel Analytics (free for hobby plans)

### Supabase Monitoring

1. Go to your Supabase project dashboard
2. Click on "Logs" to view database queries
3. Click on "Database" → "Usage" to monitor performance

## Security Notes

- The app is configured for **public access** (no authentication)
- Anyone with the URL can create, read, update, and delete tasks
- For production use with sensitive data, consider adding authentication
- Keep your Supabase database password secure
- Never commit your `.env` file to version control

## Need Help?

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- Netlify Docs: [https://docs.netlify.com](https://docs.netlify.com)
- Open an issue on the GitHub repository

## Next Steps

- Add authentication with Supabase Auth
- Implement real-time updates with Supabase subscriptions
- Add dark mode
- Implement data export (PDF/CSV)
- Add email notifications
- Create mobile native apps (React Native)

Congratulations! Your TimeTracker app is now live! 🎉

