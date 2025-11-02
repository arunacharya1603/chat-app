# Email Service Production Troubleshooting Guide

## Common Issue: 500 Error on /api/auth/resend-verification

### Problem
The resend verification email endpoint works locally but returns a 500 error in production.

## Root Causes & Solutions

### 1. Missing Environment Variables (Most Common)

**Check if these environment variables are set in your production environment:**

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
CLIENT_URL=https://your-production-url.com
```

**For Render.com deployment:**
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add the following environment variables:
   - `EMAIL_SERVICE`: Set to `gmail`
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_APP_PASSWORD`: Your Gmail App Password (NOT your regular password)
   - `CLIENT_URL`: Your frontend URL (e.g., `https://your-frontend.netlify.app`)

### 2. Gmail App Password Setup

Gmail requires an "App Password" for SMTP authentication:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (must be enabled)
3. At the bottom, click on "App passwords"
4. Select "Mail" and your device
5. Copy the generated 16-character password
6. Use this password as `EMAIL_APP_PASSWORD` (without spaces)

### 3. Gmail Security Settings

Ensure your Gmail account allows less secure apps:
1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps" (if available)
3. Or use App Passwords (recommended)

### 4. Production Server Restrictions

Some hosting providers block SMTP ports. Check if your provider allows:
- Port 587 (TLS/STARTTLS) - Preferred
- Port 465 (SSL)
- Port 25 (Not recommended)

**For Render.com:**
- Render allows outbound SMTP connections
- Make sure you're using port 587 for Gmail

### 5. Debugging Steps

1. **Check Production Logs:**
   ```bash
   # On Render.com
   # Go to your service → Logs tab
   # Look for error messages starting with:
   # - "Email configuration missing!"
   # - "Failed to create email transporter"
   # - "Authentication failed"
   ```

2. **Verify Environment Variables are Loaded:**
   The improved error logging will show:
   - `EMAIL_SERVICE: gmail` or `EMAIL_SERVICE: undefined`
   - `EMAIL_USER: Set` or `EMAIL_USER: Not set`
   - `EMAIL_APP_PASSWORD: Set` or `EMAIL_APP_PASSWORD: Not set`

3. **Common Error Messages and Solutions:**

   | Error Message | Solution |
   |--------------|----------|
   | "Email configuration missing!" | Set EMAIL_USER and EMAIL_APP_PASSWORD env vars |
   | "Authentication failed (EAUTH)" | Check EMAIL_APP_PASSWORD is correct |
   | "Connection failed (ECONNECTION)" | Check firewall/port restrictions |
   | "535 Authentication failed" | Wrong credentials, regenerate App Password |

### 6. Alternative Email Services

If Gmail continues to fail, consider these alternatives:

**SendGrid (Recommended for Production):**
```javascript
// Update EMAIL_SERVICE to 'sendgrid' and add:
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Outlook/Hotmail:**
```javascript
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### 7. Quick Test Script

Add this test endpoint to verify email configuration:

```javascript
// In auth.route.js
router.get("/test-email-config", (req, res) => {
    const config = {
        SERVICE: process.env.EMAIL_SERVICE ? 'Set' : 'Not set',
        USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set',
        CLIENT_URL: process.env.CLIENT_URL || 'Not set'
    };
    res.json({ emailConfig: config });
});
```

Access: `https://your-backend.onrender.com/api/auth/test-email-config`

### 8. Temporary Workaround

If email service is critical and not working, consider:
1. Temporarily disable email verification requirement
2. Log verification links to console and manually share with users
3. Use a third-party email service like SendGrid or Mailgun

## Deployment Checklist

- [ ] Set EMAIL_SERVICE environment variable
- [ ] Set EMAIL_USER environment variable
- [ ] Set EMAIL_APP_PASSWORD environment variable (App Password, not regular password)
- [ ] Set CLIENT_URL environment variable
- [ ] Verify Gmail 2-Step Verification is enabled
- [ ] Generate and use Gmail App Password
- [ ] Test email sending after deployment
- [ ] Check production logs for specific error messages

## Need More Help?

1. Check the production logs for specific error messages
2. The improved error handling will provide more detailed information
3. Test with the `/test-email-config` endpoint to verify environment variables
4. Consider using SendGrid or another email service for production reliability
