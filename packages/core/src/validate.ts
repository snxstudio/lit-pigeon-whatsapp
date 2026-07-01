import type {
  WhatsAppTemplate,
  Component,
  ComponentType,
  HeaderComponent,
  BodyComponent,
  FooterComponent,
  ButtonsComponent,
} from './types.js';
import { LIMITS, NAME_RE, CATEGORIES } from './constants.js';
import {
  extractVariables,
  distinctVariables,
  startsWithVariable,
  endsWithVariable,
  hasAdjacentVariables,
} from './variables.js';

export type Severity = 'error' | 'warning';

export interface ValidationIssue {
  severity: Severity;
  /** Stable machine-readable rule id, e.g. `body-length`. */
  rule: string;
  message: string;
  /** The component the issue relates to, when applicable. */
  component?: ComponentType;
}

export interface ValidationResult {
  /** True when there are no `error`-severity issues. */
  valid: boolean;
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

type Add = (rule: string, message: string, component?: ComponentType) => void;

/**
 * Validate a WhatsApp template against Meta's message-template rules.
 * Errors block submission; warnings are things Meta wants (e.g. samples) that
 * commonly cause a rejection or a lower-quality review.
 */
export function validateTemplate(template: WhatsAppTemplate): ValidationResult {
  const issues: ValidationIssue[] = [];
  const err: Add = (rule, message, component) =>
    issues.push({ severity: 'error', rule, message, component });
  const warn: Add = (rule, message, component) =>
    issues.push({ severity: 'warning', rule, message, component });

  validateName(template.name, err);
  if (!template.language || !template.language.trim()) {
    err('language-required', 'A language code is required (e.g. "en_US").');
  }
  if (!CATEGORIES.includes(template.category)) {
    err('category-invalid', `Category must be one of ${CATEGORIES.join(', ')}.`);
  }

  const components = template.components ?? [];
  const of = <T extends Component>(type: ComponentType) =>
    components.filter((c) => c.type === type) as T[];

  const headers = of<HeaderComponent>('HEADER');
  const bodies = of<BodyComponent>('BODY');
  const footers = of<FooterComponent>('FOOTER');
  const buttonBlocks = of<ButtonsComponent>('BUTTONS');

  if (bodies.length === 0) {
    err('body-required', 'A BODY component is required.', 'BODY');
  }
  if (bodies.length > 1) err('body-single', 'Only one BODY component is allowed.', 'BODY');
  if (headers.length > 1) err('header-single', 'Only one HEADER component is allowed.', 'HEADER');
  if (footers.length > 1) err('footer-single', 'Only one FOOTER component is allowed.', 'FOOTER');
  if (buttonBlocks.length > 1) {
    err('buttons-single', 'Only one BUTTONS component is allowed.', 'BUTTONS');
  }

  if (headers[0]) validateHeader(headers[0], err, warn);
  if (bodies[0]) validateBody(bodies[0], err, warn);
  if (footers[0]) validateFooter(footers[0], err);
  if (buttonBlocks[0]) validateButtons(buttonBlocks[0], err, warn);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return { valid: errors.length === 0, issues, errors, warnings };
}

function validateName(name: string, err: Add): void {
  if (!name || !name.trim()) {
    err('name-required', 'Template name is required.');
    return;
  }
  if (name.length > LIMITS.NAME_MAX) {
    err('name-length', `Name must be ≤ ${LIMITS.NAME_MAX} characters.`);
  }
  if (!NAME_RE.test(name)) {
    err(
      'name-format',
      'Name may contain only lowercase letters, numbers and underscores.',
    );
  }
}

function validateHeader(header: HeaderComponent, err: Add, warn: Add): void {
  if (header.format === 'TEXT') {
    const text = header.text ?? '';
    if (!text.trim()) {
      err('header-text-empty', 'A TEXT header needs text.', 'HEADER');
      return;
    }
    if (text.length > LIMITS.HEADER_TEXT_MAX) {
      err(
        'header-length',
        `Header text must be ≤ ${LIMITS.HEADER_TEXT_MAX} characters (currently ${text.length}).`,
        'HEADER',
      );
    }
    const vars = extractVariables(text);
    if (vars.length > 1) {
      err('header-vars', 'A TEXT header may contain at most one variable ({{1}}).', 'HEADER');
    } else if (vars.length === 1) {
      if (vars[0] !== 1) {
        err('header-vars-index', 'The header variable must be {{1}}.', 'HEADER');
      }
      if (!header.example?.header_text?.length) {
        warn('header-sample', 'Provide a sample value for the header variable.', 'HEADER');
      }
    }
    return;
  }
  // Media header (IMAGE / VIDEO / DOCUMENT / LOCATION)
  if (header.text) {
    warn('header-media-text', `A ${header.format} header should not include text.`, 'HEADER');
  }
  if (!header.example?.header_handle?.length) {
    warn(
      'header-media-sample',
      `Provide a sample media handle for the ${header.format} header (required for review).`,
      'HEADER',
    );
  }
}

function validateBody(body: BodyComponent, err: Add, warn: Add): void {
  const text = body.text ?? '';
  if (!text.trim()) {
    err('body-empty', 'BODY text cannot be empty.', 'BODY');
    return;
  }
  if (text.length > LIMITS.BODY_MAX) {
    err(
      'body-length',
      `BODY text must be ≤ ${LIMITS.BODY_MAX} characters (currently ${text.length}).`,
      'BODY',
    );
  }

  const vars = extractVariables(text);
  if (vars.length === 0) return;

  const distinct = distinctVariables(text);
  const isSequential = distinct[0] === 1 && distinct.every((v, i) => v === i + 1);
  if (!isSequential) {
    err(
      'body-vars-sequential',
      `Variables must be numbered sequentially from {{1}} with no gaps. Found: ${distinct
        .map((v) => `{{${v}}}`)
        .join(', ')}.`,
      'BODY',
    );
  }
  if (startsWithVariable(text)) {
    err('body-vars-edge', 'BODY cannot start with a variable — WhatsApp rejects this.', 'BODY');
  }
  if (endsWithVariable(text)) {
    err('body-vars-edge', 'BODY cannot end with a variable — WhatsApp rejects this.', 'BODY');
  }
  if (hasAdjacentVariables(text)) {
    err('body-vars-adjacent', 'Add text between variables — adjacent variables are not allowed.', 'BODY');
  }

  const samples = body.example?.body_text?.[0];
  if (!samples || samples.length < distinct.length) {
    warn(
      'body-samples',
      `Provide ${distinct.length} sample value(s) for the body variables so WhatsApp can review the template.`,
      'BODY',
    );
  }
}

function validateFooter(footer: FooterComponent, err: Add): void {
  const text = footer.text ?? '';
  if (!text.trim()) {
    err('footer-empty', 'FOOTER text cannot be empty.', 'FOOTER');
    return;
  }
  if (text.length > LIMITS.FOOTER_MAX) {
    err('footer-length', `Footer must be ≤ ${LIMITS.FOOTER_MAX} characters.`, 'FOOTER');
  }
  if (extractVariables(text).length > 0) {
    err('footer-vars', 'FOOTER cannot contain variables.', 'FOOTER');
  }
}

function validateButtons(block: ButtonsComponent, err: Add, warn: Add): void {
  const buttons = block.buttons ?? [];
  if (buttons.length === 0) {
    warn('buttons-empty', 'BUTTONS component has no buttons.', 'BUTTONS');
    return;
  }
  if (buttons.length > LIMITS.BUTTONS_MAX) {
    err('buttons-max', `A template may have at most ${LIMITS.BUTTONS_MAX} buttons.`, 'BUTTONS');
  }
  const urls = buttons.filter((b) => b.type === 'URL').length;
  const phones = buttons.filter((b) => b.type === 'PHONE_NUMBER').length;
  if (urls > LIMITS.URL_BUTTONS_MAX) {
    err('buttons-url-max', `At most ${LIMITS.URL_BUTTONS_MAX} URL buttons are allowed.`, 'BUTTONS');
  }
  if (phones > LIMITS.PHONE_BUTTONS_MAX) {
    err(
      'buttons-phone-max',
      `At most ${LIMITS.PHONE_BUTTONS_MAX} phone-number button is allowed.`,
      'BUTTONS',
    );
  }

  buttons.forEach((b, i) => {
    const label = `Button ${i + 1}`;
    if (b.type !== 'COPY_CODE') {
      if (!b.text || !b.text.trim()) {
        err('button-text-required', `${label}: button text is required.`, 'BUTTONS');
      } else if (b.text.length > LIMITS.BUTTON_TEXT_MAX) {
        err(
          'button-text-length',
          `${label}: text must be ≤ ${LIMITS.BUTTON_TEXT_MAX} characters.`,
          'BUTTONS',
        );
      }
    }
    if (b.type === 'URL' && !b.url?.trim()) {
      err('button-url-required', `${label}: a URL is required.`, 'BUTTONS');
    }
    if (b.type === 'PHONE_NUMBER' && !b.phone_number?.trim()) {
      err('button-phone-required', `${label}: a phone number is required.`, 'BUTTONS');
    }
    if (b.type === 'COPY_CODE' && !b.example?.trim()) {
      err('button-copy-required', `${label}: a sample coupon code is required.`, 'BUTTONS');
    }
  });
}
