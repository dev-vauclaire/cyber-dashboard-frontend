import { apiClient } from './client';
import type { SmtpConfig, SmtpConfigUpdatePayload } from '../types/smtp';

export async function fetchSmtpConfig(): Promise<SmtpConfig> {
  return apiClient.get<SmtpConfig>('/api/smtp-config');
}

export async function patchSmtpConfig(
  payload: SmtpConfigUpdatePayload,
): Promise<SmtpConfig> {
  return apiClient.patch<SmtpConfig>('/api/smtp-config', { body: payload });
}

export async function testSmtpConfig(): Promise<SmtpConfig> {
  return apiClient.post<SmtpConfig>('/api/smtp-config/test');
}

export async function activateSmtpConfig(): Promise<SmtpConfig> {
  return apiClient.post<SmtpConfig>('/api/smtp-config/activate');
}

export async function deactivateSmtpConfig(): Promise<SmtpConfig> {
  return apiClient.post<SmtpConfig>('/api/smtp-config/deactivate');
}

export async function deleteSmtpPassword(): Promise<SmtpConfig> {
  return apiClient.delete<SmtpConfig>('/api/smtp-config/password');
}
