import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceService } from '../../services';
import './WorkspacePage.css';

type Workspace = Awaited<ReturnType<typeof workspaceService.getWorkspace>>;

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspace() {
      if (!workspaceId) return;

      try {
        const data = await workspaceService.getWorkspace(workspaceId);
        setWorkspace(data);
      } catch (error) {
        console.error('Failed to fetch workspace:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspace();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="workspace-page">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="workspace-page">
        <div className="workspace-page__error">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <header className="workspace-page__header">
        <div
          className="workspace-page__color"
          style={{ backgroundColor: workspace.color }}
        />
        <div>
          <h1>{workspace.name}</h1>
          {workspace.description && <p>{workspace.description}</p>}
        </div>
      </header>

      <section className="workspace-page__boards">
        <h2>Boards</h2>

        {workspace.boards.length === 0 ? (
          <div className="workspace-page__empty">
            <p>No boards yet. Create your first board to get started.</p>
          </div>
        ) : (
          <div className="workspace-page__grid">
            {workspace.boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="workspace-page__board-card"
              >
                <h3>{board.name}</h3>
                {board.description && <p>{board.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
