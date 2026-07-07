import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  createEmptyTemplate,
  validateTemplate,
  CATEGORIES,
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
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
        sans-serif;
      color: #111b21;
    }
    .editor {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    @media (max-width: 720px) {
      .editor {
        grid-template-columns: 1fr;
      }
    }
    .pane {
      min-width: 0;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #3b4a54;
    }
    input,
    select,
    textarea {
      font: inherit;
      font-size: 14px;
      padding: 8px;
      border: 1px solid #d1d7db;
      border-radius: 6px;
      background: #fff;
      color: #111b21;
      box-sizing: border-box;
      width: 100%;
    }
    textarea {
      min-height: 92px;
      resize: vertical;
    }
    fieldset {
      border: 1px solid #e9edef;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 0;
    }
    legend {
      padding: 0 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #667781;
    }
    button {
      font: inherit;
      cursor: pointer;
      padding: 8px 12px;
      border: 1px solid #d1d7db;
      border-radius: 6px;
      background: #f0f2f5;
      color: #111b21;
    }
    .button-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .button-row input {
      flex: 1 1 120px;
      width: auto;
    }
    .button-type {
      font-size: 12px;
      font-weight: 700;
      color: #667781;
      min-width: 90px;
    }
    .remove {
      flex: 0 0 auto;
      padding: 6px 10px;
    }
    .add-button {
      display: flex;
      gap: 8px;
    }
    .add-button select {
      flex: 1;
    }
    .validation {
      margin-top: 12px;
    }
    h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #667781;
      margin: 0 0 8px;
    }
    .issues {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .issues li {
      font-size: 13px;
      padding: 8px 10px;
      border-radius: 6px;
    }
    .issues li strong {
      font-family: monospace;
      font-size: 12px;
      margin-right: 6px;
      opacity: 0.75;
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
      font-size: 13px;
      color: #1a7f37;
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
    if (errors.length === 0 && warnings.length === 0) {
      return html`<p class="ok">✓ Template looks valid.</p>`;
    }
    return html`<ul class="issues">
      ${errors.map(
        (i) => html`<li class="error"><strong>${i.rule}</strong>${i.message}</li>`,
      )}
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
        <label>
          Category
          <select
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
            <select .value=${headerFormat} @change=${this.onHeaderFormat}>
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
          </label>
        </fieldset>

        <fieldset>
          <legend>Buttons</legend>
          ${(this.buttonsBlock?.buttons ?? []).map((b, i) => this.renderButtonRow(b, i))}
          <div class="add-button">
            <select id="new-button-type">
              ${BUTTON_TYPES.map((t) => html`<option value=${t.value}>${t.label}</option>`)}
            </select>
            <button type="button" @click=${this.addButton}>Add button</button>
          </div>
        </fieldset>
      </form>

      <div class="pane preview">
        <pigeon-whatsapp-preview .template=${this.template}></pigeon-whatsapp-preview>
        <section class="validation">
          <h3>Validation</h3>
          ${this.renderValidation()}
        </section>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pigeon-whatsapp-editor': PigeonWhatsAppEditor;
  }
}
