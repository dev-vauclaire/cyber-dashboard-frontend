import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import type { CommonIpAlertListItem } from '../types/alertTypes';
import { formatDate } from '../../../../../shared/utils/dateUtils';
import { formatSourceCount } from '../utils/formatters';

type CommonIpAlertRowProps = {
  alert: CommonIpAlertListItem;
  onClick: () => void;
};

export default function CommonIpAlertRow({
  alert,
  onClick,
}: CommonIpAlertRowProps) {
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={onClick}>
        <TableCell>{alert.id}</TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>{alert.attacker_ip}</TableCell>
        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            label={formatSourceCount(alert.distinct_source_count)}
          />
        </TableCell>
        <TableCell>{formatDate(alert.first_seen_at)}</TableCell>
        <TableCell>{formatDate(alert.last_seen_at)}</TableCell>
      </TableRow>
    </>
  );
}
