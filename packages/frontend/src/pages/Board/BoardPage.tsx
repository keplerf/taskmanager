import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { boardService } from '../../services';
import { useBoardStore } from '../../stores/boardStore';
import { TaskSidebar } from '../../components/TaskSidebar';
import './BoardPage.css';

interface BoardColumn {
  id: string;
  title: string;
  type: string;
  width: number;
  position: number;
}

interface ItemValue {
  id: string;
  columnId: string;
  value: unknown;
}

interface Item {
  id: string;
  name: string;
  position: number;
  groupId: string;
  values: ItemValue[];
}

interface ItemGroup {
  id: string;
  name: string;
  color: string;
  position: number;
  collapsed: boolean;
  items: Item[];
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  columns: BoardColumn[];
  groups: ItemGroup[];
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const { boardData, setBoardData, setSelectedItemId, selectedItemId } = useBoardStore();

  useEffect(() => {
    async function fetchBoard() {
      if (!boardId) return;

      try {
        const data = await boardService.getBoard(boardId);
        setBoardData(data as Board);
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

  const getColumnValue = (item: Item, columnId: string) => {
    const value = item.values.find((v) => v.columnId === columnId);
    if (!value || value.value === null || value.value === undefined) return '';

    // Handle different value types
    const val = value.value;

    // If it's a primitive (string, number, boolean), return as string
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }

    // If it's an object, extract the appropriate value
    if (typeof val === 'object' && val !== null) {
      // Check for common property names in order of priority
      if ('label' in val) return String((val as { label: unknown }).label);
      if ('value' in val) return String((val as { value: unknown }).value);
      if ('name' in val) return String((val as { name: unknown }).name);
      if ('text' in val) return String((val as { text: unknown }).text);
      // For date objects
      if ('date' in val) return String((val as { date: unknown }).date);

      // If it's an array (e.g., tags), extract and join values
      if (Array.isArray(val)) {
        return val.map(v => {
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

      // Last resort: JSON stringify but without quotes
      return JSON.stringify(val);
    }

    return '';
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleCloseSidebar = () => {
    setSelectedItemId(null);
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
                      {getColumnValue(item, column.id)}
                    </div>
                  ))}
                </div>
              ))}

              {group.items.length === 0 && (
                <div className="board-page__row board-page__row--empty">
                  No items in this group
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedItemId && <TaskSidebar onClose={handleCloseSidebar} />}
    </div>
  );
}
