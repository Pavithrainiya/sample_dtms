import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardNew from './pages/AdminDashboardNew';
import UserDashboard from './pages/UserDashboard';
import UserDashboardNew from './pages/UserDashboardNew';
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || '').toLowerCase();
  return userRole === 'admin' ? <AdminDashboardNew /> : <UserDashboardNew />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<div className="p-8 text-center text-2xl font-bold">403 - Unauthorized</div>} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<DashboardRouter />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/tasks/:id" element={<TaskDetail />} />
             {/* Keep old dashboards available for reference */}
             <Route path="/dashboard/admin/old" element={<AdminDashboard />} />
             <Route path="/dashboard/user/old" element={<UserDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);
}

export default App;
