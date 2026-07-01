import { describe, it, expect } from 'vitest';
import {
  validateTemplate,
  createEmptyTemplate,
  extractVariables,
  distinctVariables,
  type WhatsAppTemplate,
} from '../src/index.js';

/** A fully valid, submittable template used as a baseline. */
function validTemplate(): WhatsAppTemplate {
  return {
    name: 'order_confirmation',
    language: 'en_US',
    category: 'UTILITY',
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Order update' },
      {
        type: 'BODY',
        text: 'Hi {{1}}, your order {{2}} has shipped.',
        example: { body_text: [['Alex', '#1024']] },
      },
      { type: 'FOOTER', text: 'Reply STOP to opt out' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'Track order', url: 'https://x.co/{{1}}', example: ['1024'] },
          { type: 'QUICK_REPLY', text: 'Contact support' },
        ],
      },
    ],
  };
}

const rules = (t: WhatsAppTemplate) => validateTemplate(t).errors.map((e) => e.rule);

describe('validateTemplate — happy path', () => {
  it('accepts a well-formed template', () => {
    const res = validateTemplate(validTemplate());
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
});

describe('name', () => {
  it('requires a name', () => {
    const t = validTemplate();
    t.name = '';
    expect(rules(t)).toContain('name-required');
  });

  it('rejects uppercase / spaces / dashes', () => {
    const t = validTemplate();
    t.name = 'Order Confirmation';
    expect(rules(t)).toContain('name-format');
  });
});

describe('category', () => {
  it('rejects an unknown category', () => {
    const t = validTemplate();
    // @ts-expect-error testing an invalid runtime value
    t.category = 'PROMO';
    expect(rules(t)).toContain('category-invalid');
  });
});

describe('body', () => {
  it('requires a BODY component', () => {
    const t = validTemplate();
    t.components = t.components.filter((c) => c.type !== 'BODY');
    expect(rules(t)).toContain('body-required');
  });

  it('flags a body over 1024 chars', () => {
    const t = createEmptyTemplate({ name: 'x', components: [{ type: 'BODY', text: 'a'.repeat(1025) }] });
    expect(rules(t)).toContain('body-length');
  });

  it('flags non-sequential variables', () => {
    const t = createEmptyTemplate({
      name: 'x',
      components: [{ type: 'BODY', text: 'Hello {{1}} and {{3}}', example: { body_text: [['a', 'b']] } }],
    });
    expect(rules(t)).toContain('body-vars-sequential');
  });

  it('rejects a body that starts or ends with a variable', () => {
    const start = createEmptyTemplate({ name: 'x', components: [{ type: 'BODY', text: '{{1}} welcome', example: { body_text: [['a']] } }] });
    const end = createEmptyTemplate({ name: 'x', components: [{ type: 'BODY', text: 'welcome {{1}}', example: { body_text: [['a']] } }] });
    expect(rules(start)).toContain('body-vars-edge');
    expect(rules(end)).toContain('body-vars-edge');
  });

  it('flags adjacent variables', () => {
    const t = createEmptyTemplate({ name: 'x', components: [{ type: 'BODY', text: 'a {{1}} {{2}} b', example: { body_text: [['a', 'b']] } }] });
    expect(rules(t)).toContain('body-vars-adjacent');
  });

  it('warns when variable samples are missing', () => {
    const t = createEmptyTemplate({ name: 'x', components: [{ type: 'BODY', text: 'Hi {{1}}, thanks.' }] });
    const res = validateTemplate(t);
    expect(res.warnings.map((w) => w.rule)).toContain('body-samples');
  });
});

describe('header', () => {
  it('limits a text header to one variable', () => {
    const t = validTemplate();
    t.components[0] = { type: 'HEADER', format: 'TEXT', text: '{{1}} and {{2}}', example: { header_text: ['a'] } };
    expect(rules(t)).toContain('header-vars');
  });

  it('flags a header text over 60 chars', () => {
    const t = validTemplate();
    t.components[0] = { type: 'HEADER', format: 'TEXT', text: 'x'.repeat(61) };
    expect(rules(t)).toContain('header-length');
  });
});

describe('footer', () => {
  it('rejects variables in the footer', () => {
    const t = validTemplate();
    t.components[2] = { type: 'FOOTER', text: 'Bye {{1}}' };
    expect(rules(t)).toContain('footer-vars');
  });
});

describe('buttons', () => {
  it('rejects more than one phone-number button', () => {
    const t = validTemplate();
    t.components[3] = {
      type: 'BUTTONS',
      buttons: [
        { type: 'PHONE_NUMBER', text: 'Call', phone_number: '+10000000000' },
        { type: 'PHONE_NUMBER', text: 'Call 2', phone_number: '+10000000001' },
      ],
    };
    expect(rules(t)).toContain('buttons-phone-max');
  });

  it('flags button text over 25 chars', () => {
    const t = validTemplate();
    t.components[3] = { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'x'.repeat(26) }] };
    expect(rules(t)).toContain('button-text-length');
  });

  it('requires a URL on a URL button', () => {
    const t = validTemplate();
    t.components[3] = { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Open', url: '' }] };
    expect(rules(t)).toContain('button-url-required');
  });
});

describe('variable helpers', () => {
  it('extracts and dedupes variables', () => {
    expect(extractVariables('a {{1}} b {{2}} c {{1}}')).toEqual([1, 2, 1]);
    expect(distinctVariables('a {{2}} b {{1}}')).toEqual([1, 2]);
  });
});
