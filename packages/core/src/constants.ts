import type { TemplateCategory, OtpType } from './types.js';

/**
 * Length / count limits Meta enforces on message templates.
 * Sourced from the WhatsApp Cloud API message-template docs.
 */
export const LIMITS = {
  NAME_MAX: 512,
  BODY_MAX: 1024,
  HEADER_TEXT_MAX: 60,
  FOOTER_MAX: 60,
  BUTTON_TEXT_MAX: 25,
  BUTTONS_MAX: 10,
  URL_BUTTONS_MAX: 2,
  PHONE_BUTTONS_MAX: 1,
  CODE_EXPIRATION_MIN: 1,
  CODE_EXPIRATION_MAX: 90,
} as const;

/** OTP delivery types for AUTHENTICATION templates. */
export const OTP_TYPES: readonly OtpType[] = ['COPY_CODE', 'ONE_TAP', 'ZERO_TAP'];

/** A valid template name: lowercase letters, digits, underscores. */
export const NAME_RE = /^[a-z0-9_]+$/;

export const CATEGORIES: readonly TemplateCategory[] = [
  'MARKETING',
  'UTILITY',
  'AUTHENTICATION',
];
