import { PigeonWhatsAppEditor } from '@lit-pigeon/whatsapp-editor';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';

const sample: WhatsAppTemplate = {
  name: 'order_confirmation',
  language: 'en_US',
  category: 'UTILITY',
  components: [
    {
      type: 'HEADER',
      format: 'TEXT',
      text: 'Order {{1}} confirmed',
      example: { header_text: ['#A1234'] },
    },
    {
      type: 'BODY',
      text: 'Hi {{1}}, your order *{{2}}* is on its way and should arrive {{3}}.\nThanks for shopping with us!',
      example: { body_text: [['Sam', '#A1234', 'Friday']] },
    },
    { type: 'FOOTER', text: 'Reply STOP to unsubscribe' },
    {
      type: 'BUTTONS',
      buttons: [
        { type: 'URL', text: 'Track order', url: 'https://example.com/track/{{1}}', example: ['A1234'] },
        { type: 'QUICK_REPLY', text: 'Contact support' },
      ],
    },
  ],
};

const editor = new PigeonWhatsAppEditor();
editor.template = sample;
editor.addEventListener('pigeon:change', (e) => {
  // eslint-disable-next-line no-console
  console.log('pigeon:change', (e as CustomEvent<{ template: WhatsAppTemplate }>).detail.template);
});

document.querySelector('#app')!.append(editor);
