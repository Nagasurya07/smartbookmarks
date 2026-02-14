# Smart Bookmarks - Deployment Guide

## Overview
Smart Bookmarks is a modern web application built with Next.js 16 and Supabase for managing bookmarks with Google Sign-In authentication.

## Project Stack
- **Frontend**: Next.js 16 (React)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth via Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui components
- **Hosting**: Vercel

## Prerequisites
Before deploying, you need:
1. A GitHub repository (already set up at `github.com/Nagasurya07/smartbookmarks`)
2. A Vercel account (https://vercel.com)
3. A Supabase project (https://supabase.com)
4. Google OAuth credentials from Google Cloud Console

## Step 1: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Note your project credentials:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Public Anon Key**
   - **Service Role Key** (for backend operations)

3. Create the required database tables:
   ```sql
   -- Create bookmarks table
   CREATE TABLE bookmarks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     url TEXT NOT NULL,
     description TEXT,
     category TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to view their own bookmarks
   CREATE POLICY "Users can view their own bookmarks" ON bookmarks
     FOR SELECT USING (auth.uid() = user_id);

   -- Create policy for users to insert their own bookmarks
   CREATE POLICY "Users can create their own bookmarks" ON bookmarks
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Create policy for users to update their own bookmarks
   CREATE POLICY "Users can update their own bookmarks" ON bookmarks
     FOR UPDATE USING (auth.uid() = user_id);

   -- Create policy for users to delete their own bookmarks
   CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
     FOR DELETE USING (auth.uid() = user_id);
   ```

## Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (OAuth Consent Screen → Create Credentials)
5. Add authorized redirect URI: `https://[your-project].supabase.co/auth/v1/callback?provider=google`
6. Copy your **Client ID** and **Client Secret**
7. In Supabase, go to Authentication → Providers → Google
8. Enable Google and paste the Client ID and Client Secret

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import the GitHub repository `Nagasurya07/smartbookmarks`
4. Configure the project:
   - **Framework**: Next.js
   - **Root Directory**: `./` (default)
   - **Environment Variables**: Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-public-anon-key]
     ```

5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

## Step 4: Environment Variables

Make sure these environment variables are set in Vercel:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |

**Note**: The `NEXT_PUBLIC_` prefix makes these variables accessible in the browser. Keep the keys public as they're meant to be client-side safe.

## Step 5: Verify Deployment

1. After deployment completes, Vercel will show your live URL
2. Visit the URL and you should see the login page
3. Click "Continue with Google" and complete the authentication flow
4. You should be redirected to the dashboard

## Local Development

To run the app locally:

```bash
# Install dependencies
npm install

# Create .env.local file with your Supabase credentials
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-public-anon-key]
EOF

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Project Structure

```
smart-bookmarks/
├── app/
│   ├── auth/
│   │   ├── login/              # Login page with Google OAuth
│   │   └── callback/           # OAuth callback handler
│   ├── dashboard/              # Main application pages
│   ├── api/                    # API routes
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── [app-components]/       # Application-specific components
├── lib/
│   └── supabase/
│       ├── client.ts           # Supabase client for browser
│       └── server.ts           # Supabase client for server
├── public/                     # Static assets
├── package.json                # Dependencies
├── next.config.mjs             # Next.js configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

## Troubleshooting

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not set"
**Solution**: Make sure you've added the environment variables to Vercel project settings.

### Issue: Google OAuth fails
**Solution**: 
- Verify the redirect URI in Google Cloud Console matches your Vercel domain
- Check that Google provider is enabled in Supabase
- Ensure Client ID and Secret are correct in Supabase

### Issue: Build fails with Turbopack error
**Solution**: The next.config.mjs has `experimental: { turbo: false }` to disable Turbopack. This is intentional.

### Issue: RLS policy errors
**Solution**: Make sure all database tables have proper RLS policies enabled. Users can only access their own data.

## Performance Tips

1. **Caching**: The app uses SWR for client-side data fetching with automatic caching
2. **Images**: All images are optimized using Next.js Image component
3. **Code Splitting**: Components are code-split automatically by Next.js

## Security Considerations

1. **Never commit `.env.local`** - Use Vercel's environment variable settings
2. **Row Level Security (RLS)** - Enabled on all user data tables in Supabase
3. **OAuth Tokens** - Handled securely by Supabase
4. **CORS** - Configured for your Vercel domain

## Next Steps

After deployment:
1. Test the login flow with a Google account
2. Create bookmarks and verify they're saved
3. Monitor application logs in Vercel dashboard
4. Set up monitoring and error tracking (optional)

## Support

For issues or questions:
- Check Vercel logs: https://vercel.com/dashboard
- Check Supabase logs: https://app.supabase.com
- Review Next.js docs: https://nextjs.org

## Deployment Status

**Current Deployment**: Vercel (deploy-to-vercel branch)
**Vercel Project ID**: prj_moVWOrkgGnXOB9EoQ3L32WKddiqw

To view your deployment status and metrics, visit the Vercel dashboard.
