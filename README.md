# Smart Bookmarks - Bookmark Manager with Google OAuth

A modern bookmark management application built with Next.js 16, Supabase, and TypeScript. Manage your bookmarks with Google Sign-In and organize them by categories.

## Features

- **Google OAuth Authentication** - Sign in securely with your Google account
- **Bookmark Management** - Add, edit, delete, and organize bookmarks
- **Category Organization** - Organize bookmarks by categories
- **Search Functionality** - Search bookmarks by title or URL
- **Favorites System** - Mark bookmarks as favorites
- **Real-time Updates** - Live updates using Supabase Realtime
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel

## Prerequisites

Before you begin, make sure you have:

1. A [Supabase account](https://supabase.com)
2. A [Google Cloud project](https://console.cloud.google.com) with OAuth credentials
3. A [Vercel account](https://vercel.com) for deployment
4. Node.js 18+ and npm/pnpm installed locally

## Quick Start - Local Development

### 1. Clone and Install

```bash
git clone https://github.com/Nagasurya07/smartbookmarks.git
cd smartbookmarks
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://app.supabase.com
2. Go to SQL Editor and run this script:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_category_idx ON bookmarks(category);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials:
   - Click "Create Credentials" → "OAuth client ID" → "Web application"
   - Add authorized redirect URIs:
     - Local: `http://localhost:3000/auth/callback`
     - Production: `https://YOUR_VERCEL_DOMAIN/auth/callback`
3. Copy **Client ID** and **Client Secret**
4. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable "Enable Sign in with Google"
   - Paste Client ID and Client Secret
   - Save

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard → Project Settings → API

### 5. Run Locally

```bash
npm run dev
# Visit http://localhost:3000
```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Step 2: Deploy

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository (`Nagasurya07/smartbookmarks`)
4. Configure:
   - Framework: **Next.js** (auto-detected)
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
5. Click "Deploy"

Vercel will provide your live URL, e.g., `https://smartbookmarks-xyz.vercel.app`

### Step 3: Update Google OAuth

**IMPORTANT** - After deployment, update Google OAuth settings:

1. In Google Cloud Console:
   - Edit your OAuth Client ID
   - Add redirect URI: `https://YOUR_VERCEL_DOMAIN/auth/callback`
   - Save

2. Verify Supabase has your new domain in Google provider settings

### Step 4: Test

1. Visit your Vercel URL
2. Click "Continue with Google"
3. After login, you should be redirected to `/dashboard`
4. Test creating a bookmark

## API Endpoints

All endpoints require authentication (Supabase session).

### Authentication

- `GET /api/auth/user` - Get current user information
- `POST /api/auth/signout` - Sign out the user
- `GET /api/debug/session` - Debug current session (shows cookies, user, session state)

### Bookmarks

- `GET /api/bookmarks` - Get all user bookmarks
- `POST /api/bookmarks` - Create new bookmark
- `PATCH /api/bookmarks` - Update bookmark (e.g., toggle favorite)
- `DELETE /api/bookmarks` - Delete bookmark

## Project Structure

```
smartbookmarks/
├── app/
│   ├── api/
│   │   ├── auth/user/route.ts      # Get current user
│   │   ├── auth/signout/route.ts   # Sign out
│   │   ├── bookmarks/route.ts      # Bookmark CRUD
│   │   └── debug/session/route.ts  # Debug endpoint
│   ├── auth/
│   │   ├── callback/route.ts       # OAuth callback
│   │   ├── login/page.tsx          # Login page
│   │   └── login/login-content.tsx # Login form
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Styles
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── add-bookmark-modal.tsx      # Add bookmark modal
│   └── bookmark-card.tsx           # Bookmark card
├── lib/supabase/
│   ├── client.ts                   # Browser client
│   ├── server.ts                   # Server client
│   └── proxy.ts                    # Proxy config
├── middleware.ts                   # Session management
├── next.config.mjs                 # Next.js config
└── package.json
```

## Key Files Explained

- **`middleware.ts`** - Handles session authentication across all routes
- **`app/auth/callback/route.ts`** - Processes OAuth callback, exchanges code for session, redirects to dashboard
- **`app/dashboard/page.tsx`** - Main app, checks user auth and displays bookmarks
- **`lib/supabase/server.ts`** - Server-side Supabase client with cookie handling
- **`lib/supabase/client.ts`** - Client-side Supabase client for browser

## Troubleshooting

### Login doesn't redirect to dashboard

**Check 1: Browser Console**
- Open DevTools (F12) → Console tab
- Look for errors starting with `[v0]`

**Check 2: Session Debug**
- Visit: `https://YOUR_DOMAIN/api/debug/session`
- This shows if user session exists and which cookies are set

**Check 3: Environment Variables**
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify both variables are set correctly:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Check 4: Google OAuth Configuration**
- Verify redirect URI in Google Cloud Console matches your Vercel domain
- In Supabase → Auth → Providers → Google, verify credentials are saved
- Test with: `https://YOUR_DOMAIN/auth/callback`

### "This site can't be reached" error

**Cause**: OAuth callback URL not registered

**Solution**:
1. Add your Vercel domain to Google Cloud Console OAuth redirect URIs
2. Add same domain to Supabase Google provider if needed
3. Clear browser cookies and try again

### "Unauthorized" error on dashboard

**Solution**:
1. Check `/api/debug/session` - should show a user
2. Clear cookies (DevTools → Application → Cookies → Delete all)
3. Try logging in again
4. Check Vercel logs for server errors

### Can't see user name on dashboard

**Cause**: Incorrect user metadata field

**Solution**: The app looks for name in:
1. `user_metadata.name` (from Google)
2. `email` prefix
3. Falls back to "User"

This is set in `app/dashboard/page.tsx` in `fetchUserData`

## Environment Variables Guide

| Variable | Required | Where to Get |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Settings → API → anon key |

**Important**: Variables with `NEXT_PUBLIC_` prefix are exposed to browser (this is safe).

## Debug Commands

### Check Session via API
```bash
curl https://YOUR_DOMAIN/api/debug/session
```

### Check User Info
```bash
curl https://YOUR_DOMAIN/api/auth/user
```

### View Vercel Logs
Visit: https://vercel.com/dashboard → Select project → Deployments → Select deployment → Logs

### View Supabase Logs
Go to: Supabase Dashboard → Logs

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "process.env.NEXT_PUBLIC_SUPABASE_URL is undefined" | Env vars not set | Add to Vercel project settings |
| Login button does nothing | Supabase URL/Key wrong | Verify in env vars |
| Redirect to login instead of dashboard | No session | Check `/api/debug/session` |
| Google login fails | OAuth URI mismatch | Update Google Cloud Console & Supabase |
| Build fails with TypeScript errors | Type issues | Check console logs |

## Performance & Security

- **Session Management**: Middleware handles auth on every request
- **Row Level Security**: All data filtered by user_id at database level
- **Secure Cookies**: Session cookies are HTTP-only and secure
- **Real-time Updates**: Supabase Realtime subscriptions for live changes
- **Code Splitting**: Automatic route-based code splitting

## Next Steps

After successful deployment:
1. Invite team members
2. Set up custom domain (optional)
3. Configure Supabase backups
4. Monitor Vercel Analytics
5. Set up error tracking (e.g., Sentry)

## Support & Resources

- **Vercel Logs**: https://vercel.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Debug Session**: Visit `/api/debug/session` on your deployed app

## Project Info

- **Repository**: https://github.com/Nagasurya07/smartbookmarks
- **Vercel Project ID**: prj_moVWOrkgGnXOB9EoQ3L32WKddiqw
- **Status**: Production Ready

