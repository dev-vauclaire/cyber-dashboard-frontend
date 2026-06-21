import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function LoadingTableState() {
  return (
    <Stack spacing={1.25} sx={{ pt: 1 }}>
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
    </Stack>
  );
}
