import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__logo">
          <h1>ProjectHub</h1>
          <p>Manage your projects with ease</p>
        </div>
        <div className="auth-layout__content">{children}</div>
      </div>
    </div>
  );
}
