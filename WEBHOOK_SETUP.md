# Clerk Webhook Setup Guide

This guide will help you set up Clerk webhooks to automatically sync user data with your database.

## 1. Add Environment Variable

Add this to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
```

## 2. Configure Webhook in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Webhooks** in the sidebar
3. Click **Add Endpoint**
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
   - For local development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
5. Select these events:
   - `user.created` ✅
   - `user.updated` ✅
   - `user.deleted` ✅
6. Copy the **Signing Secret** and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## 3. For Local Development (Using ngrok)

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal, expose your local server: `ngrok http 3000`
4. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
5. Use this URL in your Clerk webhook configuration: `https://abc123.ngrok.io/api/webhooks/clerk`

## 4. How It Works

### Before (Current Problem):
1. User signs up through Clerk
2. Data stored in sessionStorage
3. User redirected to Profile page
4. Profile page tries to read sessionStorage
5. Manual API call to create database record
6. **Issues**: sessionStorage unreliable, race conditions, data loss

### After (With Webhooks):
1. User signs up through Clerk ✅
2. Clerk automatically sends webhook to your server ✅
3. Webhook creates database record with complete user data ✅
4. User redirected to home page ✅
5. **Benefits**: Reliable, automatic, no data loss, server-side processing

## 5. What the Webhook Handles

- **user.created**: Automatically creates a new user profile in your database
- **user.updated**: Updates existing user profile when they change their info in Clerk
- **user.deleted**: Removes user profile from your database when account is deleted

## 6. Database Changes

The webhook implementation adds a `clerkId` field to your Client model to link Clerk users with your database records:

```typescript
clerkId: {
  type: String,
  unique: true,
  sparse: true,
  index: true
}
```

## 7. Testing

1. Sign up a new user through your app
2. Check your server logs - you should see webhook events
3. Verify the user profile was created in your database
4. The user should be able to access their profile immediately

## 8. Benefits

✅ **Reliable**: Server-to-server communication, no browser dependencies
✅ **Automatic**: No manual API calls needed
✅ **Complete Data**: Gets all user info from Clerk including phone numbers
✅ **Real-time**: Immediate sync when users update their profiles
✅ **Secure**: Webhook signatures verify authenticity
✅ **Scalable**: Handles high user volumes efficiently

## Troubleshooting

- **Webhook not firing**: Check your endpoint URL and ensure it's publicly accessible
- **Signature verification failed**: Verify your `CLERK_WEBHOOK_SECRET` is correct
- **User not created**: Check server logs for error details
- **Local development**: Make sure ngrok is running and URL is updated in Clerk dashboard 