# TimeTracker - Personal Weekly Planner

A bilingual (English/Hebrew) personal weekly planner web application that helps users organize their daily tasks with time management, categories, and priority tracking.

## Features

- ✅ **Multiple Views**: Daily, Weekly, and Monthly calendar views
- 🎯 **Task Management**: Create, edit, delete, and organize tasks
- 🏷️ **Categories**: Color-coded categories for better organization
- ⏰ **Time Slots**: Schedule tasks with specific time slots (30min or 1hour)
- 🔁 **Recurring Tasks**: Support for daily, weekly, and custom recurring tasks
- 🌐 **Bilingual**: Full support for English and Hebrew with RTL layout
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 💾 **Auto-save**: All changes automatically saved to the cloud

## Tech Stack

### Frontend
- React 18 with TypeScript
- CSS Modules for styling
- React Context API for state management
- @dnd-kit for drag-and-drop functionality
- date-fns for date manipulation
- react-i18next for internationalization

### Backend
- Supabase (PostgreSQL database)
- Real-time data synchronization
- Row Level Security disabled for public access

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Personal Management Time"
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project:
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

4. Set up the database schema:

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  duration INTEGER,
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'done')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20),
  recurrence_days INTEGER[],
  recurrence_end_date DATE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- Disable RLS (as per requirements - public access)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

5. Configure environment variables:

Copy the `.env.example` file to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase URL and anon key:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in your Supabase project settings under "API".

6. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Deployment

### Deploying to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploying to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard.

## Usage

### Creating a Task

1. Click the "Add Task" button in the sidebar or mobile bottom nav
2. Fill in the task details:
   - Title (required)
   - Description
   - Date
   - Start time (optional)
   - Duration (30min or 1hour)
   - Category
   - Priority (Low, Medium, High)
   - Tags
   - Recurrence settings (optional)
3. Click "Save"

### Managing Categories

Default categories are created automatically on first load:
- Personal (Blue)
- Work (Green)
- Health (Red)
- Learning (Purple)

You can add more categories through the settings panel.

### Views

- **Weekly View**: See all tasks for the current week in a 7-column grid
- **Daily View**: See tasks for a single day with hourly timeline
- **Monthly View**: Calendar overview with task indicators

### Drag and Drop

In the weekly view, you can drag tasks between different days to reschedule them.

### Language Switching

Click the language toggle button in the header to switch between English and Hebrew. The layout automatically adjusts to RTL (right-to-left) for Hebrew.

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components
│   ├── task/            # Task-related components
│   └── views/           # View components (Daily, Weekly, Monthly)
├── context/             # React Context for global state
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization files
├── services/            # API services
├── styles/              # Global styles and variables
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
