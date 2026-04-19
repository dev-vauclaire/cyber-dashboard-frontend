import { apiClient } from './client';
import type { CommonIpAlertDetail, CommonIpAlertsListResponse } from '../types/alerts';

export async function fetchCommonIpAlerts(): Promise<CommonIpAlertsListResponse> {
  return apiClient.get<CommonIpAlertsListResponse>('/api/alerts/common-ips');
}

export async function fetchCommonIpAlertDetail(
  ipAddress: string,
): Promise<CommonIpAlertDetail> {
  return apiClient.get<CommonIpAlertDetail>(
    `/api/alerts/common-ips/${encodeURIComponent(ipAddress)}`,
  );
}
