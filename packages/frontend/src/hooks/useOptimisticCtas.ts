import { useOptimistic, useTransition, useCallback } from 'react';
import * as ctaService from '../services/ctaService';
import type { Cta, CreateCtaInput, UpdateCtaInput } from '../services/ctaService';

type OptimisticAction =
  | { type: 'add'; cta: Cta }
  | { type: 'update'; ctaId: string; data: UpdateCtaInput }
  | { type: 'delete'; ctaId: string }
  | { type: 'reorder'; ctaIds: string[] };

function ctaReducer(state: Cta[], action: OptimisticAction): Cta[] {
  switch (action.type) {
    case 'add':
      return [...state, action.cta];

    case 'update':
      return state.map((cta) =>
        cta.id === action.ctaId
          ? { ...cta, ...action.data, updatedAt: new Date().toISOString() }
          : cta
      );

    case 'delete':
      return state.filter((cta) => cta.id !== action.ctaId);

    case 'reorder':
      const ctaMap = new Map(state.map((cta) => [cta.id, cta]));
      return action.ctaIds
        .map((id, index) => {
          const cta = ctaMap.get(id);
          return cta ? { ...cta, position: index } : null;
        })
        .filter((cta): cta is Cta => cta !== null);

    default:
      return state;
  }
}

interface UseOptimisticCtasReturn {
  ctas: Cta[];
  isPending: boolean;
  addCta: (input: CreateCtaInput) => Promise<Cta | null>;
  updateCta: (ctaId: string, data: UpdateCtaInput) => Promise<Cta | null>;
  removeCta: (ctaId: string) => Promise<boolean>;
  reorderCtas: (ctaIds: string[]) => Promise<Cta[] | null>;
}

export function useOptimisticCtas(
  initialCtas: Cta[],
  itemId: string,
  onError?: (error: Error) => void
): UseOptimisticCtasReturn {
  const [isPending, startTransition] = useTransition();
  const [optimisticCtas, dispatchOptimistic] = useOptimistic(initialCtas, ctaReducer);

  const addCta = useCallback(
    async (input: CreateCtaInput): Promise<Cta | null> => {
      // Create optimistic CTA with temporary ID
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimisticCta: Cta = {
        id: tempId,
        itemId: input.itemId,
        label: input.label,
        url: input.url ?? null,
        type: input.type ?? 'LINK',
        color: input.color ?? '#0073ea',
        position: optimisticCtas.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let result: Cta | null = null;

      startTransition(async () => {
        dispatchOptimistic({ type: 'add', cta: optimisticCta });

        try {
          result = await ctaService.createCta(input);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to create CTA'));
        }
      });

      return result;
    },
    [optimisticCtas.length, dispatchOptimistic, onError]
  );

  const updateCta = useCallback(
    async (ctaId: string, data: UpdateCtaInput): Promise<Cta | null> => {
      let result: Cta | null = null;

      startTransition(async () => {
        dispatchOptimistic({ type: 'update', ctaId, data });

        try {
          result = await ctaService.updateCta(ctaId, data);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to update CTA'));
        }
      });

      return result;
    },
    [dispatchOptimistic, onError]
  );

  const removeCta = useCallback(
    async (ctaId: string): Promise<boolean> => {
      let success = false;

      startTransition(async () => {
        dispatchOptimistic({ type: 'delete', ctaId });

        try {
          await ctaService.deleteCta(ctaId);
          success = true;
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to delete CTA'));
        }
      });

      return success;
    },
    [dispatchOptimistic, onError]
  );

  const reorderCtas = useCallback(
    async (ctaIds: string[]): Promise<Cta[] | null> => {
      let result: Cta[] | null = null;

      startTransition(async () => {
        dispatchOptimistic({ type: 'reorder', ctaIds });

        try {
          result = await ctaService.reorderCtas(itemId, ctaIds);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to reorder CTAs'));
        }
      });

      return result;
    },
    [itemId, dispatchOptimistic, onError]
  );

  return {
    ctas: optimisticCtas,
    isPending,
    addCta,
    updateCta,
    removeCta,
    reorderCtas,
  };
}
