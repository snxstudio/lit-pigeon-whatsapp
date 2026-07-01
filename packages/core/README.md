# @lit-pigeon/whatsapp-core

The WhatsApp Business message-template **model + validator** behind
[Lit Pigeon for WhatsApp](https://github.com/snxstudio/lit-pigeon-whatsapp).
Catch the rejections Meta would give you — character limits, variable rules,
button constraints — *before* you submit a template for approval. Zero runtime
dependencies.

## Install

```bash
npm install @lit-pigeon/whatsapp-core
```

## Usage

```ts
import { validateTemplate, createEmptyTemplate, type WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';

const template: WhatsAppTemplate = {
  name: 'order_confirmation',
  language: 'en_US',
  category: 'UTILITY',
  components: [
    { type: 'BODY', text: 'Hi {{1}}, your order {{2}} has shipped.', example: { body_text: [['Alex', '#1024']] } },
    { type: 'FOOTER', text: 'Reply STOP to opt out' },
  ],
};

const result = validateTemplate(template);
if (!result.valid) {
  for (const issue of result.errors) {
    console.error(`[${issue.rule}] ${issue.message}`);
  }
}
```

`validateTemplate` returns `{ valid, issues, errors, warnings }`. **Errors**
block submission (e.g. a body that starts with a variable, a footer containing
`{{1}}`, more than one phone button); **warnings** are things Meta wants for a
clean review (e.g. missing variable samples).

Start from a blank template with `createEmptyTemplate()`, and inspect variables
with `extractVariables()` / `distinctVariables()`.

Part of [Lit Pigeon](https://github.com/snxstudio/lit-pigeon) — open-source, framework-agnostic email + messaging tooling.

## License

MIT
