type ApiQueryPrimitiveValue = string | number | boolean;

type ApiQueryValue =
  | ApiQueryPrimitiveValue
  | readonly ApiQueryPrimitiveValue[]
  | null
  | undefined;

type ApiQueryParams = Record<string, ApiQueryValue>;

type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

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

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

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

async function buildApiError(response: Response): Promise<Error> {
  const payload = (await getResponsePayload(response)) as
    | { detail?: string; error?: string }
    | undefined;

  const message =
    payload?.detail ??
    payload?.error ??
    `Erreur API (${response.status} ${response.statusText})`;

  return new Error(message);
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
  put<T = void>(path: string, options: ApiMutationOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'PUT',
    });
  },
  delete<T = void>(path: string, options: ApiRequestOptions = {}) {
    return request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  },
};
