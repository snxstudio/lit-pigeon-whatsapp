import { describe, it, expect, beforeAll } from 'vitest';
import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { WhatsAppEditor } from '../src/index';

beforeAll(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

const template: WhatsAppTemplate = {
  name: 'order_update',
  language: 'en_US',
  category: 'UTILITY',
  components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
};

describe('<WhatsAppEditor /> (React)', () => {
  it('renders the underlying custom element', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(WhatsAppEditor, { template }));
    });
    expect(container.querySelector('pigeon-whatsapp-editor')).not.toBeNull();
    act(() => root.unmount());
  });
});
