import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { WhatsAppEditor } from '../src/index';

const template: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
};

describe('<WhatsAppEditor /> (Vue)', () => {
  it('renders the underlying custom element and forwards the template', () => {
    const wrapper = mount(WhatsAppEditor, { props: { template }, attachTo: document.body });
    const el = wrapper.find('pigeon-whatsapp-editor');
    expect(el.exists()).toBe(true);
    expect((el.element as unknown as { template: WhatsAppTemplate }).template).toEqual(template);
    wrapper.unmount();
  });
});
