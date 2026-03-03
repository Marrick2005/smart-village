import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Agriculture from './pages/user/Agriculture';
import School from './pages/user/School';
import Culture from './pages/user/Culture';
import CultureDetail from './pages/user/CultureDetail';
import VolunteerHome from './pages/volunteer/VolunteerHome';
import CultureManagement from './pages/admin/CultureManagement';
// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (requiredRole && user.identity_type !== requiredRole) {
    return <Navigate to={user.identity_type === '管理员' ? '/admin' : '/home'} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute requiredRole="农户">
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<ProtectedRoute requiredRole="管理员"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/volunteer" element={<ProtectedRoute requiredRole="志愿者"><VolunteerHome /></ProtectedRoute>} />
      <Route path="/agriculture" element={<ProtectedRoute requiredRole="农户"><Agriculture /></ProtectedRoute>} />
      <Route path="/school" element={<ProtectedRoute requiredRole="农户"><School /></ProtectedRoute>} />
      <Route path="/culture" element={<ProtectedRoute requiredRole="农户"><Culture /></ProtectedRoute>} />
      <Route path="/culture/landmark/:id" element={<ProtectedRoute requiredRole="农户"><CultureDetail /></ProtectedRoute>} />
      <Route path="/admin/culture" element={<ProtectedRoute requiredRole="管理员"><CultureManagement /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
