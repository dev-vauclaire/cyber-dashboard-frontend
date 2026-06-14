import { apiClient } from './client';
import type {
  CommonIpAlertDetail,
  CommonIpAlertsListResponse,
  CommonIpAlertsQuery,
} from '../types/alerts';

export async function fetchCommonIpAlerts(
  query?: CommonIpAlertsQuery,
): Promise<CommonIpAlertsListResponse> {
  return apiClient.get<CommonIpAlertsListResponse>('/api/alerts/common-ips', {
    query,
  });
}

export async function fetchCommonIpAlertDetail(
  alertId: number,
): Promise<CommonIpAlertDetail> {
  return apiClient.get<CommonIpAlertDetail>(`/api/alerts/common-ips/${alertId}`);
}
