export interface IApiError {
  status: number;
  title: string;
  detail: string;
}

export type ApiErrorResponse = {
  errors: IApiError[];
};

export class RedirectError extends Error {
  status: number;
  location: string;

  constructor(status: number, location: string) {
    super(`[BTF-API] Redirect (${status}) to ${location}`);
    this.name = 'RedirectError';
    this.status = status;
    this.location = location;
  }
}

export class ApiError extends Error {
  status: number;
  title: string;
  details: string;

  constructor(status: number, title: string, details: string = '') {
    super(`[BTF-API] Error ${status}: ${title}`);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.details = details;
  }
}

export class NetworkError extends Error {
  originalError: Error;

  constructor(originalError: Error) {
    super(`[BTF-API] Network error: ${originalError.message}`);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}
