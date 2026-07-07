import { describe, it, expect, vi } from 'vitest';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import {
  submitTemplate,
  listTemplates,
  TemplateValidationError,
  GraphApiError,
} from '../src/index';

const template: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** A vi mock typed as `fetch`. */
function mockFetch(impl: () => Promise<Response>) {
  return vi.fn(impl) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe('submitTemplate', () => {
  it('POSTs a validated template with auth + JSON body', async () => {
    const fetchMock = mockFetch(async () => jsonResponse({ id: '123', status: 'PENDING' }));
    const res = await submitTemplate(template, { wabaId: 'W1', token: 'T1', fetch: fetchMock });

    expect(res.id).toBe('123');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.com/v21.0/W1/message_templates');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer T1');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ name: 'order_update', language: 'en_US', category: 'UTILITY' });
    expect(body.components).toHaveLength(1);
  });

  it('honours a custom Graph API version', async () => {
    const fetchMock = mockFetch(async () => jsonResponse({ id: '1' }));
    await submitTemplate(template, { wabaId: 'W1', token: 'T1', version: 'v19.0', fetch: fetchMock });
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain('/v19.0/W1/');
  });

  it('refuses an invalid template without calling the API', async () => {
    const fetchMock = mockFetch(async () => jsonResponse({}));
    const invalid = { ...template, name: 'Bad Name' };
    await expect(
      submitTemplate(invalid, { wabaId: 'W1', token: 'T1', fetch: fetchMock }),
    ).rejects.toBeInstanceOf(TemplateValidationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws GraphApiError on a non-2xx response', async () => {
    const fetchMock = mockFetch(async () =>
      jsonResponse({ error: { message: 'Invalid OAuth access token' } }, 401),
    );
    await expect(
      submitTemplate(template, { wabaId: 'W1', token: 'bad', fetch: fetchMock }),
    ).rejects.toMatchObject({ name: 'GraphApiError', status: 401 });
  });
});

describe('listTemplates', () => {
  it('GETs with query params and returns the data array', async () => {
    const fetchMock = mockFetch(async () =>
      jsonResponse({ data: [{ id: '1', name: 'welcome' }], paging: {} }),
    );
    const res = await listTemplates(
      { wabaId: 'W1', token: 'T1', fetch: fetchMock },
      { limit: 10, fields: ['name', 'status'] },
    );

    expect(res.data).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit | undefined];
    expect(url).toContain('/W1/message_templates?');
    expect(url).toContain('limit=10');
    expect(url).toContain('fields=name%2Cstatus');
    expect(init?.method ?? 'GET').toBe('GET');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer T1');
  });

  it('throws GraphApiError and exposes the error body', async () => {
    const fetchMock = mockFetch(async () => jsonResponse({ error: { message: 'nope' } }, 400));
    await expect(
      listTemplates({ wabaId: 'W1', token: 'T1', fetch: fetchMock }),
    ).rejects.toBeInstanceOf(GraphApiError);
  });
});
