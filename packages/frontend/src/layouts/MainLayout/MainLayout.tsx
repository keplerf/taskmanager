import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services';
import './MainLayout.css';

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <aside className="main-layout__sidebar">
        <div className="main-layout__logo">
          <Link to="/dashboard">ProjectHub</Link>
        </div>
        <nav className="main-layout__nav">
          <Link to="/dashboard" className="main-layout__nav-item">
            Dashboard
          </Link>
        </nav>
        <div className="main-layout__user">
          <div className="main-layout__user-info">
            <span className="main-layout__user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="main-layout__user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="main-layout__logout-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
