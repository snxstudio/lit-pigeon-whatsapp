import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  createEmptyTemplate,
  validateTemplate,
  CATEGORIES,
  LIMITS,
  type WhatsAppTemplate,
  type Component,
  type ComponentType,
  type HeaderComponent,
  type BodyComponent,
  type FooterComponent,
  type ButtonsComponent,
  type Button,
  type ButtonType,
  type HeaderFormat,
  type TemplateCategory,
} from '@lit-pigeon/whatsapp-core';
import './whatsapp-preview.js';

const HEADER_FORMATS: HeaderFormat[] = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION'];
const BUTTON_TYPES: { value: ButtonType; label: string }[] = [
  { value: 'QUICK_REPLY', label: 'Quick reply' },
  { value: 'URL', label: 'URL' },
  { value: 'PHONE_NUMBER', label: 'Phone number' },
  { value: 'COPY_CODE', label: 'Copy code' },
];
const NEW_BUTTON: Record<ButtonType, Button> = {
  QUICK_REPLY: { type: 'QUICK_REPLY', text: '' },
  URL: { type: 'URL', text: '', url: '' },
  PHONE_NUMBER: { type: 'PHONE_NUMBER', text: '', phone_number: '' },
  COPY_CODE: { type: 'COPY_CODE', example: '' },
};
/** Canonical component order Meta expects. */
const ORDER: ComponentType[] = ['HEADER', 'BODY', 'FOOTER', 'BUTTONS'];

const value = (e: Event) => (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

/** Right-aligned live character counter that turns red past `max`. */
const counter = (len: number, max: number) =>
  html`<span class="hint ${len > max ? 'over' : ''}">${len} / ${max}</span>`;

/**
 * `<pigeon-whatsapp-editor>` — a two-pane WhatsApp template builder: a form on
 * the left, a live `<pigeon-whatsapp-preview>` + validation panel on the right.
 *
 * All edits produce a new immutable {@link WhatsAppTemplate} and dispatch a
 * `pigeon:change` CustomEvent with `{ detail: { template } }`.
 *
 * @fires pigeon:change - `{ detail: { template: WhatsAppTemplate } }`
 */
@customElement('pigeon-whatsapp-editor')
export class PigeonWhatsAppEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      --wa-teal: #008069;
      --wa-teal-dark: #075e54;
      --wa-focus: rgba(0, 128, 105, 0.16);
      --wa-text: #111b21;
      --wa-muted: #667781;
      --wa-label: #54656f;
      --wa-border: #e4e8eb;
      --wa-field: #d6dce0;
      --wa-surface: #ffffff;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
        sans-serif;
      color: var(--wa-text);
    }
    * {
      box-sizing: border-box;
    }
    .editor {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
      gap: 28px;
      align-items: start;
    }
    @media (max-width: 760px) {
      .editor {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
    .pane {
      min-width: 0;
    }
    .preview {
      position: sticky;
      top: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    @media (max-width: 760px) {
      .preview {
        position: static;
      }
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 460px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--wa-label);
    }
    input,
    select,
    textarea {
      font: inherit;
      font-size: 14px;
      padding: 10px 12px;
      border: 1px solid var(--wa-field);
      border-radius: 10px;
      background: var(--wa-surface);
      color: var(--wa-text);
      width: 100%;
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    }
    input::placeholder,
    textarea::placeholder {
      color: #9aa8af;
    }
    input:hover,
    select:hover,
    textarea:hover {
      border-color: #b9c3c9;
    }
    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--wa-teal);
      box-shadow: 0 0 0 3px var(--wa-focus);
    }
    textarea {
      min-height: 96px;
      resize: vertical;
      line-height: 1.5;
    }
    select {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 34px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23667781" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
    .hint {
      font-size: 11px;
      font-weight: 500;
      color: var(--wa-muted);
      text-align: right;
    }
    .hint.over {
      color: #d3302f;
    }
    fieldset {
      border: 1px solid var(--wa-border);
      border-radius: 14px;
      padding: 16px;
      background: var(--wa-surface);
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: 0;
      box-shadow: 0 1px 2px rgba(11, 20, 26, 0.04);
    }
    legend {
      padding: 0 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--wa-teal);
    }
    button {
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      padding: 9px 14px;
      border: 1px solid var(--wa-field);
      border-radius: 10px;
      background: var(--wa-surface);
      color: var(--wa-text);
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }
    button:hover {
      background: #f0f2f5;
    }
    .btn-primary {
      background: var(--wa-teal);
      border-color: var(--wa-teal);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--wa-teal-dark);
      border-color: var(--wa-teal-dark);
    }
    .button-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      padding: 10px;
      border: 1px solid var(--wa-border);
      border-radius: 10px;
      background: #fbfcfc;
    }
    .button-row input {
      flex: 1 1 120px;
      width: auto;
    }
    .button-type {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--wa-teal);
      background: rgba(0, 128, 105, 0.1);
      border-radius: 6px;
      padding: 4px 8px;
      white-space: nowrap;
    }
    .remove {
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--wa-muted);
      font-size: 15px;
    }
    .remove:hover {
      background: #fdecea;
      color: #d3302f;
      border-color: #f5c6c0;
    }
    .add-button {
      display: flex;
      gap: 8px;
    }
    .add-button select {
      flex: 1;
    }
    .validation {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--wa-muted);
      margin: 0;
    }
    .count-badge {
      font-size: 11px;
      font-weight: 700;
      color: #8a1c12;
      background: #fdecea;
      border-radius: 999px;
      padding: 1px 8px;
      letter-spacing: 0;
    }
    .issues {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .issues li {
      font-size: 13px;
      line-height: 1.45;
      padding: 10px 12px;
      border-radius: 10px;
    }
    .issues li strong {
      display: inline-block;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 5px;
      margin-right: 6px;
      background: rgba(0, 0, 0, 0.06);
    }
    .error {
      background: #fdecea;
      color: #8a1c12;
      border: 1px solid #f5c6c0;
    }
    .warning {
      background: #fff6e5;
      color: #7a5200;
      border: 1px solid #ffe0a3;
    }
    .ok {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #0a7d33;
      background: #e7f6ec;
      border: 1px solid #b6e3c4;
      padding: 11px 12px;
      border-radius: 10px;
      margin: 0;
    }
  `;

  /** The template being edited. Defaults to an empty template. */
  @property({ attribute: false })
  template: WhatsAppTemplate = createEmptyTemplate();

  /** Return the current template — the payload you submit to Meta. */
  getPayload(): WhatsAppTemplate {
    return this.template;
  }

  // A native <select> cannot accept its `value` before its <option>s exist, so
  // Lit's initial property bind lands on the first option. Re-sync after each
  // render, once the options are in the DOM.
  protected updated(): void {
    const cat = this.renderRoot.querySelector<HTMLSelectElement>('#field-category');
    if (cat) cat.value = this.template.category;
    const fmt = this.renderRoot.querySelector<HTMLSelectElement>('#field-header-format');
    if (fmt) fmt.value = this.header?.format ?? 'NONE';
  }

  // --- component accessors -------------------------------------------------
  private get header(): HeaderComponent | undefined {
    return this.template.components.find((c) => c.type === 'HEADER') as HeaderComponent | undefined;
  }
  private get body(): BodyComponent | undefined {
    return this.template.components.find((c) => c.type === 'BODY') as BodyComponent | undefined;
  }
  private get footer(): FooterComponent | undefined {
    return this.template.components.find((c) => c.type === 'FOOTER') as FooterComponent | undefined;
  }
  private get buttonsBlock(): ButtonsComponent | undefined {
    return this.template.components.find((c) => c.type === 'BUTTONS') as ButtonsComponent | undefined;
  }

  // --- immutable mutation --------------------------------------------------
  private commit(template: WhatsAppTemplate): void {
    this.template = template;
    this.dispatchEvent(
      new CustomEvent('pigeon:change', {
        detail: { template },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Replace (or, when `next` is undefined, remove) the component of `type`. */
  private setComponent(type: ComponentType, next: Component | undefined): void {
    const kept = this.template.components.filter((c) => c.type !== type);
    const components = (next ? [...kept, next] : kept).sort(
      (a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type),
    );
    this.commit({ ...this.template, components });
  }

  private patch(partial: Partial<WhatsAppTemplate>): void {
    this.commit({ ...this.template, ...partial });
  }

  // --- field handlers ------------------------------------------------------
  private onHeaderFormat(e: Event): void {
    const format = value(e);
    if (format === 'NONE') return this.setComponent('HEADER', undefined);
    if (format === 'TEXT') {
      const text = this.header?.format === 'TEXT' ? this.header.text ?? '' : '';
      return this.setComponent('HEADER', { type: 'HEADER', format: 'TEXT', text });
    }
    this.setComponent('HEADER', { type: 'HEADER', format: format as HeaderFormat });
  }

  private onBodyText(e: Event): void {
    const example = this.body?.example;
    this.setComponent('BODY', {
      type: 'BODY',
      text: value(e),
      ...(example ? { example } : {}),
    });
  }

  private onBodySamples(e: Event): void {
    const parts = value(e)
      .split(',')
      .map((s) => s.trim());
    const hasSamples = parts.some(Boolean);
    this.setComponent('BODY', {
      type: 'BODY',
      text: this.body?.text ?? '',
      ...(hasSamples ? { example: { body_text: [parts] } } : {}),
    });
  }

  private onFooter(e: Event): void {
    const text = value(e);
    this.setComponent('FOOTER', text.trim() ? { type: 'FOOTER', text } : undefined);
  }

  private addButton(): void {
    const select = this.renderRoot.querySelector<HTMLSelectElement>('#new-button-type');
    const type = (select?.value ?? 'QUICK_REPLY') as ButtonType;
    const buttons = [...(this.buttonsBlock?.buttons ?? []), NEW_BUTTON[type]];
    this.setComponent('BUTTONS', { type: 'BUTTONS', buttons });
  }

  private setButtonField(index: number, field: string, val: string): void {
    const block = this.buttonsBlock;
    if (!block) return;
    const buttons = block.buttons.map((b, i) =>
      i === index ? ({ ...b, [field]: val } as Button) : b,
    );
    this.setComponent('BUTTONS', { type: 'BUTTONS', buttons });
  }

  private removeButton(index: number): void {
    const block = this.buttonsBlock;
    if (!block) return;
    const buttons = block.buttons.filter((_, i) => i !== index);
    this.setComponent('BUTTONS', buttons.length ? { type: 'BUTTONS', buttons } : undefined);
  }

  // --- rendering -----------------------------------------------------------
  private renderButtonRow(b: Button, i: number) {
    const set = (field: string) => (e: Event) => this.setButtonField(i, field, value(e));
    return html`<div class="button-row">
      <span class="button-type">${b.type}</span>
      ${b.type === 'COPY_CODE'
        ? html`<input
            aria-label="Coupon code"
            placeholder="Coupon code"
            .value=${b.example}
            @input=${set('example')}
          />`
        : html`<input
            aria-label="Button text"
            placeholder="Button text"
            .value=${b.text}
            @input=${set('text')}
          />`}
      ${b.type === 'URL'
        ? html`<input aria-label="URL" placeholder="https://…" .value=${b.url} @input=${set('url')} />`
        : nothing}
      ${b.type === 'PHONE_NUMBER'
        ? html`<input
            aria-label="Phone number"
            placeholder="+15551234567"
            .value=${b.phone_number}
            @input=${set('phone_number')}
          />`
        : nothing}
      <button type="button" class="remove" aria-label="Remove button" @click=${() => this.removeButton(i)}>
        ✕
      </button>
    </div>`;
  }

  private renderValidation() {
    const { errors, warnings } = validateTemplate(this.template);
    const count = errors.length + warnings.length;
    const heading = html`<h3>
      Validation${count > 0 ? html`<span class="count-badge">${count}</span>` : nothing}
    </h3>`;
    if (count === 0) {
      return html`${heading}
        <p class="ok">✓ Ready to submit — passes Meta's template rules.</p>`;
    }
    return html`${heading}
      <ul class="issues">
        ${errors.map((i) => html`<li class="error"><strong>${i.rule}</strong>${i.message}</li>`)}
        ${warnings.map(
          (i) => html`<li class="warning"><strong>${i.rule}</strong>${i.message}</li>`,
        )}
      </ul>`;
  }

  render() {
    const header = this.header;
    const headerFormat = header?.format ?? 'NONE';
    const headerText = header?.format === 'TEXT' ? header.text ?? '' : '';
    const samples = this.body?.example?.body_text?.[0] ?? [];

    return html`<div class="editor">
      <form class="pane form" @submit=${(e: Event) => e.preventDefault()}>
        <div class="grid-2">
          <label>
            Name
            <input
              id="field-name"
              placeholder="order_update"
              .value=${this.template.name}
              @input=${(e: Event) => this.patch({ name: value(e) })}
            />
          </label>
          <label>
            Language
            <input
              placeholder="en_US"
              .value=${this.template.language}
              @input=${(e: Event) => this.patch({ language: value(e) })}
            />
          </label>
        </div>
        <label>
          Category
          <select
            id="field-category"
            .value=${this.template.category}
            @change=${(e: Event) => this.patch({ category: value(e) as TemplateCategory })}
          >
            ${CATEGORIES.map((c) => html`<option value=${c}>${c}</option>`)}
          </select>
        </label>

        <fieldset>
          <legend>Header</legend>
          <label>
            Format
            <select id="field-header-format" .value=${headerFormat} @change=${this.onHeaderFormat}>
              <option value="NONE">None</option>
              ${HEADER_FORMATS.map((f) => html`<option value=${f}>${f}</option>`)}
            </select>
          </label>
          ${headerFormat === 'TEXT'
            ? html`<label>
                Text
                <input
                  placeholder="Hi {{1}}"
                  .value=${headerText}
                  @input=${(e: Event) =>
                    this.setComponent('HEADER', { type: 'HEADER', format: 'TEXT', text: value(e) })}
                />
                ${counter(headerText.length, LIMITS.HEADER_TEXT_MAX)}
              </label>`
            : nothing}
        </fieldset>

        <fieldset>
          <legend>Body</legend>
          <label>
            Text
            <textarea
              placeholder="Your order {{1}} ships today."
              .value=${this.body?.text ?? ''}
              @input=${this.onBodyText}
            ></textarea>
            ${counter((this.body?.text ?? '').length, LIMITS.BODY_MAX)}
          </label>
          <label>
            Sample values (comma-separated)
            <input placeholder="#12345" .value=${samples.join(', ')} @input=${this.onBodySamples} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Footer</legend>
          <label>
            Text
            <input
              placeholder="Reply STOP to opt out"
              .value=${this.footer?.text ?? ''}
              @input=${this.onFooter}
            />
            ${counter((this.footer?.text ?? '').length, LIMITS.FOOTER_MAX)}
          </label>
        </fieldset>

        <fieldset>
          <legend>Buttons</legend>
          ${(this.buttonsBlock?.buttons ?? []).map((b, i) => this.renderButtonRow(b, i))}
          <div class="add-button">
            <select id="new-button-type">
              ${BUTTON_TYPES.map((t) => html`<option value=${t.value}>${t.label}</option>`)}
            </select>
            <button type="button" class="btn-primary" @click=${this.addButton}>
              + Add button
            </button>
          </div>
        </fieldset>
      </form>

      <div class="pane preview">
        <pigeon-whatsapp-preview .template=${this.template}></pigeon-whatsapp-preview>
        <section class="validation">${this.renderValidation()}</section>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pigeon-whatsapp-editor': PigeonWhatsAppEditor;
  }
}
