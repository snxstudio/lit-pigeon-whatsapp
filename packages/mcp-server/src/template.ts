import {
  createEmptyTemplate,
  validateTemplate,
  type WhatsAppTemplate,
  type TemplateCategory,
  type Component,
  type HeaderComponent,
  type BodyComponent,
  type FooterComponent,
  type ButtonsComponent,
  type ValidationIssue,
} from '@lit-pigeon/whatsapp-core';

/** Replace `{{1}}`, `{{2}}`… with `samples[n-1]`, leaving unmatched placeholders. */
export function substitute(text: string, samples?: readonly string[]): string {
  return text.replace(/\{\{\s*(\d+)\s*\}\}/g, (m, digits: string) => samples?.[Number(digits) - 1] ?? m);
}

export interface CreateTemplateInput {
  name: string;
  category: TemplateCategory;
  language?: string;
  body_text: string;
  body_samples?: string[];
  header_text?: string;
  header_sample?: string;
  footer_text?: string;
}

/** Build a {@link WhatsAppTemplate} from the flat fields of `create_template`. */
export function createTemplate(input: CreateTemplateInput): WhatsAppTemplate {
  const components: Component[] = [];

  if (input.header_text) {
    const header: HeaderComponent = { type: 'HEADER', format: 'TEXT', text: input.header_text };
    if (input.header_sample) header.example = { header_text: [input.header_sample] };
    components.push(header);
  }

  const body: BodyComponent = { type: 'BODY', text: input.body_text };
  if (input.body_samples?.length) body.example = { body_text: [input.body_samples] };
  components.push(body);

  if (input.footer_text) components.push({ type: 'FOOTER', text: input.footer_text });

  return createEmptyTemplate({
    name: input.name,
    language: input.language ?? 'en_US',
    category: input.category,
    components,
  });
}

/** A plain-text rendering of the template, variables substituted from samples. */
export function renderPreviewText(template: WhatsAppTemplate): string {
  const find = <T extends Component>(type: Component['type']): T | undefined =>
    template.components.find((c) => c.type === type) as T | undefined;

  const parts: string[] = [];
  const header = find<HeaderComponent>('HEADER');
  if (header) {
    parts.push(
      header.format === 'TEXT'
        ? substitute(header.text ?? '', header.example?.header_text)
        : `[${header.format}]`,
    );
  }
  const body = find<BodyComponent>('BODY');
  if (body) parts.push(substitute(body.text, body.example?.body_text?.[0]));
  const footer = find<FooterComponent>('FOOTER');
  if (footer) parts.push(footer.text);
  const buttons = find<ButtonsComponent>('BUTTONS');
  if (buttons && buttons.buttons.length > 0) {
    parts.push(
      buttons.buttons
        .map((b) => `[ ${b.type === 'COPY_CODE' ? 'Copy code' : b.text} ]`)
        .join('  '),
    );
  }
  return parts.join('\n\n');
}

export type CloudApiPayloadResult =
  | { ok: true; payload: WhatsAppTemplate }
  | { ok: false; errors: ValidationIssue[] };

/**
 * Validate the template, then return the `POST /{waba-id}/message_templates`
 * request body. Refuses (`ok: false`) when there are validation errors.
 */
export function buildCloudApiPayload(template: WhatsAppTemplate): CloudApiPayloadResult {
  const result = validateTemplate(template);
  if (!result.valid) return { ok: false, errors: result.errors };
  return {
    ok: true,
    payload: {
      name: template.name,
      language: template.language,
      category: template.category,
      components: template.components,
    },
  };
}
