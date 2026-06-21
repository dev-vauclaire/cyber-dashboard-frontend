export const dashboardQueryKeys = {
  dashboardOverview: ['dashboardOverview'] as const,
  dashboardTopology: (minDistinctSourceCount: number, alertLimit: number) =>
    ['dashboardTopology', minDistinctSourceCount, alertLimit] as const,
};
