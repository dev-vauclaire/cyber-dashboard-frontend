import type {
  CtiEnrichmentProvider,
  CtiEnrichmentResponseByProvider,
} from '../../../../../../../shared/cti/types';

export type ChartItem = {
  id: string;
  label: string;
  value: number;
};

export type CtiFieldEntry = readonly [string, unknown];

export type CtiToolQuery<Provider extends CtiEnrichmentProvider> = {
  data?: CtiEnrichmentResponseByProvider[Provider];
  isError: boolean;
  isLoading: boolean;
};

export type CtiToolComponentProps<Provider extends CtiEnrichmentProvider> = {
  query: CtiToolQuery<Provider>;
};
