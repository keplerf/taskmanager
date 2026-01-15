import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { boardService } from '../../services';
import { useBoardStore } from '../../stores/boardStore';
import { TaskSidebar } from '../../components/TaskSidebar';
import { getColumnValue } from '../../utils';
import './BoardPage.css';

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const { boardData, setBoardData, setSelectedItemId, selectedItemId, deleteItemOptimistic } = useBoardStore();

  useEffect(() => {
    async function fetchBoard() {
      if (!boardId) return;

      try {
        const data = await boardService.getBoard(boardId);
        setBoardData(data);
      } catch (error) {
        console.error('Failed to fetch board:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBoard();
  }, [boardId, setBoardData]);

  if (isLoading) {
    return (
      <div className="board-page">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="board-page">
        <div className="board-page__error">Board not found</div>
      </div>
    );
  }

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleCloseSidebar = () => {
    setSelectedItemId(null);
  };

  const handleDeleteItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    deleteItemOptimistic(itemId);

    try {
      await boardService.deleteItem(itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleStartAddItem = (groupId: string) => {
    setAddingToGroupId(groupId);
    setNewItemName('');
  };

  const handleCancelAddItem = () => {
    setAddingToGroupId(null);
    setNewItemName('');
  };

  const handleAddItem = async (groupId: string) => {
    const name = newItemName.trim();
    if (!name) return;

    try {
      const newItem = await boardService.createItem({ groupId, name }) as { id: string; name: string; position: number; groupId: string };

      // Add the new item to the board data
      setBoardData({
        ...boardData,
        groups: boardData.groups.map((group) =>
          group.id === groupId
            ? { ...group, items: [...group.items, { ...newItem, values: [] }] }
            : group
        ),
      });

      setAddingToGroupId(null);
      setNewItemName('');
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent, groupId: string) => {
    if (e.key === 'Enter') {
      handleAddItem(groupId);
    } else if (e.key === 'Escape') {
      handleCancelAddItem();
    }
  };

  return (
    <div className="board-page">
      <header className="board-page__header">
        <h1>{boardData.name}</h1>
        {boardData.description && <p>{boardData.description}</p>}
      </header>

      <div className="board-page__content">
        <div className="board-page__table">
          <div className="board-page__table-header">
            <div className="board-page__cell board-page__cell--name">Item</div>
            {boardData.columns.map((column) => (
              <div
                key={column.id}
                className="board-page__cell"
                style={{ width: column.width }}
              >
                {column.title}
              </div>
            ))}
            <div className="board-page__cell board-page__cell--actions" />
          </div>

          {boardData.groups.map((group) => (
            <div key={group.id} className="board-page__group">
              <div
                className="board-page__group-header"
                style={{ borderLeftColor: group.color }}
              >
                <span className="board-page__group-name">{group.name}</span>
                <span className="board-page__group-count">
                  {group.items.length} items
                </span>
              </div>

              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="board-page__row"
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="board-page__cell board-page__cell--name">
                    {item.name}
                  </div>
                  {boardData.columns.map((column) => (
                    <div
                      key={column.id}
                      className="board-page__cell"
                      style={{ width: column.width }}
                    >
                      {getColumnValue(item.values, column.id)}
                    </div>
                  ))}
                  <div className="board-page__cell board-page__cell--actions">
                    <button
                      className="board-page__delete-btn"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      title="Delete item"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}

              {group.items.length === 0 && addingToGroupId !== group.id && (
                <div className="board-page__row board-page__row--empty">
                  No items in this group
                </div>
              )}

              {addingToGroupId === group.id ? (
                <div className="board-page__row board-page__add-row">
                  <div className="board-page__cell board-page__cell--name">
                    <input
                      type="text"
                      className="board-page__add-input"
                      placeholder="Enter item name..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => handleAddItemKeyDown(e, group.id)}
                      autoFocus
                    />
                  </div>
                  <div className="board-page__add-actions">
                    <button
                      className="board-page__add-confirm"
                      onClick={() => handleAddItem(group.id)}
                      disabled={!newItemName.trim()}
                    >
                      Add
                    </button>
                    <button
                      className="board-page__add-cancel"
                      onClick={handleCancelAddItem}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="board-page__add-item-btn"
                  onClick={() => handleStartAddItem(group.id)}
                >
                  <PlusIcon />
                  <span>Add Item</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedItemId && <TaskSidebar onClose={handleCloseSidebar} />}
    </div>
  );
}
