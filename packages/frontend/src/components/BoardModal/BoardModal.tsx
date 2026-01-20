import { useState, useEffect } from "react";
import * as boardService from "../../services/boardService";
import "./BoardModal.css";
import Button from "@/components/Atoms/Button";

interface Board {
  id: string;
  name: string;
  description: string | null;
}

interface BoardModalProps {
  workspaceId: string;
  board?: Board | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BoardModal({
  workspaceId,
  board,
  onClose,
  onSaved,
}: BoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!board;

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || "");
    }
  }, [board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Board name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && board) {
        await boardService.updateBoard(board.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await boardService.createBoard({
          name: name.trim(),
          description: description.trim() || undefined,
          workspaceId,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(isEditing ? "Failed to update board" : "Failed to create board");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="board-modal-overlay" onClick={onClose} />
      <div className="board-modal">
        <div className="board-modal__header">
          <h2 className="board-modal__title">
            {isEditing ? "Edit Board" : "Create Board"}
          </h2>
          <button className="board-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="board-modal__content" onSubmit={handleSubmit}>
          {error && <div className="board-modal__error">{error}</div>}

          <div className="board-modal__field">
            <label htmlFor="board-name">Name</label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter board name"
              autoFocus
            />
          </div>

          <div className="board-modal__field">
            <label htmlFor="board-description">Description (optional)</label>
            <textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter board description"
              rows={3}
            />
          </div>

          <div className="board-modal__actions">
            <Button
              type="button"
              className="board-modal__btn board-modal__btn--secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="board-modal__btn board-modal__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Board"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
