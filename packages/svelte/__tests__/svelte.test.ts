import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { WhatsAppEditor } from '../src/lib/index';

const template: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
};

describe('<WhatsAppEditor /> (Svelte)', () => {
  it('renders the underlying custom element and forwards the template', () => {
    const { container } = render(WhatsAppEditor, { props: { template } });
    const el = container.querySelector('pigeon-whatsapp-editor');
    expect(el).not.toBeNull();
    expect((el as unknown as { template: WhatsAppTemplate }).template).toEqual(template);
  });
});
