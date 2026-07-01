/**
 * WhatsApp Business message-template model.
 *
 * Mirrors the shape Meta's Cloud API expects at
 * `POST /{waba-id}/message_templates`, so a validated {@link WhatsAppTemplate}
 * is (close to) the payload you submit for approval.
 */

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export type HeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

/** Optional header. Text headers may contain at most one variable. */
export interface HeaderComponent {
  type: 'HEADER';
  format: HeaderFormat;
  /** Present when `format` is `TEXT`. */
  text?: string;
  example?: {
    /** Sample value(s) for a text header's `{{1}}`. */
    header_text?: string[];
    /** Sample media handle(s) for a media header. */
    header_handle?: string[];
  };
}

/** The required message body. Supports positional variables `{{1}}`, `{{2}}`… */
export interface BodyComponent {
  type: 'BODY';
  text: string;
  example?: {
    /** One row of sample values, one entry per variable. */
    body_text?: string[][];
  };
}

/** Optional footer. Plain text only — no variables, no formatting. */
export interface FooterComponent {
  type: 'FOOTER';
  text: string;
}

export type Button =
  | { type: 'QUICK_REPLY'; text: string }
  | { type: 'URL'; text: string; url: string; example?: string[] }
  | { type: 'PHONE_NUMBER'; text: string; phone_number: string }
  | { type: 'COPY_CODE'; example: string };

export type ButtonType = Button['type'];

/** Optional buttons block (quick-reply and/or call-to-action buttons). */
export interface ButtonsComponent {
  type: 'BUTTONS';
  buttons: Button[];
}

export type Component =
  | HeaderComponent
  | BodyComponent
  | FooterComponent
  | ButtonsComponent;

export type ComponentType = Component['type'];

export interface WhatsAppTemplate {
  /** Lowercase letters, numbers and underscores only. */
  name: string;
  /** BCP-47-ish language/locale code, e.g. `en_US`. */
  language: string;
  category: TemplateCategory;
  components: Component[];
}
