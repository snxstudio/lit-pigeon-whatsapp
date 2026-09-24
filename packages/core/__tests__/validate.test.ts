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

describe('authentication', () => {
  /** A well-formed AUTHENTICATION / OTP template used as a baseline. */
  function authTemplate(): WhatsAppTemplate {
    return {
      name: 'verification_code',
      language: 'en_US',
      category: 'AUTHENTICATION',
      components: [
        {
          type: 'BODY',
          text: 'Your verification code is {{1}}.',
          example: { body_text: [['123456']] },
          add_security_recommendation: true,
        },
        { type: 'FOOTER', text: '', code_expiration_minutes: 10 },
        {
          type: 'BUTTONS',
          buttons: [{ type: 'OTP', otp_type: 'COPY_CODE', text: 'Copy code' }],
        },
      ],
    };
  }

  it('accepts a well-formed OTP template', () => {
    const res = validateTemplate(authTemplate());
    expect(res.valid, res.errors.map((e) => e.rule).join(', ')).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('accepts a bare FOOTER when it only carries an expiry', () => {
    const t = authTemplate();
    // A footer with no text but a code_expiration_minutes must not be "empty".
    expect(rules(t)).not.toContain('footer-empty');
  });

  it('rejects a HEADER on an AUTHENTICATION template', () => {
    const t = authTemplate();
    t.components.unshift({ type: 'HEADER', format: 'TEXT', text: 'Verify' });
    expect(rules(t)).toContain('auth-no-header');
  });

  it('rejects code_expiration_minutes outside 1–90', () => {
    const t = authTemplate();
    t.components[1] = { type: 'FOOTER', text: '', code_expiration_minutes: 120 };
    expect(rules(t)).toContain('code-expiration-range');
  });

  it('rejects a non-integer code_expiration_minutes', () => {
    const t = authTemplate();
    t.components[1] = { type: 'FOOTER', text: '', code_expiration_minutes: 10.5 };
    expect(rules(t)).toContain('code-expiration-range');
  });

  it('rejects an unknown otp_type', () => {
    const t = authTemplate();
    // @ts-expect-error testing an invalid runtime value
    t.components[2] = { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'SMS' }] };
    expect(rules(t)).toContain('otp-type-invalid');
  });

  it('rejects more than one OTP button', () => {
    const t = authTemplate();
    t.components[2] = {
      type: 'BUTTONS',
      buttons: [
        { type: 'OTP', otp_type: 'COPY_CODE' },
        { type: 'OTP', otp_type: 'COPY_CODE' },
      ],
    };
    expect(rules(t)).toContain('otp-single');
  });

  it('rejects an OTP button on a non-AUTHENTICATION template', () => {
    const t = validTemplate();
    t.components[3] = { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'COPY_CODE' }] };
    expect(rules(t)).toContain('otp-button-category');
  });

  it('warns when a one-tap OTP button has no supported apps', () => {
    const t = authTemplate();
    t.components[2] = { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'ONE_TAP' }] };
    const res = validateTemplate(t);
    expect(res.valid).toBe(true);
    expect(res.warnings.map((w) => w.rule)).toContain('otp-supported-apps');
  });

  it('warns when auth-only fields appear on a non-AUTHENTICATION template', () => {
    const t = validTemplate();
    const body = t.components.find((c) => c.type === 'BODY');
    if (body?.type === 'BODY') body.add_security_recommendation = true;
    t.components[2] = { type: 'FOOTER', text: 'Reply STOP', code_expiration_minutes: 10 };
    const warnings = validateTemplate(t).warnings.map((w) => w.rule);
    expect(warnings).toContain('security-recommendation-category');
    expect(warnings).toContain('code-expiration-category');
  });
});

describe('variable helpers', () => {
  it('extracts and dedupes variables', () => {
    expect(extractVariables('a {{1}} b {{2}} c {{1}}')).toEqual([1, 2, 1]);
    expect(distinctVariables('a {{2}} b {{1}}')).toEqual([1, 2]);
  });
});
