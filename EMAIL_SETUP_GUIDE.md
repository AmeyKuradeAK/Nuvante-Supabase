# 📧 Nuvante Email Setup Guide - Anti-Spam Configuration

## 🚨 Why Emails Go to Spam?

1. **No Email Authentication** (SPF, DKIM, DMARC)
2. **New Domain Reputation** (Takes time to build trust)
3. **Poor Email Content** (Triggers spam filters)
4. **Incorrect Email Headers** (Missing authentication)

## 🛠️ Quick Fixes

### **1. DNS Records Setup (CRITICAL)**

Add these DNS records to your domain:

```bash
# SPF Record (TXT Record)
Name: @
Value: v=spf1 include:_spf.google.com include:sendgrid.net ~all

# DMARC Record (TXT Record) 
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; fo=1

# DKIM (Get from your email provider)
Name: s1._domainkey
Value: [Get this from SendGrid/Gmail/your provider]
```

### **2. Environment Variables Update**

```bash
# Professional Email Configuration
EMAIL_PROVIDER=smtp
EMAIL_FROM=orders@nuvante.com  # Use your domain, not gmail/yahoo
EMAIL_FROM_NAME=Nuvante Orders Team

# SMTP Settings (Use professional provider)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### **3. Recommended Email Providers**

| Provider | Deliverability | Setup Difficulty | Cost |
|----------|---------------|------------------|------|
| **SendGrid** | ⭐⭐⭐⭐⭐ | Easy | $15/month |
| **Mailgun** | ⭐⭐⭐⭐ | Medium | $35/month |
| **Amazon SES** | ⭐⭐⭐⭐⭐ | Hard | $0.10/1000 emails |

## 🔧 SendGrid Setup (Recommended)

1. **Sign up** at sendgrid.com
2. **Verify domain** ownership
3. **Configure DNS** records (SPF, DKIM, DMARC)
4. **Get API key**
5. **Update environment variables**

```bash
EMAIL_PROVIDER=sendgrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=orders@yourdomain.com
EMAIL_FROM_NAME=Nuvante
```

## 🎯 Email Template Best Practices

### **Do's:**
- ✅ Use your own domain (not gmail.com)
- ✅ Include clear unsubscribe link
- ✅ Professional email design
- ✅ Proper text/HTML ratio
- ✅ Include company address
- ✅ Test with multiple email providers

### **Don'ts:**
- ❌ ALL CAPS text
- ❌ Too many exclamation marks!!!
- ❌ Spam trigger words (FREE, URGENT, CLICK NOW)
- ❌ Broken HTML/CSS
- ❌ Missing alt text for images

## 🧪 Testing Checklist

1. **Test with multiple providers:**
   - Gmail ✉️
   - Outlook 📧
   - Yahoo 📮
   - Apple Mail 🍎

2. **Check spam score:**
   - Use tools like mail-tester.com
   - Aim for 8+/10 score

3. **Monitor delivery:**
   - Check bounce rates
   - Monitor spam complaints
   - Track open rates

## ⚡ Immediate Actions

1. **Use professional email address** (orders@nuvante.com)
2. **Set up SendGrid** with domain verification
3. **Configure DNS records** (SPF, DKIM, DMARC)
4. **Update email templates** with professional content
5. **Test thoroughly** before going live

## 📞 Need Help?

If emails still go to spam after setup:
1. Check DNS propagation (24-48 hours)
2. Warm up your domain (send few emails daily)
3. Ask customers to whitelist your email
4. Consider dedicated IP (for high volume)

---

**Next Steps:** 
1. Fix currency (✅ Done)
2. Test email again 
3. Check spam folder less frequently 📬 