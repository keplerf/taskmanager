import { api } from './api';
import type { ApiResponse, Cta, CreateCtaInput, UpdateCtaInput } from '../types';

export async function getCtasByItem(itemId: string): Promise<Cta[]> {
  const response = await api.get<ApiResponse<Cta[]>>(`/boards/items/${itemId}/ctas`);
  return response.data.data;
}

export async function createCta(data: CreateCtaInput): Promise<Cta> {
  const response = await api.post<ApiResponse<Cta>>('/boards/ctas', data);
  return response.data.data;
}

export async function updateCta(ctaId: string, data: UpdateCtaInput): Promise<Cta> {
  const response = await api.patch<ApiResponse<Cta>>(`/boards/ctas/${ctaId}`, data);
  return response.data.data;
}

export async function deleteCta(ctaId: string): Promise<void> {
  await api.delete(`/boards/ctas/${ctaId}`);
}

export async function reorderCtas(itemId: string, ctaIds: string[]): Promise<Cta[]> {
  const response = await api.patch<ApiResponse<Cta[]>>(
    `/boards/items/${itemId}/ctas/reorder`,
    { ctaIds }
  );
  return response.data.data;
}

// Re-export types for backwards compatibility
export type { Cta, CtaType, CreateCtaInput, UpdateCtaInput } from '../types';
