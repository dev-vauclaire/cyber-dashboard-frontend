export const chartsQueryKeys = {
  bySource: (from: string | null, to: string | null, refreshToken: number) =>
    ['chartsBySource', from, to, refreshToken] as const,
  byType: (from: string | null, to: string | null, refreshToken: number) =>
    ['chartsByType', from, to, refreshToken] as const,
  timeline: (from: string | null, to: string | null, refreshToken: number) =>
    ['chartsTimeline', from, to, refreshToken] as const,
};
