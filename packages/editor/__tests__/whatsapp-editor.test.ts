import { describe, it, expect } from 'vitest';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { PigeonWhatsAppEditor } from '../src/whatsapp-editor';

const valid: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [
    { type: 'BODY', text: 'Your order {{1}} ships today.', example: { body_text: [['#123']] } },
    { type: 'FOOTER', text: 'Thanks!' },
  ],
};

async function mount(template?: WhatsAppTemplate): Promise<PigeonWhatsAppEditor> {
  const el = document.createElement('pigeon-whatsapp-editor') as PigeonWhatsAppEditor;
  if (template) el.template = template;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('<pigeon-whatsapp-editor>', () => {
  it('registers the custom element', () => {
    expect(customElements.get('pigeon-whatsapp-editor')).toBe(PigeonWhatsAppEditor);
  });

  it('renders the set template in the preview', async () => {
    const el = await mount(valid);
    const preview = el.shadowRoot!.querySelector('pigeon-whatsapp-preview')!;
    await (preview as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    const text = preview.shadowRoot!.textContent ?? '';
    expect(text).toContain('#123'); // body variable substituted in the preview
    expect(text).toContain('ships today');
  });

  it('shows validation errors for an invalid template', async () => {
    const el = await mount({ ...valid, name: 'Bad Name' }); // spaces + caps are invalid
    const errors = el.shadowRoot!.querySelectorAll('.error');
    expect(errors.length).toBeGreaterThan(0);
    expect(el.shadowRoot!.textContent).toContain('name-format');
  });

  it('reports valid templates in the validation panel', async () => {
    const el = await mount(valid);
    expect(el.shadowRoot!.querySelector('.error')).toBeNull();
    expect(el.shadowRoot!.querySelector('.ok')).not.toBeNull();
  });

  it('dispatches pigeon:change with the new template on edit', async () => {
    const el = await mount(valid);
    let changed: WhatsAppTemplate | undefined;
    el.addEventListener('pigeon:change', (e) => {
      changed = (e as CustomEvent<{ template: WhatsAppTemplate }>).detail.template;
    });
    const nameInput = el.shadowRoot!.querySelector<HTMLInputElement>('#field-name')!;
    nameInput.value = 'welcome_msg';
    nameInput.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(changed?.name).toBe('welcome_msg');
    expect(el.getPayload().name).toBe('welcome_msg'); // immutable update reflected
  });
});
