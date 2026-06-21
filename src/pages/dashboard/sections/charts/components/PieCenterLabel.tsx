import * as React from 'react';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

type StyledTextProps = {
  variant: 'primary' | 'secondary';
};

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  textAnchor: 'middle',
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: { variant: 'secondary' },
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

type PieCenterLabelProps = {
  primaryText: string;
  secondaryText: string;
};

export default function PieCenterLabel({
  primaryText,
  secondaryText,
}: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={primaryY + 24}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}
