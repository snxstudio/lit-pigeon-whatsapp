import * as React from 'react';
import { createComponent } from '@lit/react';
import { PigeonWhatsAppEditor } from '@lit-pigeon/whatsapp-editor';

/**
 * React wrapper for `<pigeon-whatsapp-editor>`.
 *
 * Props map to the element's properties (`template`), and the `pigeon:change`
 * DOM CustomEvent is surfaced as the `onChange` prop.
 *
 * @example
 * ```tsx
 * <WhatsAppEditor template={template} onChange={(e) => console.log(e.detail.template)} />
 * ```
 */
export const WhatsAppEditor = createComponent({
  tagName: 'pigeon-whatsapp-editor',
  elementClass: PigeonWhatsAppEditor,
  react: React,
  events: {
    onChange: 'pigeon:change',
  },
});

export default WhatsAppEditor;
