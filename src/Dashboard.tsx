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
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
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
            <DashboardHeader />
            <Stack
              spacing={4}
              sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}
            >
              <OverviewSection />
              <ChartsSection />
              <AlertsSection />
              <AttacksSection />
              <SourcesSection />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
