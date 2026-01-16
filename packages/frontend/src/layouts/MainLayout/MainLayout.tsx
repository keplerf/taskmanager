import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services';
import { CreateWorkspaceModal } from '../../components/CreateWorkspaceModal';
import './MainLayout.css';

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCreateWorkspaceSuccess = (workspaceId: string) => {
    setIsCreateWorkspaceModalOpen(false);
    closeMobileMenu();
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <div className="main-layout">
      {/* Hamburger Menu Button */}
      <button 
        className="main-layout__hamburger" 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="main-layout__overlay" 
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`main-layout__sidebar ${isMobileMenuOpen ? 'main-layout__sidebar--open' : ''}`}>
        <div className="main-layout__logo">
          <Link to="/dashboard" onClick={closeMobileMenu}>ProjectHub</Link>
        </div>
        <nav className="main-layout__nav">
          <Link to="/dashboard" className="main-layout__nav-item" onClick={closeMobileMenu}>
            Dashboard
          </Link>
          <button
            className="main-layout__create-btn"
            onClick={() => setIsCreateWorkspaceModalOpen(true)}
          >
            + New Workspace
          </button>
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

      {isCreateWorkspaceModalOpen && (
        <CreateWorkspaceModal
          onClose={() => setIsCreateWorkspaceModalOpen(false)}
          onSuccess={handleCreateWorkspaceSuccess}
        />
      )}
    </div>
  );
}
