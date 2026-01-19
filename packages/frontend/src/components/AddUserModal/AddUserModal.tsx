import { useState, useEffect } from 'react';
import { workspaceService } from '../../services';
import type { AvailableUser } from '../../services/workspaceService';
import './AddUserModal.css';
import Button from "@/components/Atoms/Button";

interface AddUserModalProps {
  workspaceId: string;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({ workspaceId, onClose, onUserAdded }: AddUserModalProps) {
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailableUsers() {
      try {
        const availableUsers = await workspaceService.getAvailableUsers(workspaceId);
        setUsers(availableUsers);
      } catch (err) {
        setError('Failed to load available users');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAvailableUsers();
  }, [workspaceId]);

  const handleAddUser = async (userId: string) => {
    setAddingUserId(userId);
    setError(null);

    try {
      await workspaceService.addUserToWorkspace(workspaceId, userId);
      // Mark user as member instead of removing
      setUsers(users.map((u) => (u.id === userId ? { ...u, isMember: true } : u)));
      onUserAdded();
    } catch (err) {
      setError('Failed to add user');
    } finally {
      setAddingUserId(null);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <div className="add-user-modal-overlay" onClick={onClose} />
      <div className="add-user-modal">
        <div className="add-user-modal__header">
          <h2 className="add-user-modal__title">Add Member</h2>
          <Button size='small' appearance='outline' onClick={onClose}>
            &times;
          </Button>
        </div>
        <div className="add-user-modal__content">
          {error && <div className="add-user-modal__error">{error}</div>}

          {isLoading ? (
            <div className="add-user-modal__loading">Loading...</div>
          ) : users.length === 0 ? (
            <div className="add-user-modal__empty">
              No users found in the organization.
            </div>
          ) : (
            <ul className="add-user-modal__list">
              {users.map((user) => (
                <li key={user.id} className={`add-user-modal__item ${user.isMember ? 'add-user-modal__item--member' : ''}`}>
                  <div className="add-user-modal__user">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="add-user-modal__avatar"
                      />
                    ) : (
                      <div className="add-user-modal__avatar add-user-modal__avatar--placeholder">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                    )}
                    <div className="add-user-modal__user-info">
                      <span className="add-user-modal__user-name">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="add-user-modal__user-email">{user.email}</span>
                    </div>
                  </div>
                  {user.isMember ? (
                    <span className="add-user-modal__member-badge">Member</span>
                  ) : (
                      <Button
                      size='small'
                      className="add-user-modal__add-btn"
                      onClick={() => handleAddUser(user.id)}
                      disabled={addingUserId === user.id}
                    >
                      {addingUserId === user.id ? 'Adding...' : 'Add'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
