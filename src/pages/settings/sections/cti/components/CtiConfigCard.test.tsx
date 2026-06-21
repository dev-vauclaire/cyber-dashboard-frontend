import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CtiConfig } from '../../../../../shared/cti/types';
import CtiConfigCard from './CtiConfigCard';

const BASE_CONFIG: CtiConfig = {
  id: 1,
  code: 'virustotal',
  label: 'VirusTotal',
  is_key_required: true,
  is_active: true,
  has_api_key: true,
  api_key_hint: '••••1234',
  last_validation_status: 'success',
  last_validation_at: '2026-06-21T10:00:00Z',
  last_validation_error: null,
  created_at: '2026-06-20T10:00:00Z',
  updated_at: '2026-06-21T10:00:00Z',
};

const DEFAULT_PROPS = {
  draftApiKey: '',
  isBusy: false,
  pendingAction: null,
  onApiKeyChange: vi.fn(),
  onDeleteKey: vi.fn(),
  onToggleActive: vi.fn(),
  onValidate: vi.fn(),
} as const;

describe('CtiConfigCard', () => {
  it('offers to revalidate an already saved key', () => {
    render(<CtiConfigCard {...DEFAULT_PROPS} config={BASE_CONFIG} />);

    expect(screen.getByRole('button', { name: 'Revalider' })).toBeEnabled();
  });

  it('requires a key before the first validation', () => {
    render(
      <CtiConfigCard
        {...DEFAULT_PROPS}
        config={{ ...BASE_CONFIG, is_active: false, has_api_key: false }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Valider et activer' })).toBeDisabled();
  });

  it('shows a local progress indicator while validating', () => {
    render(
      <CtiConfigCard
        {...DEFAULT_PROPS}
        config={BASE_CONFIG}
        isBusy
        pendingAction="validate"
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revalider' })).toBeDisabled();
  });
});
