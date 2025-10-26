# 🤖 AI Project Generator Setup Guide

## ✅ What's Been Done

The AI Project Generator has been successfully integrated into your TimeTracker app! Here's what was added:

### 1. **Netlify Serverless Function** 
   - `netlify/functions/generate-project.ts` - Securely calls OpenAI API
   - Keeps your API key safe on the server

### 2. **Frontend Components**
   - `AIProjectGenerator` component - Beautiful AI generation UI
   - Updated `ProjectsView` with "✨ AI Generate" button
   - Updated `ProjectForm` to accept AI-generated data

### 3. **Services**
   - `aiProjectService.ts` - Communicates with the Netlify function
   - Automatic fallback if API key not configured

### 4. **Translations**
   - Full English & Hebrew support for all AI features

## 🔑 STEP 1: Add Your OpenAI API Key to Netlify

**Note:** Use your own OpenAI API key from https://platform.openai.com/api-keys

### Option A: Via Netlify Web Dashboard (Recommended)

1. **Go to your Netlify dashboard:**
   https://app.netlify.com/sites/stirring-souffle-c6bc1a/settings/deploys

2. **Navigate to Environment Variables:**
   - Click on "Site configuration" in the left sidebar
   - Click on "Environment variables"
   - Or go directly to: https://app.netlify.com/sites/stirring-souffle-c6bc1a/settings/env

3. **Add the API Key:**
   - Click "Add a variable"
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `your-openai-api-key-here`
   - Select scope: "Same value for all deploy contexts"
   - Click "Create variable"

4. **Redeploy (Important!):**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"
   - Wait for the new deployment to finish

### Option B: Via Netlify CLI

```bash
netlify env:set OPENAI_API_KEY "your-openai-api-key-here"

# Then redeploy
netlify deploy --prod --dir=dist
```

## 🚀 STEP 2: How to Use the AI Generator

1. **Go to your app:** https://stirring-souffle-c6bc1a.netlify.app

2. **Navigate to Projects:**
   - Click "🚀 Projects" in the sidebar

3. **Click "✨ AI Generate"**

4. **Describe your project in natural language:**
   Examples:
   - "Learn React and build a full-stack web application"
   - "Train for a 5K run in 8 weeks"
   - "Read and summarize Atomic Habits book"
   - "Complete an online Python programming course"

5. **AI will generate:**
   - Project title
   - Detailed description
   - 5-15 structured tasks
   - Suggested icon and project type
   - Recommended tasks per week
   - Task durations

6. **Review and customize:**
   - Edit any field
   - Adjust task count or durations
   - Choose whether to use AI scheduling
   - Save the project

## 📊 What the AI Considers

The AI takes into account:
- **Your preferences** (if configured):
  - Available days and time slots
  - Max tasks per day
  - Preferred task duration
  
- **Project complexity:**
  - Creates more tasks for complex projects
  - Adjusts durations based on activity type
  
- **Logical progression:**
  - Orders tasks from foundational to advanced
  - Groups related activities

## 🎯 Example Prompts That Work Well

**Learning Projects:**
- "Master TypeScript by building 5 real-world projects"
- "Complete Harvard CS50 course over 12 weeks"
- "Learn data structures and algorithms for coding interviews"

**Fitness Projects:**
- "Build muscle with a 10-week strength training program"
- "Train for my first triathlon"
- "Develop a daily yoga practice for 30 days"

**Creative Projects:**
- "Write a 50,000-word novel in 3 months"
- "Learn portrait photography and build a portfolio"
- "Create a 12-episode podcast series"

**Business Projects:**
- "Launch a side business selling handmade products"
- "Build my personal brand on LinkedIn"
- "Create a comprehensive business plan for my startup"

## 💰 OpenAI API Costs

**GPT-4o-mini** (currently configured - very affordable):
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- **Average cost per project generation: $0.001 - $0.003** (less than a penny!)

**Optional: Upgrade to GPT-4** (better quality):
- Edit `netlify/functions/generate-project.ts`
- Change `model: 'gpt-4o-mini'` to `model: 'gpt-4'`
- Cost: ~$0.03 per generation (3 cents)

## 🔧 Troubleshooting

### "Failed to generate project"
1. Check that the API key is set in Netlify
2. Verify you redeployed after adding the key
3. Check Function logs: https://app.netlify.com/projects/stirring-souffle-c6bc1a/logs/functions

### "API key not configured"
- The environment variable wasn't set correctly
- Follow STEP 1 again carefully

### Response is cut off
- Increase `max_tokens` in `netlify/functions/generate-project.ts` (currently 2000)

### AI responses are too generic
- Be more specific in your prompt
- Mention your skill level, time commitment, specific goals
- Example: "I'm a beginner wanting to learn React. I have 5 hours per week and want to build 3 projects"

## 🎨 Customization Options

### Change AI Model
Edit `netlify/functions/generate-project.ts`:
```typescript
model: 'gpt-4o-mini', // Change to: 'gpt-4', 'gpt-4-turbo', etc.
```

### Adjust Response Length
```typescript
max_tokens: 2000, // Increase for longer responses
```

### Modify AI Instructions
Edit the system prompt in `generate-project.ts` to change how the AI generates projects.

## 📝 What Gets Sent to OpenAI

**Sent:**
- Your project description
- Your preferences (days, times, task limits)
- Request for structured JSON response

**NOT Sent:**
- Your existing tasks
- Personal information
- Any other data from your account

## 🔐 Security Notes

✅ **API Key is Safe:**
- Stored only in Netlify (server-side)
- Never exposed to frontend/browser
- Only accessible by your Netlify functions

✅ **Data Privacy:**
- Only your project descriptions are sent to OpenAI
- No personal task data is shared
- OpenAI's data usage policy: https://openai.com/policies/api-data-usage-policies

## 🎉 You're All Set!

Once you complete STEP 1 (adding the API key and redeploying), your AI Project Generator will be fully operational!

**Test it now:** https://stirring-souffle-c6bc1a.netlify.app

---

## 📚 Additional Resources

- OpenAI API Docs: https://platform.openai.com/docs
- Netlify Functions: https://docs.netlify.com/functions/overview
- Your Function Logs: https://app.netlify.com/projects/stirring-souffle-c6bc1a/logs/functions

