import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceService } from '../../services';
import * as boardService from '../../services/boardService';
import { AddUserModal } from '../../components/AddUserModal';
import { BoardModal } from '../../components/BoardModal';
import './WorkspacePage.css';

type Workspace = Awaited<ReturnType<typeof workspaceService.getWorkspace>>;

interface BoardForEdit {
  id: string;
  name: string;
  description: string | null;
}

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardForEdit | null>(null);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  const refreshWorkspace = async () => {
    if (!workspaceId) return;
    try {
      const data = await workspaceService.getWorkspace(workspaceId);
      setWorkspace(data);
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
    }
  };

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

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleEditBoard = (board: BoardForEdit, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoard(board);
    setIsBoardModalOpen(true);
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    setDeletingBoardId(boardId);
    try {
      await boardService.deleteBoard(boardId);
      await refreshWorkspace();
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board');
    } finally {
      setDeletingBoardId(null);
    }
  };

  const handleBoardModalClose = () => {
    setIsBoardModalOpen(false);
    setEditingBoard(null);
  };

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
        <div className="workspace-page__header-left">
          <div
            className="workspace-page__color"
            style={{ backgroundColor: workspace.color }}
          />
          <div>
            <h1>{workspace.name}</h1>
            {workspace.description && <p>{workspace.description}</p>}
          </div>
        </div>
        <div className="workspace-page__header-right">
          {workspace.users && workspace.users.length > 0 && (
            <div className="workspace-page__members">
              <span className="workspace-page__members-label">Members:</span>
              <div className="workspace-page__members-avatars">
                {workspace.users.slice(0, 5).map((wu: { user: { id: string; firstName: string; lastName: string; avatarUrl: string | null } }) => (
                  <div
                    key={wu.user.id}
                    className="workspace-page__member-avatar"
                    title={`${wu.user.firstName} ${wu.user.lastName}`}
                  >
                    {wu.user.avatarUrl ? (
                      <img src={wu.user.avatarUrl} alt="" />
                    ) : (
                      <span>{wu.user.firstName[0]}{wu.user.lastName[0]}</span>
                    )}
                  </div>
                ))}
                {workspace.users.length > 5 && (
                  <div className="workspace-page__member-avatar workspace-page__member-avatar--more">
                    +{workspace.users.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="workspace-page__add-member-btn"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            + Add Member
          </button>
        </div>
      </header>

      <section className="workspace-page__boards">
        <div className="workspace-page__boards-header">
          <h2>Boards</h2>
          <button
            className="workspace-page__create-board-btn"
            onClick={handleCreateBoard}
          >
            + Create Board
          </button>
        </div>

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
                <div className="workspace-page__board-card-header">
                  <h3>{board.name}</h3>
                  <div className="workspace-page__board-actions">
                    <button
                      className="workspace-page__board-action-btn"
                      onClick={(e) => handleEditBoard(board, e)}
                      title="Edit board"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="workspace-page__board-action-btn workspace-page__board-action-btn--delete"
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      disabled={deletingBoardId === board.id}
                      title="Delete board"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                {board.description && <p>{board.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>

      {isAddUserModalOpen && workspaceId && (
        <AddUserModal
          workspaceId={workspaceId}
          onClose={() => setIsAddUserModalOpen(false)}
          onUserAdded={refreshWorkspace}
        />
      )}

      {isBoardModalOpen && workspaceId && (
        <BoardModal
          workspaceId={workspaceId}
          board={editingBoard}
          onClose={handleBoardModalClose}
          onSaved={refreshWorkspace}
        />
      )}
    </div>
  );
}
