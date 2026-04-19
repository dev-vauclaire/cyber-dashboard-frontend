import SecurityIcon from '@mui/icons-material/Security';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import CustomDatePicker from '../../components/filters/CustomDatePicker';
import Search from '../../components/filters/Search';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { DASHBOARD_SECTION_LINKS } from '../../utils/dashboardSections';

export default function DashboardHeader() {
  return (
    <Stack
      component="header"
      spacing={2}
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        py: 2,
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.88)`
          : alpha(theme.palette.background.default, 0.88),
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      })}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        sx={{ justifyContent: 'space-between', gap: 2, alignItems: { lg: 'center' } }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" fontSize="large" />
            <Typography component="h1" variant="h4">
              Cyber Dashboard
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            V1 mono-page basee sur le template Material UI existant.
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 1, alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <Search />
          <CustomDatePicker />
          <ColorModeIconDropdown />
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, overflowX: 'auto', pb: 0.5 }}>
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
    </Stack>
  );
}
