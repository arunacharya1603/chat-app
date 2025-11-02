# Production Email Fix Guide

## Current Issue
Your production server on Render.com is experiencing **connection timeouts** when trying to connect to Gmail's SMTP servers. This is a common issue with free hosting tiers.

## Solution Options

### Option 1: Use SendGrid (RECOMMENDED - FREE TIER AVAILABLE)

SendGrid is more reliable for production and offers 100 free emails per day.

#### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/
2. Sign up for a free account
3. Verify your email address

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Give it a name like "chat-app"
4. Select "Full Access"
5. Copy the API key (starts with `SG.`)

#### Step 3: Configure Sender Authentication
1. Go to Settings → Sender Authentication
2. Choose "Single Sender Verification" (easier for testing)
3. Add your email address as a verified sender
4. Verify the email they send you

#### Step 4: Update Render Environment Variables
Remove old Gmail variables and add:
- `EMAIL_SERVICE` = `sendgrid`
- `EMAIL_USER` = Your verified sender email
- `SENDGRID_API_KEY` = Your SendGrid API key (SG.xxxxx)
- `CLIENT_URL` = Your frontend URL

### Option 2: Try Alternative Gmail Configuration

If you want to stick with Gmail, try these environment variables on Render:

- `EMAIL_SERVICE` = `gmail`
- `EMAIL_USER` = your-email@gmail.com
- `EMAIL_APP_PASSWORD` = your-app-password
- `EMAIL_HOST` = `smtp.gmail.com`
- `EMAIL_PORT` = `465`
- `EMAIL_SECURE` = `true`
- `CLIENT_URL` = Your frontend URL

This uses SSL instead of TLS which might work better.

### Option 3: Use Brevo (formerly Sendinblue) - FREE

Another free alternative with 300 emails/day free:

#### Step 1: Create Brevo Account
1. Go to https://www.brevo.com/
2. Sign up for free account
3. Verify your email

#### Step 2: Get SMTP Credentials
1. Go to SMTP & API
2. Create SMTP Key
3. Copy the password

#### Step 3: Configure on Render
- `EMAIL_SERVICE` = `custom`
- `EMAIL_HOST` = `smtp-relay.brevo.com`
- `EMAIL_PORT` = `587`
- `EMAIL_USER` = Your Brevo login email
- `EMAIL_PASSWORD` = Your SMTP password from Brevo
- `CLIENT_URL` = Your frontend URL

## Quick Fix for Gmail (Try This First)

Sometimes the issue is just with the port. On Render, update these environment variables:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
CLIENT_URL=https://your-frontend-url.com
```

## Testing Your Configuration

After updating environment variables:

1. **Restart your Render service**
2. **Check configuration:**
   ```
   https://chat-app-f9s0.onrender.com/api/auth/check-email-config
   ```
3. **Test email sending:**
   ```
   https://chat-app-f9s0.onrender.com/api/auth/test-email?to=your-email@gmail.com
   ```

## Why This Happens

1. **Firewall Restrictions:** Some hosting providers block SMTP ports
2. **Network Policies:** Free tiers often have restrictions on outbound connections
3. **Gmail Security:** Google may block connections from cloud providers
4. **Port Blocking:** Common SMTP ports (25, 587) might be blocked

## Immediate Action Steps

1. **Try the Gmail quick fix first** (change to port 465 with SSL)
2. **If that fails, use SendGrid** (most reliable for production)
3. **Deploy the updated code** with the new email configurations

## Deploy the Fix

```bash
git add .
git commit -m "Fix email timeout issue with alternative SMTP configuration"
git push origin main
```

## Environment Variables Summary

### For SendGrid:
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=your-verified-sender@gmail.com
SENDGRID_API_KEY=SG.your-api-key-here
CLIENT_URL=https://your-frontend.com
```

### For Gmail (Alternative):
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
CLIENT_URL=https://your-frontend.com
```

### For Brevo:
```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-brevo-smtp-password
CLIENT_URL=https://your-frontend.com
```

## Note
The code has been updated to handle all these configurations. You just need to set the appropriate environment variables on Render based on which service you choose.
