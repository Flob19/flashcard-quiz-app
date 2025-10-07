# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

## 4. Run Database Migrations

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your-project-id`
4. Run migrations: `supabase db push`

Or manually run the SQL from `supabase/migrations/001_create_flashcard_tables.sql` in your Supabase SQL editor.

## 5. Test the Setup

1. Start the development server: `npm run dev`
2. Try creating a new flashcard set
3. Check your Supabase dashboard to see if data is being saved

## Features

- **Database Storage**: All flashcard sets are now stored in Supabase instead of localStorage
- **Fallback Support**: If Supabase is unavailable, the app falls back to localStorage
- **Real-time Sync**: Data is automatically synced across devices
- **Image Support**: Enhanced image upload with Cmd+V paste functionality
- **Image Viewer**: Click on any image to zoom, rotate, and navigate

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that your Supabase project is active
- Verify that the database tables were created successfully
- Check the browser console for any error messages
