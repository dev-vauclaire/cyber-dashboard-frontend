import CssBaseline from '@mui/material/CssBaseline';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppTheme from '../../shared/theme/AppTheme';
import SettingsLayout from './SettingsLayout';
import CollectorsSettingsSection from './sections/collectors/CollectorsSettingsSection';
import CtiSettingsSection from './sections/cti/CtiSettingsSection';
import EmailSettingsSection from './sections/emails/EmailSettingsSection';
import SourcesSettingsSection from './sections/sources/SourcesSettingsSection';

export default function SettingsPage() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SettingsLayout>
        <Routes>
          <Route index element={<Navigate to="cti" replace />} />
          <Route path="cti" element={<CtiSettingsSection />} />
          <Route path="emails" element={<EmailSettingsSection />} />
          <Route path="collectors" element={<CollectorsSettingsSection />} />
          <Route path="sources" element={<SourcesSettingsSection />} />
        </Routes>
      </SettingsLayout>
    </AppTheme>
  );
}
