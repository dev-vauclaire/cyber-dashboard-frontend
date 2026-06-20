import { ApiError, type ApiErrorDetail } from './errors';

type ApiQueryPrimitiveValue = string | number | boolean;

type ApiQueryValue =
  | ApiQueryPrimitiveValue
  | readonly ApiQueryPrimitiveValue[]
  | null
  | undefined;

type ApiQueryParams = Record<string, ApiQueryValue>;

type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST';

type ApiRequestOptions = {
  headers?: HeadersInit;
  query?: ApiQueryParams;
  signal?: AbortSignal;
};

type ApiMutationOptions = ApiRequestOptions & {
  body?: unknown;
};

type ApiRequestConfig = ApiMutationOptions & {
  method: ApiMethod;
};

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

function buildQueryString(query?: ApiQueryParams): string {
  if (query == null) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

function buildApiUrl(path: string, query?: ApiQueryParams): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = API_BASE_URL === '' ? normalizedPath : `${API_BASE_URL}${normalizedPath}`;
  const queryString = buildQueryString(query);

  return queryString === '' ? baseUrl : `${baseUrl}?${queryString}`;
}

async function getResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return undefined;
  }

  return response.json();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function getNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function parseErrorDetails(value: unknown): ApiErrorDetail[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((detail) => {
    if (!isRecord(detail)) {
      return [];
    }

    const location = getNonEmptyString(detail.location);
    const message = getNonEmptyString(detail.message);
    const type = getNonEmptyString(detail.type);

    if (location == null || message == null || type == null) {
      return [];
    }

    return [{ location, message, type, input: detail.input }];
  });
}

async function getErrorPayload(response: Response): Promise<unknown> {
  try {
    return await getResponsePayload(response);
  } catch {
    return undefined;
  }
}

async function buildApiError(response: Response): Promise<ApiError> {
  const payload = await getErrorPayload(response);
  const payloadRecord = isRecord(payload) ? payload : null;
  const nestedError = isRecord(payloadRecord?.error) ? payloadRecord.error : null;
  const fallbackMessage = `Erreur API (${response.status} ${response.statusText})`;
  const message =
    getNonEmptyString(nestedError?.message) ??
    getNonEmptyString(payloadRecord?.detail) ??
    getNonEmptyString(payloadRecord?.error) ??
    getNonEmptyString(payloadRecord?.message) ??
    fallbackMessage;

  return new ApiError(message, {
    code:
      getNonEmptyString(nestedError?.code) ??
      getNonEmptyString(payloadRecord?.code),
    details: parseErrorDetails(nestedError?.details ?? payloadRecord?.details),
    status: response.status,
  });
}

async function request<T>(
  path: string,
  { body, headers, method, query, signal }: ApiRequestConfig,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, query), {
    body: body == null ? undefined : JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      ...(body == null ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    method,
    signal,
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await getResponsePayload(response)) as T;
}

export const apiClient = {
  get<T>(path: string, options: ApiRequestOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'GET',
    });
  },
  patch<T = void>(path: string, options: ApiMutationOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'PATCH',
    });
  },
  post<T = void>(path: string, options: ApiMutationOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'POST',
    });
  },
  delete<T = void>(path: string, options: ApiRequestOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  },
};
