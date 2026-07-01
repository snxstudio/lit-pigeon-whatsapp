import {
  validateTemplate,
  type WhatsAppTemplate,
  type ValidationIssue,
} from '@lit-pigeon/whatsapp-core';

const DEFAULT_BASE_URL = 'https://graph.facebook.com';
const DEFAULT_VERSION = 'v21.0';

/** Connection details for Meta's Graph API. */
export interface CloudApiOptions {
  /** WhatsApp Business Account (WABA) ID. */
  wabaId: string;
  /** Access token with the `whatsapp_business_management` permission. */
  token: string;
  /** Graph API version. Defaults to `v21.0`. */
  version?: string;
  /** Graph API base URL. Defaults to `https://graph.facebook.com`. */
  baseUrl?: string;
  /** `fetch` implementation to use. Defaults to the global `fetch`. */
  fetch?: typeof fetch;
}

/** Meta's response to a successful template create. */
export interface SubmitTemplateResponse {
  id: string;
  status?: string;
  category?: string;
  [key: string]: unknown;
}

export interface ListTemplatesParams {
  /** Fields to return, e.g. `['name', 'status', 'category']`. */
  fields?: string[];
  /** Page size. */
  limit?: number;
  /** Pagination cursors from a previous response's `paging`. */
  after?: string;
  before?: string;
}

export interface TemplateSummary {
  id: string;
  name?: string;
  status?: string;
  category?: string;
  language?: string;
  [key: string]: unknown;
}

export interface ListTemplatesResponse {
  data: TemplateSummary[];
  paging?: { cursors?: { before?: string; after?: string }; next?: string; previous?: string };
}

/** Thrown when a template fails validation before it would be submitted. */
export class TemplateValidationError extends Error {
  readonly errors: ValidationIssue[];
  constructor(errors: ValidationIssue[]) {
    super(`Template is invalid and was not submitted: ${errors.map((e) => e.message).join('; ')}`);
    this.name = 'TemplateValidationError';
    this.errors = errors;
  }
}

/** Thrown when the Graph API responds with a non-2xx status. */
export class GraphApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, body: unknown) {
    super(`Graph API request failed with status ${status}`);
    this.name = 'GraphApiError';
    this.status = status;
    this.body = body;
  }
}

function resolveFetch(options: CloudApiOptions): typeof fetch {
  const impl = options.fetch ?? globalThis.fetch;
  if (!impl) {
    throw new Error('No fetch implementation available; pass one via options.fetch.');
  }
  return impl;
}

function templatesUrl(options: CloudApiOptions): string {
  const version = options.version ?? DEFAULT_VERSION;
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  return `${baseUrl}/${version}/${options.wabaId}/message_templates`;
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new GraphApiError(response.status, body);
  }
  return (await response.json()) as T;
}

/**
 * Validate `template`, then create it via
 * `POST /{waba-id}/message_templates`. Rejects with a
 * {@link TemplateValidationError} (without calling the API) when the template
 * has validation errors, or a {@link GraphApiError} on a non-2xx response.
 */
export async function submitTemplate(
  template: WhatsAppTemplate,
  options: CloudApiOptions,
): Promise<SubmitTemplateResponse> {
  const result = validateTemplate(template);
  if (!result.valid) throw new TemplateValidationError(result.errors);

  const response = await resolveFetch(options)(templatesUrl(options), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: template.name,
      language: template.language,
      category: template.category,
      components: template.components,
    }),
  });
  return parse<SubmitTemplateResponse>(response);
}

/**
 * List the account's message templates via
 * `GET /{waba-id}/message_templates`.
 */
export async function listTemplates(
  options: CloudApiOptions,
  params: ListTemplatesParams = {},
): Promise<ListTemplatesResponse> {
  const url = new URL(templatesUrl(options));
  if (params.fields?.length) url.searchParams.set('fields', params.fields.join(','));
  if (params.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params.after) url.searchParams.set('after', params.after);
  if (params.before) url.searchParams.set('before', params.before);

  const response = await resolveFetch(options)(url.toString(), {
    headers: { Authorization: `Bearer ${options.token}` },
  });
  return parse<ListTemplatesResponse>(response);
}
