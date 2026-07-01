import type { WhatsAppTemplate } from './types.js';

/** A minimal, valid-shaped starting template for editors to build on. */
export function createEmptyTemplate(
  partial: Partial<WhatsAppTemplate> = {},
): WhatsAppTemplate {
  return {
    name: '',
    language: 'en_US',
    category: 'UTILITY',
    components: [{ type: 'BODY', text: '' }],
    ...partial,
  };
}
