import type { WhatsAppTemplate } from './types.js';

/** A ready-to-edit example template with a friendly label. */
export interface StarterTemplate {
  /** Stable identifier for the starter. */
  id: string;
  title: string;
  description: string;
  template: WhatsAppTemplate;
}

/**
 * A small set of valid, ready-to-edit example templates for editors to offer
 * as starting points. Every returned `template` passes {@link validateTemplate}.
 *
 * A fresh, independently-mutable set is returned on each call.
 */
export function getStarterTemplates(): StarterTemplate[] {
  return [
    {
      id: 'welcome',
      title: 'Welcome message',
      description: 'A friendly marketing greeting for new contacts.',
      template: {
        name: 'welcome_message',
        language: 'en_US',
        category: 'MARKETING',
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Welcome aboard!' },
          {
            type: 'BODY',
            text: "Hi {{1}}, thanks for joining {{2}}! Reply to this message any time you need a hand.",
            example: { body_text: [['Sam', 'Acme']] },
          },
          { type: 'FOOTER', text: 'Reply STOP to unsubscribe' },
        ],
      },
    },
    {
      id: 'order_update',
      title: 'Order update',
      description: 'A utility notification about an order status change.',
      template: {
        name: 'order_update',
        language: 'en_US',
        category: 'UTILITY',
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Order update' },
          {
            type: 'BODY',
            text: 'Hi {{1}}, your order {{2}} is now {{3}}. Thanks for shopping with us!',
            example: { body_text: [['Sam', '#A1234', 'out for delivery']] },
          },
          { type: 'FOOTER', text: 'Reply STOP to unsubscribe' },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'Track order',
                url: 'https://example.com/orders/{{1}}',
                example: ['A1234'],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'otp',
      title: 'One-time passcode',
      description: 'An authentication template that delivers a verification code.',
      template: {
        name: 'verification_code',
        language: 'en_US',
        category: 'AUTHENTICATION',
        components: [
          {
            type: 'BODY',
            text: 'Your verification code is {{1}}. It expires in 10 minutes. Do not share it with anyone.',
            example: { body_text: [['123456']] },
          },
          {
            type: 'BUTTONS',
            buttons: [{ type: 'COPY_CODE', example: '123456' }],
          },
        ],
      },
    },
  ];
}
