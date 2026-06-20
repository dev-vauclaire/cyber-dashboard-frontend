export type ApiErrorDetail = {
  location: string;
  message: string;
  type: string;
  input?: unknown;
};

type ApiErrorOptions = {
  code?: string | null;
  details?: ApiErrorDetail[];
  status: number;
};

export class ApiError extends Error {
  readonly code: string | null;
  readonly details: ApiErrorDetail[];
  readonly status: number;

  constructor(message: string, { code = null, details = [], status }: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}