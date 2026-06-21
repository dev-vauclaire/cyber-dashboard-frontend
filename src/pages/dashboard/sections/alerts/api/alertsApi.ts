import { apiClient } from '../../../../../shared/api/client';
import type {
  CommonIpAlertDetail,
  CommonIpAlertsListResponse,
  CommonIpAlertsQuery,
  AlertEmailPayload,
  AlertEmailResponse,
} from '../types/alertTypes';

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

export async function sendCommonIpAlertEmail(
  alertId: number,
  payload: AlertEmailPayload,
): Promise<AlertEmailResponse> {
  return apiClient.post<AlertEmailResponse>(`/api/alerts/common-ips/${alertId}/email`, {
    body: payload,
  });
}
