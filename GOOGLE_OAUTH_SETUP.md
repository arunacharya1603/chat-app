# Google OAuth Setup Guide for Chat Application

This guide will help you set up Google OAuth authentication for your chat application.

## Prerequisites

- Google Cloud Console account
- Node.js installed
- MongoDB running

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email` and `profile`
   - Add test users if in development

6. For the OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name (e.g., "Chat App")
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production frontend URL
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback` (for development)
     - Your production backend URL + `/api/auth/google/callback`

7. Click **Create** and save your credentials:
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `xxx`

## Step 2: Backend Configuration

### Environment Variables

Create a `.env` file in the `backend` folder with the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatapp

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Server Configuration
PORT=5001
NODE_ENV=development

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-key-here

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Install Dependencies

The following packages have been added to your backend:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management
- `google-auth-library` - Google token verification

## Step 3: Frontend Configuration

### Environment Variables

Create a `.env` file in the `frontend` folder:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Install Dependencies

The following package has been added to your frontend:
- `@react-oauth/google` - Google OAuth React components

## Step 4: Testing the Integration

1. Start MongoDB:
   ```bash
   mongod
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Navigate to `http://localhost:5173/login`
5. Click the "Sign in with Google" button
6. Complete the Google authentication flow
7. You should be redirected back and logged in

## Features Implemented

### Backend
- ✅ Google OAuth strategy with Passport.js
- ✅ User model updated with Google fields (`googleId`, `isGoogleUser`)
- ✅ Automatic account creation for new Google users
- ✅ Account linking for existing users with same email
- ✅ JWT token generation for Google authenticated users
- ✅ Session management for OAuth flow

### Frontend
- ✅ Google login button component
- ✅ Integration with `@react-oauth/google`
- ✅ Automatic login after successful Google authentication
- ✅ Support for both login and signup flows
- ✅ Error handling and toast notifications

## How It Works

1. **New User Flow:**
   - User clicks "Sign in with Google"
   - Authenticates with Google
   - Backend creates new user account with Google profile data
   - Random password is generated (user won't need it for Google login)
   - JWT token is generated and user is logged in

2. **Existing User Flow:**
   - If email already exists in database
   - Google account is linked to existing user
   - User can now login with both password or Google

3. **Security:**
   - Google ID tokens are verified on the backend
   - Sessions are secured with httpOnly cookies
   - CORS is configured for the frontend origin
   - JWT tokens expire after configured time

## Troubleshooting

### Common Issues

1. **"Google Client ID not configured" warning:**
   - Make sure `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
   - Restart the frontend dev server after adding env variables

2. **"Invalid client" error from Google:**
   - Verify Client ID matches in both frontend and backend
   - Check authorized origins and redirect URIs in Google Console

3. **CORS errors:**
   - Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
   - Check that credentials are included in axios requests

4. **User creation fails:**
   - Check MongoDB is running
   - Verify database connection string
   - Check for unique constraint violations (email already exists)

## Production Deployment

When deploying to production:

1. Update Google Console OAuth settings:
   - Add production URLs to authorized origins
   - Add production callback URL to redirect URIs

2. Update environment variables:
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Update `CLIENT_URL` to production frontend URL
   - Use secure session secrets

3. Enable HTTPS:
   - Google OAuth requires HTTPS in production
   - Update cookie settings for secure flag

## Additional Notes

- Users created via Google OAuth have `isGoogleUser: true` flag
- Password field is optional for Google users
- Profile pictures from Google are automatically saved
- Users can link/unlink Google accounts (future feature)

## Support

For issues or questions:
1. Check the browser console for errors
2. Check backend logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

Happy coding! 🚀
