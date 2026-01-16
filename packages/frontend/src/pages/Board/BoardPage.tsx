import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { boardService } from "../../services";
import { useBoardStore } from "../../stores/boardStore";
import { TaskSidebar } from "../../components/TaskSidebar";
import { DraggableItem } from "../../components/DraggableItem";
import { getColumnValue } from "../../utils";
import "./BoardPage.css";

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
  const [newItemName, setNewItemName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    boardData,
    setBoardData,
    setSelectedItemId,
    selectedItemId,
    deleteItemOptimistic,
    moveItemOptimistic,
  } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchBoard() {
      if (!boardId) return;

      try {
        const data = await boardService.getBoard(boardId);
        setBoardData(data);
      } catch (error) {
        console.error("Failed to fetch board:", error);
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

    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    deleteItemOptimistic(itemId);

    try {
      await boardService.deleteItem(itemId);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleStartAddItem = (groupId: string) => {
    setAddingToGroupId(groupId);
    setNewItemName("");
  };

  const handleCancelAddItem = () => {
    setAddingToGroupId(null);
    setNewItemName("");
  };

  const handleAddItem = async (groupId: string) => {
    const name = newItemName.trim();
    if (!name) return;

    try {
      const newItem = await boardService.createItem({ groupId, name });

      // Add the new item to the board data (API returns full item with createdBy and assignees)
      setBoardData({
        ...boardData,
        groups: boardData.groups.map((group) =>
          group.id === groupId
            ? { ...group, items: [...group.items, { ...newItem, values: [] }] }
            : group
        ),
      });

      setAddingToGroupId(null);
      setNewItemName("");
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent, groupId: string) => {
    if (e.key === "Enter") {
      handleAddItem(groupId);
    } else if (e.key === "Escape") {
      handleCancelAddItem();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !boardData) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    if (activeItemId === overId) return;

    // Find source group (where the item currently is)
    let sourceGroup = boardData.groups.find((g) =>
      g.items.some((i) => i.id === activeItemId)
    );

    // Find target group (where we're dropping)
    // First check if overId is an item in a group
    let targetGroup = boardData.groups.find((g) =>
      g.items.some((i) => i.id === overId)
    );

    // If not found, check if overId is a group ID itself
    if (!targetGroup) {
      targetGroup = boardData.groups.find((g) => g.id === overId);
    }

    if (!sourceGroup || !targetGroup) return;

    // Calculate new position
    const targetIndex = targetGroup.items.findIndex((i) => i.id === overId);
    const newPosition =
      targetIndex >= 0 ? targetIndex : targetGroup.items.length;

    // Optimistic update
    moveItemOptimistic(activeItemId, targetGroup.id, newPosition);

    // API call
    try {
      await boardService.moveItemToGroup(
        activeItemId,
        targetGroup.id,
        newPosition
      );
    } catch (error) {
      console.error("Failed to move item:", error);
      // Refetch board data to revert to server state
      if (boardId) {
        const data = await boardService.getBoard(boardId);
        setBoardData(data);
      }
    }
  };

  return (
    <div className="board-page">
      <header className="board-page__header">
        <h1>{boardData.name}</h1>
        {boardData.description && <p>{boardData.description}</p>}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-page__content">
          <div className="board-page__table">
            <div className="board-page__table-header">
              <div className="board-page__cell board-page__cell--name">
                Name
              </div>
              <div className="board-page__cell board-page__cell--date">
                Date
              </div>
              <div className="board-page__cell board-page__cell--owner">
                Owner
              </div>
              <div className="board-page__cell board-page__cell--created">
                Created at
              </div>
              <div className="board-page__cell board-page__cell--tags">
                Tags
              </div>
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

                <SortableContext
                  items={group.items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {group.items.map((item) => (
                    <DraggableItem key={item.id} id={item.id}>
                      <div
                        className={`board-page__row ${
                          activeId === item.id
                            ? "board-page__row--dragging"
                            : ""
                        }`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <div className="board-page__cell board-page__cell--name">
                          {item.name}
                        </div>
                        <div className="board-page__cell board-page__cell--date">
                          {(() => {
                            const dateColumn = boardData.columns.find(
                              (col) => col.type === "DATE"
                            );
                            if (dateColumn) {
                              const dateValue = getColumnValue(
                                item.values,
                                dateColumn.id
                              );
                              return dateValue || (
                                <span className="board-page__empty-value">-</span>
                              );
                            }
                            return <span className="board-page__empty-value">-</span>;
                          })()}
                        </div>
                        <div className="board-page__cell board-page__cell--owner">
                          {item.createdBy ? (
                            <div
                              className="board-page__owner"
                              title={`${item.createdBy.firstName} ${item.createdBy.lastName}`}
                            >
                              {item.createdBy.avatarUrl ? (
                                <img
                                  src={item.createdBy.avatarUrl}
                                  alt=""
                                  className="board-page__owner-avatar"
                                />
                              ) : (
                                <div className="board-page__owner-avatar board-page__owner-avatar--placeholder">
                                  {item.createdBy.firstName[0]}
                                  {item.createdBy.lastName[0]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="board-page__empty-value">-</span>
                          )}
                        </div>
                        <div className="board-page__cell board-page__cell--created">
                          {item.createdAt ? (
                            new Date(item.createdAt).toLocaleDateString()
                          ) : (
                            <span className="board-page__empty-value">-</span>
                          )}
                        </div>
                        <div className="board-page__cell board-page__cell--tags">
                          {(() => {
                            const tagsColumn = boardData.columns.find(
                              (col) => col.type === "TAGS"
                            );
                            if (tagsColumn) {
                              const tagsValue = item.values.find(
                                (v) => v.columnId === tagsColumn.id
                              );
                              if (
                                tagsValue &&
                                Array.isArray(tagsValue.value) &&
                                (tagsValue.value as string[]).length > 0
                              ) {
                                return (
                                  <div className="board-page__tags">
                                    {(tagsValue.value as string[])
                                      .slice(0, 3)
                                      .map((tag, index) => (
                                        <span
                                          key={index}
                                          className="board-page__tag"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    {(tagsValue.value as string[]).length > 3 && (
                                      <span className="board-page__tag-more">
                                        +{(tagsValue.value as string[]).length - 3}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            }
                            return <span className="board-page__empty-value">-</span>;
                          })()}
                        </div>
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
                    </DraggableItem>
                  ))}
                </SortableContext>

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
      </DndContext>

      {selectedItemId && <TaskSidebar onClose={handleCloseSidebar} />}
    </div>
  );
}
