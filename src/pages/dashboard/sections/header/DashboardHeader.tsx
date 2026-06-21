import { useLayoutEffect, useRef, useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import ColorModeIconDropdown from '../../../../shared/theme/ColorModeIconDropdown';
import ApiHealthIndicator from './components/ApiHealthIndicator';
import { DASHBOARD_SECTION_LINKS } from './constants/sectionLinks';

export default function DashboardHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return undefined;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerElement.getBoundingClientRect().height);
    };
    const resizeObserver = new ResizeObserver(updateHeaderHeight);

    updateHeaderHeight();
    resizeObserver.observe(headerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <AppBar
        ref={headerRef}
        position="fixed"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          width: '100%',
          top: 0,
          zIndex: theme.zIndex.appBar,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.88)`
            : alpha(theme.palette.background.default, 0.88),
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Toolbar
          disableGutters
          sx={{
            maxWidth: { sm: '100%', md: '1700px' },
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            py: 1.5,
            width: '100%',
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            sx={{ justifyContent: 'space-between', gap: 2, alignItems: { lg: 'center' }, width: '100%' }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" fontSize="large" />
                <Typography component="h1" variant="h4">
                  Tableau de bord de cybersécurité
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Visualisez et mutualisez les attaques remontées par vos outils de sécurité
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{ gap: 1, alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <ApiHealthIndicator />
              <Button
                component={RouterLink}
                to="/settings"
                color="inherit"
                size="small"
                startIcon={<SettingsRoundedIcon fontSize="small" />}
              >
                Paramètres
              </Button>
              <ColorModeIconDropdown />
            </Stack>
          </Stack>
        </Toolbar>
        <Toolbar
          disableGutters
          variant="dense"
          sx={{
            maxWidth: { sm: '100%', md: '1700px' },
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            width: '100%',
            minHeight: 'auto',
          }}
        >
          <Stack
            direction="row"
            sx={{ gap: 1, overflowX: 'auto', pb: 0.5, width: '100%' }}
          >
            {DASHBOARD_SECTION_LINKS.map((section) => (
              <Button
                key={section.id}
                href={`#${section.id}`}
                color="inherit"
                size="small"
                sx={{ flexShrink: 0 }}
              >
                {section.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          height: headerHeight == null ? { xs: 184, lg: 128 } : `${headerHeight}px`,
          width: '100%',
        }}
      />
    </>
  );
}
