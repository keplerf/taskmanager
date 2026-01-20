import { useState, useEffect } from 'react';
import { workspaceService } from '../../services';
import type { Organization } from '../../services/workspaceService';
import './CreateWorkspaceModal.css';
import { Button } from '../Atoms/Button/Button';

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onSuccess: (workspaceId: string) => void;
}

export function CreateWorkspaceModal({ onClose, onSuccess }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const orgs = await workspaceService.getUserOrganizations();
        setOrganizations(orgs);
        if (orgs.length === 1) {
          setOrganizationId(orgs[0].id);
        }
      } catch (err) {
        setError('Failed to load organizations');
      }
    }
    fetchOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const workspace = await workspaceService.createWorkspace({
        name: name.trim(),
        organizationId,
        description: description.trim() || undefined,
      });
      onSuccess(workspace.id);
    } catch (err) {
      setError('Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Create Workspace</h2>
          <Button size='small' appearance='outline' onClick={onClose}>
            &times;
          </Button >
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          {error && <div className="modal__error">{error}</div>}

          <div className="modal__field">
            <label className="modal__label" htmlFor="workspace-name">
              Name *
            </label>
            <input
              id="workspace-name"
              type="text"
              className="modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              required
              autoFocus
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="workspace-description">
              Description
            </label>
            <textarea
              id="workspace-description"
              className="modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {organizations.length > 1 && (
            <div className="modal__field">
              <label className="modal__label" htmlFor="workspace-org">
                Organization *
              </label>
              <select
                id="workspace-org"
                className="modal__select"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                required
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal__actions">
            <Button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={isLoading || !name.trim() || !organizationId}
            >
              {isLoading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
