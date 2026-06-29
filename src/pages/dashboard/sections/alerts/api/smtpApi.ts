import { apiClient } from '../../../../../shared/api/client';
import type { SmtpConfig } from '../../../../settings/sections/emails/types/smtpTypes';

export async function fetchSmtpConfig(): Promise<SmtpConfig> {
  return apiClient.get<SmtpConfig>('/api/smtp-config');
}
