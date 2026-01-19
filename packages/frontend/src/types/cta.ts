/**
 * CTA (Call-to-Action) button types
 */
export type CtaType = 'LINK' | 'BUTTON' | 'ACTION';

/**
 * CTA item attached to a board item
 */
export interface Cta {
  id: string;
  itemId: string;
  label: string;
  url: string | null;
  type: CtaType;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new CTA
 */
export interface CreateCtaInput {
  itemId: string;
  label: string;
  url?: string;
  type?: CtaType;
  color?: string;
}

/**
 * Input for updating an existing CTA
 */
export interface UpdateCtaInput {
  label?: string;
  url?: string;
  type?: CtaType;
  color?: string;
  position?: number;
}

/**
 * Form data for CTA editing UI
 */
export interface CtaFormData {
  label: string;
  url: string;
  type: CtaType;
  color: string;
}

/**
 * Optimistic action types for CTA updates
 */
export type OptimisticCtaAction =
  | { type: 'add'; cta: Cta }
  | { type: 'update'; id: string; data: Partial<Cta> }
  | { type: 'delete'; id: string }
  | { type: 'reorder'; ctas: Cta[] };
