import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workspaceService } from '../../services';
import './DashboardPage.css';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Awaited<ReturnType<typeof workspaceService.getWorkspaces>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const data = await workspaceService.getWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Dashboard</h1>
        <p>Welcome to your project management hub</p>
      </header>

      <section className="dashboard-page__section">
        <div className="dashboard-page__section-header">
          <h2>Workspaces</h2>
        </div>

        {workspaces.length === 0 ? (
          <div className="dashboard-page__empty">
            <p>No workspaces yet. Create your first workspace to get started.</p>
          </div>
        ) : (
          <div className="dashboard-page__grid">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspace/${workspace.id}`}
                className="dashboard-page__card"
                style={{ borderLeftColor: workspace.color }}
              >
                <h3>{workspace.name}</h3>
                {workspace.description && <p>{workspace.description}</p>}
                <span className="dashboard-page__card-count">
                  {workspace.boards.length} board(s)
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
