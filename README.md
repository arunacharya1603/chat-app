# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features

- 🔐 User authentication (signup/login)
- 💬 Real-time messaging with Socket.io
- 👤 User profiles with image upload
- 🎨 Theme customization (light/dark mode)
- 📱 Responsive design with Tailwind CSS and DaisyUI
- 🔒 JWT-based authentication
- 🖼️ Image upload with Cloudinary

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS + DaisyUI
- Zustand (state management)
- Socket.io-client
- React Router v7
- Axios

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.io
- JWT authentication
- Cloudinary (image storage)
- bcrypt (password hashing)

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local installation - [Download](https://www.mongodb.com/try/download/community)
   - MongoDB Atlas account (free cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
3. **Cloudinary Account** (free tier available) - [Sign up](https://cloudinary.com/)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Chat-app
```

### 2. Install dependencies

You have two options:

#### Option A: Install all dependencies at once (from root directory)
```bash
npm run build
```

#### Option B: Install separately
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file by copying the example:
```bash
# On Windows (PowerShell)
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

3. Edit the `.env` file with your configuration:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/chatapp
# For MongoDB Atlas, use:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Server Port
PORT=5001

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Environment
NODE_ENV=development
```

### 4. Set up MongoDB

#### For Local MongoDB:
1. Start MongoDB service:
```bash
# Windows
net start MongoDB

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### For MongoDB Atlas:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Replace the `MONGO_URI` in `.env` with your connection string

### 5. Set up Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

## Running the Application

### Development Mode

#### Option 1: Run frontend and backend separately (recommended for development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:5001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173

#### Option 2: Run both from root directory

First, build the frontend:
```bash
npm run build
```

Then start the application:
```bash
npm start
```

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Set NODE_ENV to production in backend/.env:
```env
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

The application will be available at http://localhost:5001

## Project Structure

```
Chat-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── lib/            # Database, socket, utilities
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utilities and axios config
│   │   └── App.jsx         # Main app component
│   └── package.json
└── package.json            # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/auth/check` - Check authentication status

### Messages
- `GET /api/messages/users` - Get all users for chat
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages/send/:userId` - Send message to user

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - For Atlas, whitelist your IP address

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Kill the process using the port:
     ```bash
     # Windows
     netstat -ano | findstr :5001
     taskkill /PID <PID> /F
     
     # Mac/Linux
     lsof -i :5001
     kill -9 <PID>
     ```

3. **Cloudinary Upload Issues**
   - Verify your Cloudinary credentials
   - Check if you've exceeded free tier limits

4. **CORS Errors**
   - Ensure backend is running on port 5001
   - Check cors configuration in backend/src/index.js

## Features in Detail

- **Authentication**: Secure JWT-based authentication with httpOnly cookies
- **Real-time Messaging**: Instant message delivery using Socket.io
- **Online Status**: See when users are online
- **Profile Management**: Upload and update profile pictures
- **Theme Toggle**: Switch between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## License

ISC

## Contributing

Feel free to submit issues and pull requests.

## Support

For issues or questions, please open an issue in the repository.

