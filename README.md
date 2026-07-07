# 🕊️ Lit Pigeon for WhatsApp

**Open-source toolkit for WhatsApp Business message templates.** Build them,
validate against Meta's rules _before_ you submit, preview the chat bubble live,
and export the exact Cloud API payload — no more submit-and-pray rejection loops.

[![CI](https://github.com/snxstudio/lit-pigeon-whatsapp/actions/workflows/ci.yml/badge.svg)](https://github.com/snxstudio/lit-pigeon-whatsapp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-008069.svg)](./LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-008069.svg)](https://pnpm.io/)

> **▶ [Try the live editor →](https://snxstudio.github.io/lit-pigeon-whatsapp/)**
> — build a template in your browser and watch it validate in real time.

Part of the [Lit Pigeon](https://github.com/snxstudio/lit-pigeon) family of
open-source, framework-agnostic email + messaging tooling.

---

## Why

Meta rejects WhatsApp templates for rules that aren't obvious until submission:
name format, character limits, variable numbering, button-type constraints, and
per-category policy. Each rejection is a round-trip that can take hours. Lit
Pigeon models those rules in TypeScript so you catch problems **at author time** —
in an editor, in CI, or from an AI agent — and only submit templates that pass.

## Features

- ✅ **Meta-rule validator** — character limits, `{{n}}` variable rules, button
  constraints, category policy. Returns structured `errors` + `warnings`.
- 👀 **Live chat-bubble preview** — WhatsApp-accurate rendering with `*bold*`,
  `_italic_`, `~strike~`, ` ```mono``` `, media headers, and interactive buttons.
- 🧩 **Framework-agnostic** — a Lit web component that drops into React, Vue,
  Svelte, or plain HTML.
- 🤖 **AI-native** — an MCP server so assistants can author and validate templates.
- 🚀 **Cloud API helper** — submit validated templates straight to Meta's Graph API.
- 🪶 **Zero runtime deps in core**, TypeScript strict, tree-shakeable ESM.

## Packages

| Package | Description |
| --- | --- |
| [`@lit-pigeon/whatsapp-core`](./packages/core#readme) | Template model + validator against Meta's message-template rules. |
| [`@lit-pigeon/whatsapp-editor`](./packages/editor#readme) | `<pigeon-whatsapp-editor>` / `<pigeon-whatsapp-preview>` Lit web components. |
| [`@lit-pigeon/whatsapp-react`](./packages/react#readme) | React wrapper for the editor component. |
| [`@lit-pigeon/whatsapp-vue`](./packages/vue#readme) | Vue wrapper for the editor component. |
| [`@lit-pigeon/whatsapp-svelte`](./packages/svelte#readme) | Svelte wrapper for the editor component. |
| [`@lit-pigeon/whatsapp-mcp`](./packages/mcp-server#readme) | Model Context Protocol (stdio) server for AI authoring. |
| [`@lit-pigeon/whatsapp-cloud`](./packages/cloud#readme) | Submit / list templates via the WhatsApp Cloud API. |

## Quick start

Validate a template before you ever call Meta:

```ts
import { validateTemplate, type WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';

const template: WhatsAppTemplate = {
  name: 'order_confirmation',
  language: 'en_US',
  category: 'UTILITY',
  components: [
    {
      type: 'BODY',
      text: 'Hi {{1}}, your order *{{2}}* ships {{3}}.',
      example: { body_text: [['Sam', '#A1234', 'Friday']] },
    },
    { type: 'FOOTER', text: 'Reply STOP to unsubscribe' },
  ],
};

const { valid, errors, warnings } = validateTemplate(template);
// valid: true — safe to submit
```

Prefer to start from a known-good template? `getStarterTemplates()` returns
ready-made welcome, order-update, and OTP examples that all pass validation.

## The editor component

The editor is a standard custom element — drop it anywhere:

```html
<script type="module">
  import '@lit-pigeon/whatsapp-editor';
</script>

<pigeon-whatsapp-editor></pigeon-whatsapp-editor>
```

```js
const editor = document.querySelector('pigeon-whatsapp-editor');
editor.template = myTemplate; // optional starting point
editor.addEventListener('pigeon:change', (e) => {
  console.log(e.detail.template); // the current, edited template
});
const payload = editor.getPayload(); // what you'd submit to Meta
```

### With a framework

Each wrapper binds `template` in and surfaces edits back out:

```tsx
// React — onChange receives the pigeon:change event
import { WhatsAppEditor } from '@lit-pigeon/whatsapp-react';

<WhatsAppEditor template={template} onChange={(e) => setTemplate(e.detail.template)} />;
```

```vue
<!-- Vue — @change receives the updated template -->
<script setup>
import { WhatsAppEditor } from '@lit-pigeon/whatsapp-vue';
</script>
<template>
  <WhatsAppEditor :template="template" @change="(t) => (template = t)" />
</template>
```

```svelte
<!-- Svelte — onchange receives the updated template -->
<script>
  import { WhatsAppEditor } from '@lit-pigeon/whatsapp-svelte';
</script>
<WhatsAppEditor {template} onchange={(t) => (template = t)} />
```

## AI authoring (MCP)

Run the MCP server so an assistant can create, validate, and preview templates:

```sh
npx -y @lit-pigeon/whatsapp-mcp
```

It exposes `create_template`, `validate_template`, `list_categories`,
`render_preview_text`, and `build_cloud_api_payload`. See the
[package README](./packages/mcp-server#readme) for client setup.

## Submitting to Meta

```ts
import { submitTemplate } from '@lit-pigeon/whatsapp-cloud';

// Validates first and refuses to submit if the template has errors.
await submitTemplate(template, {
  wabaId: process.env.WABA_ID!,
  token: process.env.WHATSAPP_TOKEN!,
});
```

## Development

A pnpm workspace (Node 22, pnpm 9). From the repo root:

```sh
corepack enable
pnpm install
pnpm build       # build every package
pnpm typecheck
pnpm test        # Vitest
pnpm lint

pnpm --filter playground dev   # run the live editor locally
```

## Contributing

Issues and PRs are welcome. Please keep packages framework-agnostic, match the
existing code style (ESLint 9 flat config, Vitest, TypeScript strict), and make
sure `pnpm build && pnpm typecheck && pnpm test && pnpm lint` all pass.

## License

[MIT](./LICENSE) © SNX Studio
