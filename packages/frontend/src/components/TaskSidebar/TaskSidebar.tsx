import { useEffect, useState } from 'react';
import { useBoardStore } from '../../stores/boardStore';
import { boardService } from '../../services';
import { ItemCtas } from '../ItemCtas';
import type { Cta } from '../../services/ctaService';
import './TaskSidebar.css';

interface TaskSidebarProps {
  onClose: () => void;
}

interface PendingChanges {
  name?: string;
  values: Record<string, unknown>;
}

function TaskSidebar({ onClose }: TaskSidebarProps) {
  const { boardData, selectedItemId, updateItemName, updateItemValue } = useBoardStore();
  const [editingName, setEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [itemCtas, setItemCtas] = useState<Cta[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({ values: {} });

  // Find the selected item from the board data
  const selectedItem = boardData?.groups
    .flatMap((group) => group.items)
    .find((item) => item.id === selectedItemId);

  // Reset pending changes when selected item changes
  useEffect(() => {
    setPendingChanges({ values: {} });
    setSaveError(null);
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

  const formatValueForDisplay = (value: unknown): string => {
    if (value === null || value === undefined) return '';

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (typeof value === 'object' && value !== null) {
      if ('label' in value) return String((value as { label: unknown }).label);
      if ('value' in value) return String((value as { value: unknown }).value);
      if ('name' in value) return String((value as { name: unknown }).name);
      if ('text' in value) return String((value as { text: unknown }).text);
      if ('date' in value) return String((value as { date: unknown }).date);

      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'string' || typeof v === 'number') return v;
          if (typeof v === 'object' && v !== null) {
            if ('label' in v) return (v as { label: unknown }).label;
            if ('value' in v) return (v as { value: unknown }).value;
            if ('name' in v) return (v as { name: unknown }).name;
            if ('text' in v) return (v as { text: unknown }).text;
          }
          return v;
        }).join(', ');
      }

      return JSON.stringify(value);
    }

    return '';
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

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmClose) return;
    }
    onClose();
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
              {boardData?.columns.map((column) => {
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
                      {columnType === 'date' && (
                        <input
                          type="date"
                          className="task-sidebar__input"
                          value={formatValueForDisplay(value)}
                          onChange={(e) => handleValueChange(column.id, e.target.value)}
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
                      {!['status', 'text', 'date', 'number'].includes(columnType) && (
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

          {hasUnsavedChanges && (
            <div className="task-sidebar__actions">
              <button
                type="button"
                className="task-sidebar__btn task-sidebar__btn--secondary"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                Discard
              </button>
              <button
                type="button"
                className="task-sidebar__btn task-sidebar__btn--primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <ItemCtas
              itemId={selectedItemId}
              initialCtas={itemCtas}
              onCtasChange={setItemCtas}
            />
          </div>

          <div className="task-sidebar__divider" />

          <div className="task-sidebar__section">
            <h3 className="task-sidebar__section-title">Activity</h3>
            <p className="task-sidebar__empty-state">No activity yet</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default TaskSidebar;
