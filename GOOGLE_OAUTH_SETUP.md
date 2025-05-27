# Google OAuth Setup Guide (Simplified)

This guide shows you how to set up Google OAuth authentication with Clerk. The setup depends on whether you're using a **development** or **production** instance.

## Understanding Development vs Production

### 🟢 **Development Instances**
- Clerk provides **built-in shared OAuth credentials**
- **"Use custom credentials" toggle can be turned OFF**
- No Google Cloud Console setup needed
- Works immediately with zero configuration

### 🔴 **Production Instances** 
- **"Use custom credentials" MUST be ON** (cannot be turned off)
- Custom Google Cloud Console setup is **required**
- You must provide your own Google OAuth credentials

## Why Can't I Turn Off "Use Custom Credentials"?

If you **cannot turn off** the "Use custom credentials" toggle, it means you're working with a **production instance**. Clerk **requires** custom credentials for production apps for security and reliability reasons.

## Setup Instructions

### Option 1: Development Instance (Easiest - Zero Config)

If you're still in development and want the simplest setup:

1. **Use your development instance** (not production)
2. Go to **"User & Authentication"** → **"Social Connections"**
3. Find **"Google"** and click **"Configure"**
4. Toggle **"Enable for sign-up and sign-in"** ON
5. Leave **"Use custom credentials"** OFF (should be default)
6. Click **"Save"**

**Benefits:**
- ✅ No Google Cloud Console setup required
- ✅ No custom credentials to manage
- ✅ Works immediately
- ✅ Perfect for development and testing

### Option 2: Production Instance (Custom Credentials Required)

If you're using a production instance or the toggle cannot be turned off:

#### Step 1: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **"APIs & Services"** → **"Library"**
4. Search for and enable **"Google+ API"**
5. Go to **"APIs & Services"** → **"OAuth consent screen"**
6. Configure your OAuth consent screen:
   - Choose **"External"** user type
   - Fill in app name, user support email, developer contact
   - Add your domain to authorized domains
7. Go to **"APIs & Services"** → **"Credentials"**
8. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
9. Choose **"Web application"**
10. Add **Authorized JavaScript origins**:
    - `https://your-domain.com`
    - `https://www.your-domain.com` (if applicable)
11. Add **Authorized redirect URI** (get this from Clerk Dashboard):
    - `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
12. Click **"Create"** and save the **Client ID** and **Client Secret**

#### Step 2: Configure in Clerk Dashboard

1. Go to **"User & Authentication"** → **"Social Connections"**
2. Find **"Google"** and click **"Configure"**
3. Toggle **"Enable for sign-up and sign-in"** ON
4. **"Use custom credentials"** will be ON (cannot be turned off)
5. Enter your Google **Client ID** and **Client Secret**
6. Click **"Save"**

## Your Application Code (Already Implemented)

Your application already has Google OAuth integration implemented:

### ✅ Sign-In Page (`app/sign-in/[[...sign-in]]/page.tsx`)
```typescript
const handleGoogleSignIn = async () => {
  if (!isLoaded) return;
  try {
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: searchParams.get('redirect_url') || "/",
    });
  } catch (err: any) {
    console.error(err);
    showAlert("Error signing in with Google", "error");
  }
};
```

### ✅ Sign-Up Page (`app/sign-up/[[...sign-up]]/page.tsx`)
```typescript
const handleGoogleSignUp = async () => {
  if (!isLoaded) return;
  try {
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  } catch (err: any) {
    console.error(err);
    showAlert("Error signing up with Google", "error");
  }
};
```

### ✅ SSO Callback Page (`app/sso-callback/page.tsx`)
Handles OAuth redirects with beautiful loading UI.

### ✅ Webhook Integration (`app/api/webhooks/clerk/route.ts`)
Automatically creates database profiles for Google OAuth users.

## Testing Your Setup

### Test Sign-Up with Google
1. Go to `/sign-up`
2. Click **"Continue with Google"**
3. Complete Google OAuth flow
4. Verify you're redirected to home page
5. Check your database - profile should be auto-created

### Test Sign-In with Google
1. Go to `/sign-in`
2. Click **"Continue with Google"**
3. Complete Google OAuth flow
4. Verify you're signed in successfully

### Test Profile Management
1. Sign in with Google OAuth
2. Go to `/Profile`
3. Verify user data loads correctly
4. Test profile updates

## Environment Variables Required

You only need these 3 Clerk environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
CLERK_SECRET_KEY=sk_test_... (or sk_live_... for production)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Note:** No Google credentials needed in your `.env` file - they go in Clerk Dashboard.

## How It Works

1. **User clicks "Continue with Google"**
2. **Clerk redirects to Google OAuth** (using Clerk's built-in or your custom credentials)
3. **User authorizes your app with Google**
4. **Google redirects back to Clerk** with authorization code
5. **Clerk exchanges code for user data** and creates session
6. **User redirected to your app** via `/sso-callback`
7. **Clerk webhook fires** `user.created` event
8. **Your webhook handler** automatically creates database profile
9. **User lands on home page** with full account access

## Benefits of This Implementation

### ✅ **Dual Authentication Options**
- Email/password authentication
- Google OAuth authentication
- Users can choose their preferred method

### ✅ **Automatic Profile Creation**
- Webhook creates database profiles automatically
- No manual intervention required
- Consistent data structure for both auth methods

### ✅ **Seamless User Experience**
- One-click sign-up/sign-in with Google
- No password management needed
- Fast onboarding process

### ✅ **Production Ready**
- Proper error handling
- Loading states and feedback
- Security best practices

### ✅ **Backward Compatible**
- Existing email/password users unaffected
- All API endpoints work with both auth methods
- Gradual migration possible

## Troubleshooting

### "Use Custom Credentials" Cannot Be Turned Off
- **Cause:** You're using a production instance
- **Solution:** Follow Option 2 above to set up custom Google credentials
- **Alternative:** Switch to development instance if still in development phase

### Google OAuth Button Not Working
1. Check Clerk Dashboard - ensure Google is enabled
2. Check browser console for JavaScript errors
3. Verify Clerk publishable key is correct
4. Ensure custom credentials are properly configured (for production)

### User Profile Not Created
1. Check webhook logs in Clerk Dashboard
2. Verify webhook endpoint is accessible
3. Check your application logs for webhook events

### OAuth Flow Fails
1. Try incognito/private browsing mode
2. Check Clerk Dashboard logs for errors
3. Verify your domain configuration
4. Check Google Cloud Console redirect URIs

### "redirect_uri_mismatch" Error
1. Ensure redirect URIs in Google Cloud Console match Clerk's requirements
2. Check that domains are properly configured
3. Verify the redirect URI from Clerk Dashboard is correctly added to Google

## Recommendation

- **For Development:** Use Option 1 (built-in provider) for simplicity
- **For Production:** Use Option 2 (custom credentials) as it's required
- **Your application code is already perfectly set up** to work with either option!

## Important Notes

1. **Production instances require custom credentials** - this is a Clerk requirement
2. **Development instances can use built-in credentials** for easier testing
3. **Your code works with both setups** - no changes needed
4. **Google OAuth apps need "In production" status** for production use 