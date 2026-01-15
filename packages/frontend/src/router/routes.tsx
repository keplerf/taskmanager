import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/Login'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const WorkspacePage = lazy(() => import('../pages/Workspace'));
const BoardPage = lazy(() => import('../pages/Board'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthLayout>
        <SuspenseWrapper>
          <LoginPage />
        </SuspenseWrapper>
      </AuthLayout>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'workspace/:workspaceId',
        element: (
          <SuspenseWrapper>
            <WorkspacePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'board/:boardId',
        element: (
          <SuspenseWrapper>
            <BoardPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
