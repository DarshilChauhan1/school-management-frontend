export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasNext : boolean;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}