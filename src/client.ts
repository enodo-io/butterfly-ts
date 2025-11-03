import qs from 'qs';

import { RedirectError, ApiError, NetworkError, type ApiErrorResponse } from './errors.js';
import type { ApiResponse, Query } from './types.js';

export interface ClientOptions {
  domain: string;
  publicKey?: string;
  version?: string;
  fetch?: typeof globalThis.fetch;
}

export interface FetchOptions {
  path?: string;
  endpoint?: string;
  id?: string | number;
  query?: Query;
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
  intercept?: (res: Response) => void;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' && value !== null && 'errors' in value && Array.isArray(value.errors)
  );
}

/**
 * Client for interacting with the Butterfly API.
 *
 * Provides a type-safe interface to make GET requests to the Butterfly API,
 * handling authentication, error responses, and response parsing.
 *
 * @example
 * ```ts
 * const client = new Client({
 *   domain: 'https://api.example.com',
 *   publicKey: 'your-api-key',
 *   version: 'v1'
 * });
 *
 * const response = await client.get<Post[]>({
 *   endpoint: 'posts',
 *   query: { page: { size: 10 } }
 * });
 * ```
 */
export class Client {
  private domain: string;
  private publicKey?: string;
  private apiVersion: string;
  private fetcher: typeof globalThis.fetch;

  /**
   * Creates a new Client instance.
   *
   * @param options - Configuration options for the client
   * @param options.domain - The base domain URL for the API (trailing slashes are automatically removed)
   * @param options.publicKey - Optional API key for authentication (sent as X-Butterfly-Key header)
   * @param options.version - API version (defaults to 'v1')
   * @param options.fetch - Optional custom fetch implementation (useful for testing or custom configurations)
   */
  constructor(options: ClientOptions) {
    this.domain = options.domain.replace(/\/$/, ''); // clean trailing slash
    this.publicKey = options.publicKey;
    this.apiVersion = options.version ?? 'v1';
    this.fetcher = options.fetch ?? globalThis.fetch;
  }

  /**
   * Performs a GET request to the Butterfly API.
   *
   * @param options - Request configuration options
   * @param options.path - Full API path (must start with '/{version}/'). Mutually exclusive with `endpoint`.
   * @param options.endpoint - API endpoint name (e.g., 'posts', 'categories'). Mutually exclusive with `path`.
   * @param options.id - Optional resource ID to append to the endpoint
   * @param options.query - Optional query parameters (filters, pagination, sorting, includes)
   * @param options.fetch - Optional custom fetch function for this request (overrides instance default)
   * @param options.signal - Optional AbortSignal for request cancellation
   * @param options.intercept - Optional callback to intercept the Response before parsing
   * @returns Promise resolving to the API response with typed data
   * @throws {Error} If invalid path or missing endpoint/path
   * @throws {NetworkError} If a network error occurs (connection failed, timeout, etc.)
   * @throws {ApiError} If the API returns an error response
   * @throws {RedirectError} If the API returns a redirect response (3xx)
   *
   * @example
   * ```ts
   * // Using endpoint
   * const posts = await client.get<Post[]>({
   *   endpoint: 'posts',
   *   query: { page: { size: 10 } }
   * });
   *
   * // Using path
   * const post = await client.get<Post>({
   *   path: '/v1/posts/123'
   * });
   *
   * // With intercept
   * await client.get({
   *   endpoint: 'posts',
   *   intercept: (res) => console.log(res.headers.get('age'))
   * });
   * ```
   */
  async get<T>({
    path,
    endpoint,
    id,
    query,
    fetch,
    signal,
    intercept,
  }: FetchOptions): Promise<ApiResponse<T>> {
    const fetcher = fetch ?? this.fetcher;

    let url: string;

    if (path) {
      if (!path.startsWith(`/${this.apiVersion}`)) {
        throw new Error(
          `[BTF-API] Invalid path : must starts with '/${this.apiVersion}', got '${path}'`,
        );
      }
      url = `${this.domain}${path}`;
    } else {
      if (!endpoint) {
        throw new Error('[BTF-API] You must provide either a path or an endpoint');
      }

      const qstr = query
        ? '?' + qs.stringify(query, { encodeValuesOnly: true }).replace('%2523', '%23')
        : '';

      url = id
        ? `${this.domain}/${this.apiVersion}/${endpoint}/${id}${qstr}`
        : `${this.domain}/${this.apiVersion}/${endpoint}${qstr}`;
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.publicKey) {
      headers['X-Butterfly-Key'] = this.publicKey;
    }

    let res: Response;
    try {
      res = await fetcher(url, { headers, signal });
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
        throw new NetworkError(error);
      }
      throw error;
    }

    if (intercept) {
      intercept(res);
    }

    const data = (await res.json()) as unknown;

    if (isApiErrorResponse(data) && data.errors.length > 0) {
      const err = data.errors[0];
      if (!err) {
        throw new ApiError(res.status, 'Unknown error');
      }
      if (err.status >= 300 && err.status < 400) {
        throw new RedirectError(err.status, err.detail);
      }
      throw new ApiError(err.status, err.title, err.detail);
    }

    if (!res.ok) {
      throw new ApiError(res.status, 'Unknown error');
    }

    return data as ApiResponse<T>;
  }
}
