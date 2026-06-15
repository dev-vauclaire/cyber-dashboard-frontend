import type { IsoUtcDateTimeString } from './common';

export type SmtpConfig = {
  id: number;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_from: string | null;
  smtp_from_name: string | null;
  auto_email_enabled: boolean;
  is_active: boolean;
  has_smtp_password: boolean;
  smtp_password_hint: string | null;
  last_validation_status: string | null;
  last_validation_at: IsoUtcDateTimeString | null;
  last_validation_error: string | null;
  created_at: IsoUtcDateTimeString;
  updated_at: IsoUtcDateTimeString;
};

export type SmtpConfigUpdatePayload = {
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_from?: string | null;
  smtp_from_name?: string | null;
  auto_email_enabled?: boolean;
};
