/**
 * Generic API response wrapper used across all services
 */

import type { ReactNode } from "react";

export interface BasicItemProps {
  id: string;
  children: ReactNode;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Generic message response for simple API operations
 */
export interface MessageResponse {
  success: boolean;
  message: string;
}
