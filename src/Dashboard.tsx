import * as React from 'react';
import type { Dayjs } from 'dayjs';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppTheme from './shared-theme/AppTheme';
import AlertsSection from './sections/alerts/AlertsSection';
import AttacksSection from './sections/attacks/AttacksSection';
import ChartsSection from './sections/charts/ChartsSection';
import DashboardHeader from './sections/header/DashboardHeader';
import OverviewSection from './sections/overview/OverviewSection';
import SourcesSection from './sections/sources/SourcesSection';
import type { DashboardGlobalDateRange } from './types/dashboard';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import { createDefaultDashboardGlobalDateRange } from './utils/dashboardFilters';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

function normalizeGlobalDateRange(
  currentRange: DashboardGlobalDateRange,
  field: 'from' | 'to',
  nextValue: Dayjs | null,
): DashboardGlobalDateRange {
  if (field === 'from') {
    if (nextValue == null) {
      return {
        ...currentRange,
        from: null,
      };
    }

    if (currentRange.to != null && nextValue.isAfter(currentRange.to, 'day')) {
      return {
        from: nextValue,
        to: nextValue,
      };
    }

    return {
      ...currentRange,
      from: nextValue,
    };
  }

  if (nextValue == null) {
    return {
      ...currentRange,
      to: null,
    };
  }

  if (currentRange.from != null && nextValue.isBefore(currentRange.from, 'day')) {
    return {
      from: nextValue,
      to: nextValue,
    };
  }

  return {
    ...currentRange,
    to: nextValue,
  };
}

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const [globalDateRange, setGlobalDateRange] = React.useState<DashboardGlobalDateRange>(
    () => createDefaultDashboardGlobalDateRange(),
  );
  const [refreshToken, setRefreshToken] = React.useState(0);

  function handleGlobalDateChange(field: 'from' | 'to', value: Dayjs | null) {
    setGlobalDateRange((currentRange) =>
      normalizeGlobalDateRange(currentRange, field, value),
    );
  }

  function handleGlobalRefresh() {
    setRefreshToken((currentToken) => currentToken + 1);
  }

  const dashboardControls = {
    globalDateRange,
    refreshToken,
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            scrollBehavior: 'smooth',
          })}
        >
          <Stack
            spacing={3}
            sx={{
              alignItems: 'center',
              px: { xs: 2, md: 3 },
              pb: 5,
            }}
          >
            <DashboardHeader
              globalDateRange={globalDateRange}
              onGlobalFromChange={(value) => handleGlobalDateChange('from', value)}
              onGlobalToChange={(value) => handleGlobalDateChange('to', value)}
              onGlobalRefresh={handleGlobalRefresh}
            />
            <Stack
              spacing={4}
              sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}
            >
              <OverviewSection refreshToken={refreshToken} />
              <ChartsSection dashboardControls={dashboardControls} />
              <AlertsSection dashboardControls={dashboardControls} />
              <AttacksSection dashboardControls={dashboardControls} />
              <SourcesSection dashboardControls={dashboardControls} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
