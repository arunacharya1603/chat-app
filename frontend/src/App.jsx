import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
// Email verification pages removed - no longer needed
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore";

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log(onlineUsers);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) return (
    <div className="flex justify-center items-center h-screen">
      <Loader className="w-10 h-10 animate-spin" />
    </div>
  )


  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/"/>} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login"/>} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
        {/* Redirect old verification routes to home/login */}
        <Route path="/verify-email" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
        <Route path="/resend-verification" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
        {/* Catch all other unknown routes */}
        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
