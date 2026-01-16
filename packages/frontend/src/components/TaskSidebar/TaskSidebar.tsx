import { useEffect, useState } from 'react';
import { useBoardStore } from '../../stores/boardStore';
import { boardService, workspaceService } from '../../services';
import type { WorkspaceUser } from '../../services/workspaceService';
import type { Activity } from '../../services/boardService';
import { formatValueForDisplay } from '../../utils';
import './TaskSidebar.css';

interface TaskSidebarProps {
  onClose: () => void;
}

interface PendingChanges {
  name?: string;
  values: Record<string, unknown>;
}

// Tags Editor Component
function TagsEditor({
  tags,
  onChange,
  disabled,
  availableTags = [],
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  availableTags?: string[];
}) {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions: available tags that aren't already selected and match input
  const filteredSuggestions = availableTags.filter(
    (tag) =>
      !tags.includes(tag) &&
      tag.toLowerCase().includes(newTag.toLowerCase())
  );

  const handleAddTag = (tagToAdd?: string, keepOpen = false) => {
    const trimmedTag = (tagToAdd || newTag).trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setNewTag('');
      // Only close suggestions if not keeping open (e.g., when pressing Enter)
      if (!keepOpen) {
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Add tag but keep suggestions open for multiple selections
    const trimmedTag = suggestion.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (value: string) => {
    setNewTag(value);
    setShowSuggestions(value.length > 0 || availableTags.length > 0);
  };

  const handleInputFocus = () => {
    if (availableTags.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="task-sidebar__tags-editor">
      <div className="task-sidebar__tags-list">
        {tags.map((tag, index) => (
          <span key={index} className="task-sidebar__tag-chip">
            {tag}
            <button
              type="button"
              className="task-sidebar__tag-remove"
              onClick={() => handleRemoveTag(tag)}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="task-sidebar__tags-input-wrapper">
        <div className="task-sidebar__tags-input-row">
          <input
            type="text"
            className="task-sidebar__input task-sidebar__tags-input"
            value={newTag}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Add a tag..."
            disabled={disabled}
          />
          <button
            type="button"
            className="task-sidebar__tag-add-btn"
            onClick={() => handleAddTag()}
            disabled={disabled || !newTag.trim()}
          >
            Add
          </button>
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="task-sidebar__tags-suggestions">
            <div className="task-sidebar__tags-suggestions-label">Existing tags:</div>
            <div className="task-sidebar__tags-suggestions-list">
              {filteredSuggestions.slice(0, 8).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="task-sidebar__tags-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur from firing
                    handleSuggestionClick(suggestion);
                  }}
                  disabled={disabled}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskSidebar({ onClose }: TaskSidebarProps) {
  const { boardData, selectedItemId, updateItemName, updateItemValue, updateItemOwner, updateItemAssignees, setBoardData } = useBoardStore();
  const [editingName, setEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({ values: {} });
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isEditingAssignees, setIsEditingAssignees] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [workspaceTags, setWorkspaceTags] = useState<string[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Find the selected item from the board data
  const selectedItem = boardData?.groups
    .flatMap((group) => group.items)
    .find((item) => item.id === selectedItemId);

  // Reset pending changes when selected item changes
  useEffect(() => {
    setPendingChanges({ values: {} });
    setSaveError(null);
    setIsEditingOwner(false);
    setIsEditingAssignees(false);
  }, [selectedItemId]);

  // Fetch workspace users for owner dropdown
  useEffect(() => {
    if (boardData?.workspaceId) {
      workspaceService.getWorkspaceUsers(boardData.workspaceId)
        .then(setWorkspaceUsers)
        .catch(console.error);
    }
  }, [boardData?.workspaceId]);

  // Fetch workspace tags for tag suggestions
  useEffect(() => {
    if (boardData?.workspaceId) {
      workspaceService.getWorkspaceTags(boardData.workspaceId)
        .then(setWorkspaceTags)
        .catch(console.error);
    }
  }, [boardData?.workspaceId]);

  // Fetch activities when item changes
  useEffect(() => {
    if (selectedItemId) {
      setIsLoadingActivities(true);
      boardService.getItemActivities(selectedItemId)
        .then(setActivities)
        .catch(console.error)
        .finally(() => setIsLoadingActivities(false));
    } else {
      setActivities([]);
    }
  }, [selectedItemId]);

  if (!selectedItemId || !selectedItem) {
    return null;
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    pendingChanges.name !== undefined || Object.keys(pendingChanges.values).length > 0;

  // Get current display value (pending or saved)
  const getCurrentName = () => {
    return pendingChanges.name ?? selectedItem.name;
  };

  const getColumnValue = (columnId: string) => {
    // Return pending value if exists, otherwise return saved value
    if (columnId in pendingChanges.values) {
      return pendingChanges.values[columnId];
    }
    const value = selectedItem.values.find((v) => v.columnId === columnId);
    return value?.value;
  };

  const handleNameChange = (name: string) => {
    if (name === selectedItem.name) {
      // Remove from pending if it matches original
      setPendingChanges((prev) => {
        const { name: _, ...rest } = prev;
        return rest as PendingChanges;
      });
    } else {
      setPendingChanges((prev) => ({ ...prev, name }));
    }
  };

  const handleNameBlur = () => {
    setEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingName(false);
    } else if (e.key === 'Escape') {
      // Revert to original
      setPendingChanges((prev) => {
        const { name: _, ...rest } = prev;
        return rest as PendingChanges;
      });
      setEditingName(false);
    }
  };

  const handleValueChange = (columnId: string, value: unknown) => {
    // Get the original saved value
    const originalValue = selectedItem.values.find((v) => v.columnId === columnId)?.value;
    const originalFormatted = formatValueForDisplay(originalValue);
    const newFormatted = formatValueForDisplay(value);

    if (originalFormatted === newFormatted) {
      // Remove from pending if it matches original
      setPendingChanges((prev) => {
        const { [columnId]: _, ...restValues } = prev.values;
        return { ...prev, values: restValues };
      });
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        values: { ...prev.values, [columnId]: value },
      }));
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || !selectedItemId) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Save name if changed
      if (pendingChanges.name !== undefined) {
        await boardService.updateItem(selectedItemId, { name: pendingChanges.name });
        updateItemName(selectedItemId, pendingChanges.name);
      }

      // Save all value changes
      const valueEntries = Object.entries(pendingChanges.values);
      for (const [columnId, value] of valueEntries) {
        try {
          await boardService.updateItemValue(selectedItemId, columnId, value);
          updateItemValue(selectedItemId, columnId, value);
        } catch (err) {
          console.error(`Failed to save value for column ${columnId}:`, err);
          throw err;
        }
      }

      // Clear pending changes after successful save
      setPendingChanges({ values: {} });

      // Refresh activities
      const updatedActivities = await boardService.getItemActivities(selectedItemId);
      setActivities(updatedActivities);

      // Refresh workspace tags (in case new tags were added)
      if (boardData?.workspaceId) {
        const updatedTags = await workspaceService.getWorkspaceTags(boardData.workspaceId);
        setWorkspaceTags(updatedTags);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setPendingChanges({ values: {} });
    setSaveError(null);
  };

  const handleOwnerChange = async (userId: string) => {
    if (!selectedItemId) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedItem = await boardService.updateItem(selectedItemId, { createdById: userId || undefined });
      updateItemOwner(selectedItemId, updatedItem.createdBy);
      setIsEditingOwner(false);
    } catch (error) {
      console.error('Failed to update owner:', error);
      setSaveError('Failed to update owner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssigneeToggle = async (userId: string, isCurrentlyAssigned: boolean) => {
    if (!selectedItemId || !selectedItem) return;

    const currentAssigneeIds = selectedItem.assignees.map((a) => a.user.id);
    const newAssigneeIds = isCurrentlyAssigned
      ? currentAssigneeIds.filter((id) => id !== userId)
      : [...currentAssigneeIds, userId];

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedItem = await boardService.updateItemAssignees(selectedItemId, newAssigneeIds);
      updateItemAssignees(selectedItemId, updatedItem.assignees);
    } catch (error) {
      console.error('Failed to update assignees:', error);
      setSaveError('Failed to update assignees. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  };

  const handleConfirmDiscard = () => {
    setShowCloseConfirm(false);
    setPendingChanges({ values: {} });
    onClose();
  };

  const handleConfirmSave = async () => {
    setShowCloseConfirm(false);
    await handleSave();
    // Close after save if no errors
    if (!saveError) {
      onClose();
    }
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  const handleCreateColumn = async (type: 'DATE' | 'TAGS') => {
    if (!boardData) return;

    setIsCreatingColumn(true);
    try {
      const title = type === 'DATE' ? 'Date' : 'Tags';
      const newColumn = await boardService.createColumn({
        boardId: boardData.id,
        title,
        type,
      });
      // Update board data with new column
      setBoardData({
        ...boardData,
        columns: [...boardData.columns, newColumn as typeof boardData.columns[0]],
      });
    } catch (error) {
      console.error(`Failed to create ${type} column:`, error);
      setSaveError(`Failed to create ${type.toLowerCase()} column. Please try again.`);
    } finally {
      setIsCreatingColumn(false);
    }
  };

  return (
    <>
      <div className="task-sidebar-overlay" onClick={handleClose} />
      <aside className="task-sidebar">
        <div className="task-sidebar__header">
          <div className="task-sidebar__header-status">
            {isSaving && <span className="task-sidebar__saving">Saving...</span>}
            {saveError && <span className="task-sidebar__error">{saveError}</span>}
            {hasUnsavedChanges && !isSaving && !saveError && (
              <span className="task-sidebar__unsaved">Unsaved changes</span>
            )}
          </div>
          <button
            className="task-sidebar__close"
            onClick={handleClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="task-sidebar__content">
          <div className="task-sidebar__section">
            {editingName ? (
              <input
                type="text"
                className="task-sidebar__name-input"
                value={getCurrentName()}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
              />
            ) : (
              <h2
                className="task-sidebar__name"
                onClick={() => setEditingName(true)}
                title="Click to edit"
              >
                {getCurrentName()}
              </h2>
            )}
          </div>

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <h3 className="task-sidebar__section-title">Details</h3>
            <div className="task-sidebar__fields">
              {boardData?.columns
                .filter((column) => !['date', 'tags'].includes(column.type.toLowerCase()))
                .map((column) => {
                  const value = getColumnValue(column.id);
                  const isPending = column.id in pendingChanges.values;
                  const columnType = column.type.toLowerCase();
                  return (
                    <div key={column.id} className={`task-sidebar__field ${isPending ? 'task-sidebar__field--pending' : ''}`}>
                      <label className="task-sidebar__field-label">
                        {column.title}
                        {isPending && <span className="task-sidebar__field-modified">*</span>}
                      </label>
                      <div className="task-sidebar__field-value">
                        {columnType === 'status' && (
                          <select
                            className="task-sidebar__select"
                            value={formatValueForDisplay(value)}
                            onChange={(e) => handleValueChange(column.id, e.target.value)}
                          >
                            <option value="">Select status</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        )}
                        {columnType === 'text' && (
                          <input
                            type="text"
                            className="task-sidebar__input"
                            value={formatValueForDisplay(value)}
                            onChange={(e) => handleValueChange(column.id, e.target.value)}
                            placeholder={`Enter ${column.title.toLowerCase()}`}
                          />
                        )}
                        {columnType === 'number' && (
                          <input
                            type="number"
                            className="task-sidebar__input"
                            value={formatValueForDisplay(value)}
                            onChange={(e) => handleValueChange(column.id, e.target.value)}
                            placeholder={`Enter ${column.title.toLowerCase()}`}
                          />
                        )}
                        {!['status', 'text', 'number'].includes(columnType) && (
                          <input
                            type="text"
                            className="task-sidebar__input"
                            value={formatValueForDisplay(value)}
                            onChange={(e) => handleValueChange(column.id, e.target.value)}
                            placeholder={`Enter ${column.title.toLowerCase()}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <h3 className="task-sidebar__section-title">Date & Tags</h3>
            <div className="task-sidebar__fields">
              {/* Date Field */}
              <div className="task-sidebar__field">
                <label className="task-sidebar__field-label">
                  Date
                  {(() => {
                    const dateColumn = boardData?.columns.find((col) => col.type.toLowerCase() === 'date');
                    if (dateColumn && dateColumn.id in pendingChanges.values) {
                      return <span className="task-sidebar__field-modified">*</span>;
                    }
                    return null;
                  })()}
                </label>
                <div className="task-sidebar__field-value">
                  {(() => {
                    const dateColumn = boardData?.columns.find((col) => col.type.toLowerCase() === 'date');
                    if (dateColumn) {
                      const value = getColumnValue(dateColumn.id);
                      return (
                        <input
                          type="date"
                          className="task-sidebar__input"
                          value={formatValueForDisplay(value)}
                          onChange={(e) => handleValueChange(dateColumn.id, e.target.value)}
                        />
                      );
                    }
                    return (
                      <button
                        type="button"
                        className="task-sidebar__add-column-btn"
                        onClick={() => handleCreateColumn('DATE')}
                        disabled={isCreatingColumn}
                      >
                        {isCreatingColumn ? 'Adding...' : '+ Add Date Column'}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Tags Field */}
              <div className="task-sidebar__field">
                <label className="task-sidebar__field-label">
                  Tags
                  {(() => {
                    const tagsColumn = boardData?.columns.find((col) => col.type.toLowerCase() === 'tags');
                    if (tagsColumn && tagsColumn.id in pendingChanges.values) {
                      return <span className="task-sidebar__field-modified">*</span>;
                    }
                    return null;
                  })()}
                </label>
                <div className="task-sidebar__field-value">
                  {(() => {
                    const tagsColumn = boardData?.columns.find((col) => col.type.toLowerCase() === 'tags');
                    if (tagsColumn) {
                      const value = getColumnValue(tagsColumn.id);
                      return (
                        <TagsEditor
                          tags={Array.isArray(value) ? (value as string[]) : []}
                          onChange={(tags) => handleValueChange(tagsColumn.id, tags)}
                          disabled={isSaving}
                          availableTags={workspaceTags}
                        />
                      );
                    }
                    return (
                      <button
                        type="button"
                        className="task-sidebar__add-column-btn"
                        onClick={() => handleCreateColumn('TAGS')}
                        disabled={isCreatingColumn}
                      >
                        {isCreatingColumn ? 'Adding...' : '+ Add Tags Column'}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <h3 className="task-sidebar__section-title">People</h3>
            <div className="task-sidebar__fields">
              <div className="task-sidebar__field">
                <label className="task-sidebar__field-label">Owner</label>
                <div className="task-sidebar__field-value">
                  {isEditingOwner ? (
                    <select
                      className="task-sidebar__select"
                      value={selectedItem.createdBy?.id ?? ''}
                      onChange={(e) => handleOwnerChange(e.target.value)}
                      onBlur={() => setIsEditingOwner(false)}
                      autoFocus
                      disabled={isSaving}
                    >
                      <option value="">No owner</option>
                      {workspaceUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className="task-sidebar__user task-sidebar__user--clickable"
                      onClick={() => setIsEditingOwner(true)}
                      title="Click to change owner"
                    >
                      {selectedItem.createdBy ? (
                        <>
                          {selectedItem.createdBy.avatarUrl ? (
                            <img
                              src={selectedItem.createdBy.avatarUrl}
                              alt=""
                              className="task-sidebar__user-avatar"
                            />
                          ) : (
                            <div className="task-sidebar__user-avatar task-sidebar__user-avatar--placeholder">
                              {selectedItem.createdBy.firstName[0]}{selectedItem.createdBy.lastName[0]}
                            </div>
                          )}
                          <span className="task-sidebar__user-name">
                            {selectedItem.createdBy.firstName} {selectedItem.createdBy.lastName}
                          </span>
                        </>
                      ) : (
                        <span className="task-sidebar__empty-value">Click to set owner</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="task-sidebar__field">
                <label className="task-sidebar__field-label">Assigned to</label>
                <div className="task-sidebar__field-value">
                  {isEditingAssignees ? (
                    <div className="task-sidebar__assignee-picker">
                      {workspaceUsers.map((user) => {
                        const isAssigned = selectedItem.assignees?.some((a) => a.user.id === user.id);
                        return (
                          <label key={user.id} className="task-sidebar__assignee-option">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => handleAssigneeToggle(user.id, isAssigned ?? false)}
                              disabled={isSaving}
                            />
                            <div className="task-sidebar__assignee-info">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt=""
                                  className="task-sidebar__user-avatar task-sidebar__user-avatar--small"
                                />
                              ) : (
                                <div className="task-sidebar__user-avatar task-sidebar__user-avatar--small task-sidebar__user-avatar--placeholder">
                                  {user.firstName[0]}{user.lastName[0]}
                                </div>
                              )}
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          </label>
                        );
                      })}
                      <button
                        type="button"
                        className="task-sidebar__done-btn"
                        onClick={() => setIsEditingAssignees(false)}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div
                      className="task-sidebar__users task-sidebar__users--clickable"
                      onClick={() => setIsEditingAssignees(true)}
                      title="Click to edit assignees"
                    >
                      {selectedItem.assignees && selectedItem.assignees.length > 0 ? (
                        selectedItem.assignees.map((assignee) => (
                          <div key={assignee.user.id} className="task-sidebar__user">
                            {assignee.user.avatarUrl ? (
                              <img
                                src={assignee.user.avatarUrl}
                                alt=""
                                className="task-sidebar__user-avatar"
                              />
                            ) : (
                              <div className="task-sidebar__user-avatar task-sidebar__user-avatar--placeholder">
                                {assignee.user.firstName[0]}{assignee.user.lastName[0]}
                              </div>
                            )}
                            <span className="task-sidebar__user-name">
                              {assignee.user.firstName} {assignee.user.lastName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="task-sidebar__empty-value">Click to add assignees</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="task-sidebar__actions">
            {hasUnsavedChanges && (
              <button
                type="button"
                className="task-sidebar__btn task-sidebar__btn--secondary"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                Discard
              </button>
            )}
            <button
              type="button"
              className="task-sidebar__btn task-sidebar__btn--primary"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <h3 className="task-sidebar__section-title">Activity</h3>
            {isLoadingActivities ? (
              <p className="task-sidebar__loading">Loading activity...</p>
            ) : activities.length === 0 ? (
              <p className="task-sidebar__empty-state">No activity yet</p>
            ) : (
              <div className="task-sidebar__activity-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="task-sidebar__activity-item">
                    <div className="task-sidebar__activity-avatar">
                      {activity.user.avatarUrl ? (
                        <img src={activity.user.avatarUrl} alt="" />
                      ) : (
                        <div className="task-sidebar__activity-avatar--placeholder">
                          {activity.user.firstName[0]}{activity.user.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className="task-sidebar__activity-content">
                      <span className="task-sidebar__activity-user">
                        {activity.user.firstName} {activity.user.lastName}
                      </span>
                      <span className="task-sidebar__activity-desc">
                        {activity.description || activity.action.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="task-sidebar__activity-time">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Unsaved Changes Confirmation Modal */}
      {showCloseConfirm && (
        <div className="task-sidebar__modal-overlay">
          <div className="task-sidebar__modal">
            <div className="task-sidebar__modal-header">
              <h3 className="task-sidebar__modal-title">Unsaved Changes</h3>
            </div>
            <div className="task-sidebar__modal-body">
              <p>You have unsaved changes. What would you like to do?</p>
            </div>
            <div className="task-sidebar__modal-actions">
              <button
                type="button"
                className="task-sidebar__modal-btn task-sidebar__modal-btn--secondary"
                onClick={handleCancelClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="task-sidebar__modal-btn task-sidebar__modal-btn--danger"
                onClick={handleConfirmDiscard}
              >
                Discard Changes
              </button>
              <button
                type="button"
                className="task-sidebar__modal-btn task-sidebar__modal-btn--primary"
                onClick={handleConfirmSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskSidebar;
