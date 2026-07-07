import { describe, it, expect } from 'vitest';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { PigeonWhatsAppPreview } from '../src/whatsapp-preview';

const template: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [
    { type: 'HEADER', format: 'TEXT', text: 'Hi {{1}}', example: { header_text: ['Sam'] } },
    {
      type: 'BODY',
      text: 'Your order *{{1}}* ships today.',
      example: { body_text: [['#123']] },
    },
    { type: 'FOOTER', text: 'Reply STOP to opt out' },
    {
      type: 'BUTTONS',
      buttons: [
        { type: 'URL', text: 'Track order', url: 'https://x.example/{{1}}', example: ['abc'] },
        { type: 'QUICK_REPLY', text: 'Thanks!' },
      ],
    },
  ],
};

async function mount(t: WhatsAppTemplate): Promise<PigeonWhatsAppPreview> {
  const el = document.createElement('pigeon-whatsapp-preview') as PigeonWhatsAppPreview;
  el.template = t;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('<pigeon-whatsapp-preview>', () => {
  it('registers the custom element', () => {
    expect(customElements.get('pigeon-whatsapp-preview')).toBe(PigeonWhatsAppPreview);
  });

  it('renders header, body, footer and buttons', async () => {
    const el = await mount(template);
    const root = el.shadowRoot!;
    const text = root.textContent ?? '';
    expect(text).toContain('Sam'); // header variable substituted
    expect(text).toContain('#123'); // body variable substituted
    expect(text).toContain('ships today');
    expect(text).toContain('Reply STOP to opt out'); // footer
    expect(text).toContain('Track order'); // button label
    expect(text).toContain('Thanks!');
  });

  it('applies WhatsApp formatting in the body', async () => {
    const el = await mount(template);
    const strong = el.shadowRoot!.querySelector('.body strong');
    expect(strong?.textContent).toBe('#123');
  });

  it('shows a media placeholder for non-text headers', async () => {
    const el = await mount({
      ...template,
      components: [
        { type: 'HEADER', format: 'IMAGE', example: { header_handle: ['h'] } },
        { type: 'BODY', text: 'hi' },
      ],
    });
    expect(el.shadowRoot!.querySelector('.media')).not.toBeNull();
  });
});
