export interface TErrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources: TErrorSources[];
  stack?: string;
  error?: unknown;
}

export interface TPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TPaginatedResponse<T> {
  meta: TPaginationMeta;
  data: T[];
}

export interface TQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}