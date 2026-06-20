import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useForkRef } from '@mui/material/utils';
import Button from '@mui/material/Button';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DatePickerFieldProps } from '@mui/x-date-pickers/DatePicker';
import { frFR } from '@mui/x-date-pickers/locales';
import {
  useParsedFormat,
  usePickerContext,
  useSplitFieldProps,
} from '@mui/x-date-pickers';

dayjs.extend(localizedFormat);
dayjs.locale('fr');

type ButtonFieldProps = DatePickerFieldProps;

type CustomDatePickerProps = {
  label: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
};

function ButtonField(props: ButtonFieldProps) {
  const { forwardedProps } = useSplitFieldProps(props, 'date');
  const pickerContext = usePickerContext();
  const handleRef = useForkRef(pickerContext.triggerRef, pickerContext.rootRef);
  const parsedFormat = useParsedFormat();

  const valueStr =
    pickerContext.value == null
      ? parsedFormat
      : pickerContext.value.format(pickerContext.fieldFormat);

  return (
    <Button
      {...forwardedProps}
      variant="outlined"
      ref={handleRef}
      size="small"
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      sx={{ minWidth: 'fit-content' }}
      onClick={() => pickerContext.setOpen((prev) => !prev)}
    >
      {pickerContext.label ?? valueStr}
    </Button>
  );
}

function buildPickerLabel(label: string, value: Dayjs | null) {
  if (value == null) {
    return label;
  }

  return `${label} ${value.format('DD/MM/YYYY')}`;
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: CustomDatePickerProps) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="fr"
      localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DatePicker
        value={value}
        label={buildPickerLabel(label, value)}
        format="DD/MM/YYYY"
        onChange={onChange}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        slots={{ field: ButtonField }}
        slotProps={{
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
        }}
        views={['day', 'month', 'year']}
      />
    </LocalizationProvider>
  );
}
