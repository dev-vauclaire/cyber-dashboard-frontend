import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteAttacksCollectorConfig } from './collectorsApi';

describe('deleteAttacksCollectorConfig', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes the complete collector configuration', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteAttacksCollectorConfig(42)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/attacks-collector-config/42',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
