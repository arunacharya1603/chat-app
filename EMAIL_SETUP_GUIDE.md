# Email Verification Setup Guide

This guide will help you set up email verification for your Chat App.

## Prerequisites

- A Gmail account (or any email service provider)
- Node.js backend server running

## Step 1: Configure Gmail for Sending Emails

### Option A: Using Gmail with App Password (Recommended)

1. **Enable 2-Factor Authentication in Gmail:**
   - Go to your [Google Account Security Settings](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - After enabling 2FA, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select your device
   - Click "Generate"
   - Copy the 16-character password

3. **Update your `.env` file:**
   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_APP_PASSWORD=your_16_character_app_password
   ```

### Option B: Using Other Email Services

For other email providers (Outlook, Yahoo, etc.), use SMTP configuration:

```env
# Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@provider.com
EMAIL_PASSWORD=your_email_password
```

Common SMTP Settings:
- **Gmail:** smtp.gmail.com (port 587)
- **Outlook:** smtp-mail.outlook.com (port 587)
- **Yahoo:** smtp.mail.yahoo.com (port 587 or 465)

## Step 2: Backend Configuration

1. **Install Required Package:**
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Create `.env` file in backend directory:**
   ```env
   # MongoDB
   MONGO_URI=mongodb://localhost:27017/chat-app

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here

   # Server Configuration
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Session Secret
   SESSION_SECRET=your_session_secret_here

   # Cloudinary (for images)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_APP_PASSWORD=your_app_password_here
   ```

3. **Restart the backend server:**
   ```bash
   npm start
   ```

## Step 3: Testing Email Verification

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test Registration:**
   - Go to http://localhost:5173/signup
   - Create a new account
   - Check your email for the verification link
   - Click the link to verify your account

## How It Works

### Registration Flow:
1. User signs up with email and password
2. Backend creates user with `isVerified: false`
3. Backend generates a verification token
4. Backend sends verification email with a link
5. User clicks the link
6. Backend verifies the token and sets `isVerified: true`
7. User can now log in

### Features Implemented:

1. **Email Verification on Signup:**
   - New users receive a verification email
   - Account remains unverified until email is confirmed
   - Verification link expires in 24 hours

2. **Login Protection:**
   - Unverified users cannot log in
   - Shows message to verify email first
   - Option to resend verification email

3. **Resend Verification:**
   - Users can request new verification email
   - Available from login page if email not verified

4. **Google OAuth Users:**
   - Automatically verified (no email verification needed)
   - Can log in immediately after signup

## Troubleshooting

### Email Not Sending:

1. **Check Email Credentials:**
   - Verify EMAIL_USER and EMAIL_APP_PASSWORD in .env
   - Make sure 2FA is enabled for Gmail

2. **Check Console Logs:**
   - Backend console will show email sending status
   - Look for "Verification email sent to:" messages

3. **Gmail Security:**
   - Make sure "Less secure app access" is OFF (we use App Password instead)
   - Check Gmail's sent folder to confirm emails are being sent

### Verification Link Not Working:

1. **Check CLIENT_URL in .env:**
   - Should match your frontend URL (http://localhost:5173 for development)

2. **Token Expiry:**
   - Tokens expire after 24 hours
   - Use "Resend Verification" to get a new link

### Common Issues:

- **"Cannot find module 'nodemailer'":** Run `npm install nodemailer` in backend
- **"Invalid login" error from Gmail:** Use App Password, not regular password
- **Email in spam folder:** Check spam/junk folder, mark as "Not Spam"

## Security Best Practices

1. **Never commit `.env` file to Git**
2. **Use strong JWT_SECRET and SESSION_SECRET**
3. **Keep email credentials secure**
4. **Use HTTPS in production**
5. **Set appropriate token expiry times**

## Production Deployment

For production, update these environment variables:

```env
NODE_ENV=production
CLIENT_URL=https://your-domain.com
EMAIL_SERVICE=your_production_email_service
```

Consider using professional email services for production:
- SendGrid
- Mailgun
- Amazon SES
- Postmark

These services provide better deliverability and analytics.

## Support

If you encounter issues:
1. Check backend console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check network/firewall settings for email ports
