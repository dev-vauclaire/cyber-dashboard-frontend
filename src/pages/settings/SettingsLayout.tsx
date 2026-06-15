import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useLocation } from 'react-router-dom';

type SettingsLayoutProps = {
  children: ReactNode;
};

const settingsTabs = [
  { label: 'CTI', to: '/settings/cti', value: '/settings/cti' },
  { label: 'Emails', to: '/settings/emails', value: '/settings/emails' },
  { label: 'Collecteurs', to: '/settings/collectors', value: '/settings/collectors' },
  { label: 'Sources', to: '/settings/sources', value: '/settings/sources' },
];

function getActiveTab(pathname: string): string {
  return settingsTabs.find((tab) => pathname.startsWith(tab.value))?.value ?? '/settings/cti';
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();

  return (
    <Box component="main" sx={{ minHeight: '100vh', px: { xs: 2, md: 3 }, pb: 5 }}>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 1700, mx: 'auto', py: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 2 }}
        >
          <Stack spacing={0.5}>
            <Typography component="h1" variant="h4">
              Paramètres
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Configuration CTI, SMTP, collecteurs et sources.
            </Typography>
          </Stack>
          <Button component={RouterLink} to="/" startIcon={<ArrowBackRoundedIcon />}>
            Dashboard
          </Button>
        </Stack>
        <Tabs value={getActiveTab(location.pathname)} variant="scrollable" scrollButtons="auto">
          {settingsTabs.map((tab) => (
            <Tab
              key={tab.value}
              component={RouterLink}
              label={tab.label}
              to={tab.to}
              value={tab.value}
            />
          ))}
        </Tabs>
        {children}
      </Stack>
    </Box>
  );
}
