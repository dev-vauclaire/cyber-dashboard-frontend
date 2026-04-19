export type IsoUtcDateTimeString = string;

export type DateRangeQuery = {
  from?: IsoUtcDateTimeString;
  to?: IsoUtcDateTimeString;
};

export type Pagination = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};
