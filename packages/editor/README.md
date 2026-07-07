# @lit-pigeon/whatsapp-editor

Lit web components to build, preview, and validate [WhatsApp Business message
templates](https://developers.facebook.com/docs/whatsapp/message-templates)
against Meta's Cloud API rules. Built on
[`@lit-pigeon/whatsapp-core`](../core#readme).

> **Status:** early. `<pigeon-whatsapp-preview>` and `<pigeon-whatsapp-editor>`
> are available.

## `<pigeon-whatsapp-editor>`

A two-pane template builder: a form (name, language, category, header, body +
sample values, footer, buttons) on the left, and a live
`<pigeon-whatsapp-preview>` plus a validation panel (errors/warnings from
`validateTemplate`) on the right.

Edits are immutable and dispatch a `pigeon:change` event; `getPayload()` returns
the current template (the payload you submit to Meta).

```ts
import '@lit-pigeon/whatsapp-editor'; // registers both elements
```

```html
<pigeon-whatsapp-editor
  @pigeon:change=${(e) => console.log(e.detail.template)}
></pigeon-whatsapp-editor>
```

## `<pigeon-whatsapp-preview>`

Renders a `WhatsAppTemplate` as a WhatsApp-style chat bubble — header (text or a
media placeholder), body with `{{n}}` samples substituted and WhatsApp
formatting (`*bold*`, `_italic_`, `~strike~`, `` ```mono``` ``, newlines)
applied, footer, and full-width button rows.

```ts
import '@lit-pigeon/whatsapp-editor'; // registers the element
```

```html
<pigeon-whatsapp-preview .template=${template}></pigeon-whatsapp-preview>
```

The `template` property is set as a DOM property (not an attribute).

## Install

```sh
npm install @lit-pigeon/whatsapp-editor lit
```

`lit` is a peer dependency — install it alongside this package.

## License

MIT — see [LICENSE](./LICENSE).
