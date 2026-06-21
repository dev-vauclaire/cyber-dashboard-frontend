export const alertsQueryKeys = {
  commonIpAlertDetail: (alertId: number, refreshToken: number) =>
    ['commonIpAlertDetail', alertId, refreshToken] as const,
  commonIpAlerts: (query: unknown, refreshToken: number) =>
    ['commonIpAlerts', query, refreshToken] as const,
};
