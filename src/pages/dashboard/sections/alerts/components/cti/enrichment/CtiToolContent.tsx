import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export default function CtiToolContent({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        alignItems: 'start',
      }}
    >
      {children}
    </Box>
  );
}
