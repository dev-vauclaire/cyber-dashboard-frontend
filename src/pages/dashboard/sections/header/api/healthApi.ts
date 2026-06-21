import { apiClient } from '../../../../../shared/api/client';
import type { ApiHealthResponse } from '../types/health';

const HEALTH_REQUEST_TIMEOUT_MS = 5_000;

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealthResponse> {
  const requestController = new AbortController();
  const abortRequest = () => requestController.abort();
  const timeoutId = setTimeout(abortRequest, HEALTH_REQUEST_TIMEOUT_MS);

  signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    return await apiClient.get<ApiHealthResponse>('/health', {
      signal: requestController.signal,
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
}
