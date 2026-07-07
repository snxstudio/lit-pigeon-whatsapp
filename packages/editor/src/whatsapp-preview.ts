import { LitElement, html, css, svg, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  createEmptyTemplate,
  type WhatsAppTemplate,
  type HeaderComponent,
  type BodyComponent,
  type FooterComponent,
  type ButtonsComponent,
  type Button,
  type ButtonType,
  type HeaderFormat,
} from '@lit-pigeon/whatsapp-core';
import { renderWhatsAppText, substituteVariables } from './format.js';

/** Small inline glyphs, keyed by button / media type. */
const ICONS: Record<ButtonType | HeaderFormat, TemplateResult> = {
  QUICK_REPLY: svg`<path d="M10 9V5l-7 7 7 7v-4c5 0 8 1.5 10 5 .5-6-2.5-11-10-11z"/>`,
  URL: svg`<path d="M14 3v2h3.6l-9.3 9.3 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5V3H3v18h18v-7h-2v5H5V5z"/>`,
  PHONE_NUMBER: svg`<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10 21 3 14 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/>`,
  COPY_CODE: svg`<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>`,
  TEXT: svg`<path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z"/>`,
  IMAGE: svg`<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/>`,
  VIDEO: svg`<path d="M4 4h12c1.1 0 2 .9 2 2v3.5l4-4v13l-4-4V18c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>`,
  DOCUMENT: svg`<path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z"/>`,
  LOCATION: svg`<path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>`,
};

function icon(kind: ButtonType | HeaderFormat): TemplateResult {
  return svg`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[kind]}</svg>`;
}

/** Business-account verified check shown next to the peer name. */
const VERIFIED: TemplateResult = html`<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9.6 16.6l-4.2-4.2 1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4z" />
</svg>`;

function buttonLabel(button: Button): string {
  return button.type === 'COPY_CODE' ? 'Copy code' : button.text;
}

/**
 * `<pigeon-whatsapp-preview>` — renders a {@link WhatsAppTemplate} as a
 * WhatsApp-style chat bubble (header, formatted body, footer, buttons).
 *
 * @example
 * ```html
 * <pigeon-whatsapp-preview .template=${template}></pigeon-whatsapp-preview>
 * ```
 */
@customElement('pigeon-whatsapp-preview')
export class PigeonWhatsAppPreview extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
        sans-serif;
      --wa-teal: #008069;
      --wa-bubble: #ffffff;
      --wa-text: #111b21;
      --wa-muted: #667781;
      --wa-link: #027eb5;
      --wa-divider: #e9edef;
    }
    /* Phone-style conversation window. */
    .window {
      max-width: 340px;
      margin: 0 auto;
      border-radius: 14px;
      overflow: hidden;
      background: #efeae2;
      box-shadow:
        0 1px 2px rgba(11, 20, 26, 0.08),
        0 12px 28px -12px rgba(11, 20, 26, 0.35);
      border: 1px solid rgba(11, 20, 26, 0.06);
    }
    .topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--wa-teal);
      color: #fff;
    }
    .topbar .back {
      font-size: 18px;
      line-height: 1;
      opacity: 0.9;
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      flex: 0 0 auto;
    }
    .peer {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.25;
    }
    .peer .name {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .peer .name svg {
      width: 13px;
      height: 13px;
      fill: #fff;
      opacity: 0.9;
      flex: 0 0 auto;
    }
    .peer .status {
      font-size: 11.5px;
      opacity: 0.85;
    }
    .chat {
      /* Faint WhatsApp-style wallpaper doodle over the classic beige. */
      background-color: #efeae2;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><g fill="none" stroke="%23d9d0c4" stroke-width="1.4" stroke-linecap="round" opacity="0.55"><circle cx="20" cy="20" r="5"/><path d="M52 14l8 8M60 14l-8 8"/><path d="M14 54h12M14 60h8"/><circle cx="60" cy="58" r="6"/></g></svg>');
      padding: 18px 14px 16px;
      min-height: 120px;
    }
    .bubble {
      position: relative;
      max-width: 82%;
      background: var(--wa-bubble);
      border-radius: 8px;
      border-top-left-radius: 0;
      box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
      padding: 6px 8px 6px 10px;
      color: var(--wa-text);
      font-size: 14.2px;
      line-height: 19px;
    }
    .bubble::before {
      content: '';
      position: absolute;
      top: 0;
      left: -8px;
      width: 8px;
      height: 13px;
      background: var(--wa-bubble);
      clip-path: polygon(100% 0, 0 0, 100% 100%);
    }
    .header-text {
      font-weight: 600;
      margin-bottom: 4px;
      word-wrap: break-word;
    }
    .media {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 158px;
      margin: -2px -4px 6px;
      border-radius: 6px;
      background: linear-gradient(135deg, #cfd6da 0%, #b7c1c6 100%);
      color: #fff;
    }
    .media svg {
      width: 44px;
      height: 44px;
      fill: currentColor;
      opacity: 0.95;
    }
    .media .kind {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .body {
      white-space: normal;
      word-wrap: break-word;
    }
    .body code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
        monospace;
      font-size: 13px;
    }
    .footer {
      margin-top: 4px;
      font-size: 13px;
      color: var(--wa-muted);
      word-wrap: break-word;
    }
    .time {
      display: block;
      margin-top: 2px;
      text-align: right;
      font-size: 11px;
      color: var(--wa-muted);
    }
    .buttons {
      max-width: 82%;
      margin-top: 2px;
      background: var(--wa-bubble);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
    }
    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px;
      border-top: 1px solid var(--wa-divider);
      color: var(--wa-link);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .buttons .button:first-child {
      border-top: none;
    }
    .button svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
  `;

  /** The template to preview. Defaults to an empty template. */
  @property({ attribute: false })
  template: WhatsAppTemplate = createEmptyTemplate();

  private find<T extends { type: string }>(type: T['type']): T | undefined {
    return this.template.components.find((c) => c.type === type) as T | undefined;
  }

  private renderHeader(header: HeaderComponent | undefined) {
    if (!header) return nothing;
    if (header.format === 'TEXT') {
      const text = substituteVariables(header.text ?? '', header.example?.header_text);
      return html`<div class="header-text">${text}</div>`;
    }
    return html`<div class="media" title=${header.format}>
      ${icon(header.format)}<span class="kind">${header.format}</span>
    </div>`;
  }

  private renderBody(body: BodyComponent | undefined) {
    if (!body) return nothing;
    const samples = body.example?.body_text?.[0] ?? [];
    const rendered = renderWhatsAppText(substituteVariables(body.text, samples));
    return html`<div class="body">${unsafeHTML(rendered)}</div>`;
  }

  private renderFooter(footer: FooterComponent | undefined) {
    if (!footer) return nothing;
    return html`<div class="footer">${footer.text}</div>`;
  }

  private renderButtons(buttons: ButtonsComponent | undefined) {
    if (!buttons || buttons.buttons.length === 0) return nothing;
    return html`<div class="buttons">
      ${buttons.buttons.map(
        (b) => html`<div class="button">${icon(b.type)}<span>${buttonLabel(b)}</span></div>`,
      )}
    </div>`;
  }

  render() {
    return html`<div class="window">
      <div class="topbar">
        <span class="back" aria-hidden="true">‹</span>
        <span class="avatar" aria-hidden="true">🕊️</span>
        <span class="peer">
          <span class="name">Business ${VERIFIED}</span>
          <span class="status">business account</span>
        </span>
      </div>
      <div class="chat">
        <div class="bubble">
          ${this.renderHeader(this.find<HeaderComponent>('HEADER'))}
          ${this.renderBody(this.find<BodyComponent>('BODY'))}
          ${this.renderFooter(this.find<FooterComponent>('FOOTER'))}
          <span class="time">10:24</span>
        </div>
        ${this.renderButtons(this.find<ButtonsComponent>('BUTTONS'))}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pigeon-whatsapp-preview': PigeonWhatsAppPreview;
  }
}
