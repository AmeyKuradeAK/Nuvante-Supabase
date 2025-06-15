# N8N Keep-Alive Setup Guide

## 🔄 Preventing N8N Instance Sleep on Free Hosting

This guide explains how to set up the automatic keep-alive system that pings your n8n instance every 5-10 seconds to prevent it from sleeping on free hosting services like Render.

## 📁 Files Added

1. **`utils/n8n-keepalive.ts`** - Core keep-alive utility
2. **`components/N8NKeepAlive.tsx`** - React component with status indicator
3. **Updated `app/layout.tsx`** - Integrated keep-alive across the app

## ⚙️ Environment Variables

Add these to your `.env.local` and deployment environment:

```env
# N8N Keep-Alive Configuration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/nuvante-order-webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/nuvante-order-webhook
```

**Note:** Both variables are needed:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - For frontend keep-alive pings
- `N8N_WEBHOOK_URL` - For backend order webhook calls

## 🚀 How It Works

### Automatic Operation
- ✅ **Auto-starts** when any page loads (after 2 second delay)
- 🔄 **Pings every 8 seconds** (between your requested 5-10 seconds)
- ⏸️ **Pauses when tab is hidden** (saves bandwidth)
- ▶️ **Resumes when tab becomes visible**
- 🛑 **Stops when page unloads**

### Smart Ping Strategy
- Sends lightweight POST requests to your n8n webhook
- Includes `X-Keep-Alive: true` header to identify ping requests
- Expects 400 status (invalid order data) as success for pings
- Has 5-second timeout to avoid hanging requests
- Retries up to 3 times before stopping

### Error Handling
- Tracks failure count and stops after max retries
- Logs connection status changes
- Non-intrusive - doesn't affect your app if n8n is down

## 🎯 Status Indicator

### Visual Feedback
- **🟢 Green pulsing dot** - Running successfully
- **🟡 Yellow bouncing dot** - Some failures but still trying
- **🔴 Red dot** - Stopped due to too many failures

### Status Panel (Development Mode)
Click the status dot to see detailed information:
- Current running status
- Failure count
- Time since last successful ping
- Configuration details

## 🔧 Configuration Options

You can customize the keep-alive behavior:

```typescript
import n8nKeepAlive from '@/utils/n8n-keepalive';

// Update configuration
n8nKeepAlive.updateConfig({
  interval: 10000,    // 10 seconds instead of 8
  enabled: true,      // Enable/disable
  maxRetries: 5,      // More retries before giving up
  timeout: 8000       // Longer timeout
});
```

## 🛠️ Manual Control

```typescript
import n8nKeepAlive from '@/utils/n8n-keepalive';

// Manual control
n8nKeepAlive.start();  // Start pinging
n8nKeepAlive.stop();   // Stop pinging

// Check status
const status = n8nKeepAlive.getStatus();
console.log('Is running:', status.isRunning);
console.log('Failures:', status.failureCount);
```

## 📊 Monitoring

### Browser Console Logs
- `🚀 N8N Keep-Alive: Starting with interval: 8000ms`
- `✅ N8N Keep-Alive: Connection restored`
- `⚠️ N8N Keep-Alive: Ping failed (1/3): [error]`
- `❌ N8N Keep-Alive: Max retries exceeded. Stopping keep-alive.`

### Network Tab
Look for regular POST requests to your n8n webhook URL with:
- `X-Keep-Alive: true` header
- Small JSON payload with `ping: true`
- 8-second intervals

## 🔍 Troubleshooting

### Keep-Alive Not Working
1. **Check Environment Variable**
   ```bash
   echo $NEXT_PUBLIC_N8N_WEBHOOK_URL
   ```

2. **Verify N8N URL**
   - Test the webhook URL manually
   - Ensure it's accessible from your domain

3. **Check Browser Console**
   - Look for keep-alive logs
   - Check for CORS errors

### High Failure Rate
1. **N8N Instance Issues**
   - Check if n8n is actually running
   - Verify webhook endpoint is active

2. **Network Issues**
   - Check for firewall blocking
   - Verify HTTPS/HTTP protocol match

3. **Rate Limiting**
   - Some services may rate-limit requests
   - Consider increasing interval if needed

## 🎛️ Production Considerations

### Performance Impact
- **Minimal bandwidth** - ~100 bytes per ping
- **Low CPU usage** - Simple HTTP requests
- **Smart pausing** - Stops when tab is hidden

### Bandwidth Usage
- 8-second intervals = 450 requests/hour
- ~45KB/hour bandwidth usage
- Pauses when not actively browsing

### Scaling
- Works across multiple browser tabs
- Each tab runs independently
- No server-side resources needed

## 🔒 Security

### Request Headers
```
Content-Type: application/json
X-Keep-Alive: true
```

### Request Body
```json
{
  "ping": true,
  "timestamp": 1703001234567,
  "source": "nuvante-keepalive"
}
```

### N8N Webhook Handling
Your n8n workflow will receive these pings but they'll be filtered out by the validation node since they don't contain valid order data.

## ✅ Verification

### Test the Setup
1. **Open your website**
2. **Check browser console** for keep-alive start message
3. **Open Network tab** and look for regular POST requests
4. **Click status indicator** (if visible) to see detailed status

### Confirm N8N Stays Alive
1. **Wait 20+ minutes** (longer than typical sleep time)
2. **Place a test order** to trigger email automation
3. **Verify emails are sent** without delay

## 🎯 Expected Behavior

After setup:
- ✅ N8N instance stays awake indefinitely
- 📧 Order emails send immediately (no cold start delay)
- 🔄 Automatic recovery if connection is temporarily lost
- 📱 Works across all pages of your website
- 🎛️ Minimal performance impact

The keep-alive system ensures your n8n email automation is always ready to process orders instantly! 🚀 