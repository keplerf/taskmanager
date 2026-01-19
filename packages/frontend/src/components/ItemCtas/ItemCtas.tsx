import { useState } from 'react';
import { useOptimisticCtas } from '../../hooks/useOptimisticCtas';
import type { Cta, CtaType } from '../../services/ctaService';
import './ItemCtas.css';
import { Button } from '../Atoms/Button/Button';

interface ItemCtasProps {
  itemId: string;
  initialCtas: Cta[];
  onCtasChange?: (ctas: Cta[]) => void;
}

interface CtaFormData {
  label: string;
  url: string;
  type: CtaType;
  color: string;
}

const defaultFormData: CtaFormData = {
  label: '',
  url: '',
  type: 'LINK',
  color: '#0073ea',
};

const ctaTypeOptions: { value: CtaType; label: string }[] = [
  { value: 'LINK', label: 'Link' },
  { value: 'BUTTON', label: 'Button' },
  { value: 'ACTION', label: 'Action' },
];

const colorOptions = [
  '#0073ea',
  '#00c875',
  '#e2445c',
  '#fdab3d',
  '#a25ddc',
  '#579bfc',
  '#ff158a',
  '#037f4c',
];

export default function ItemCtas({ itemId, initialCtas, onCtasChange }: ItemCtasProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCtaId, setEditingCtaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CtaFormData>(defaultFormData);
  const [error, setError] = useState<string | null>(null);

  const { ctas, isPending, addCta, updateCta, removeCta } = useOptimisticCtas(
    initialCtas,
    itemId,
    (err) => setError(err.message)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.label.trim()) {
      setError('Label is required');
      return;
    }

    if (editingCtaId) {
      await updateCta(editingCtaId, {
        label: formData.label,
        url: formData.url || undefined,
        type: formData.type,
        color: formData.color,
      });
    } else {
      await addCta({
        itemId,
        label: formData.label,
        url: formData.url || undefined,
        type: formData.type,
        color: formData.color,
      });
    }

    setFormData(defaultFormData);
    setShowForm(false);
    setEditingCtaId(null);
    onCtasChange?.(ctas);
  };

  const handleEdit = (cta: Cta) => {
    setFormData({
      label: cta.label,
      url: cta.url ?? '',
      type: cta.type,
      color: cta.color,
    });
    setEditingCtaId(cta.id);
    setShowForm(true);
  };

  const handleDelete = async (ctaId: string) => {
    setError(null);
    await removeCta(ctaId);
    onCtasChange?.(ctas);
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setShowForm(false);
    setEditingCtaId(null);
    setError(null);
  };

  const handleCtaClick = (cta: Cta) => {
    if (cta.type === 'LINK' && cta.url) {
      window.open(cta.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="item-ctas">
      <div className="item-ctas__header">
        <h4 className="item-ctas__title">Call to Actions</h4>
        {!showForm && (
          <Button
            type="button"
            className="item-ctas__add-btn"
            onClick={() => setShowForm(true)}
            disabled={isPending}
          >
            + Add CTA
            </Button>
        )}
      </div>

      {error && <div className="item-ctas__error">{error}</div>}

      {showForm && (
        <form className="item-ctas__form" onSubmit={handleSubmit}>
          <div className="item-ctas__form-field">
            <label htmlFor="cta-label">Label</label>
            <input
              id="cta-label"
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Enter CTA label"
              autoFocus
            />
          </div>

          <div className="item-ctas__form-field">
            <label htmlFor="cta-url">URL</label>
            <input
              id="cta-url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="item-ctas__form-field">
            <label htmlFor="cta-type">Type</label>
            <select
              id="cta-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CtaType })}
            >
              {ctaTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="item-ctas__form-field">
            <label>Color</label>
            <div className="item-ctas__color-picker">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`item-ctas__color-option ${formData.color === color ? 'item-ctas__color-option--selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="item-ctas__form-actions">
            <button
              type="button"
              className="item-ctas__cancel-btn"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="item-ctas__submit-btn"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : editingCtaId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      )}

      <div className="item-ctas__list">
        {ctas.length === 0 && !showForm && (
          <p className="item-ctas__empty">No CTAs yet. Add one to get started.</p>
        )}

        {ctas.map((cta) => (
          <div
            key={cta.id}
            className={`item-ctas__item ${cta.id.startsWith('temp-') ? 'item-ctas__item--pending' : ''}`}
          >
            <button
              type="button"
              className="item-ctas__cta-btn"
              style={{ backgroundColor: cta.color }}
              onClick={() => handleCtaClick(cta)}
              disabled={cta.id.startsWith('temp-')}
            >
              {cta.label}
              {cta.type === 'LINK' && cta.url && (
                <span className="item-ctas__link-icon">↗</span>
              )}
            </button>

            <div className="item-ctas__item-actions">
              <button
                type="button"
                className="item-ctas__edit-btn"
                onClick={() => handleEdit(cta)}
                disabled={isPending || cta.id.startsWith('temp-')}
                aria-label="Edit CTA"
              >
                Edit
              </button>
              <button
                type="button"
                className="item-ctas__delete-btn"
                onClick={() => handleDelete(cta.id)}
                disabled={isPending || cta.id.startsWith('temp-')}
                aria-label="Delete CTA"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
