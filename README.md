# Lit Pigeon for WhatsApp

**Open-source WhatsApp message-template designer.** Build WhatsApp Business
templates, validate them against Meta's rules *before* you submit, preview the
chat bubble live, and export the exact Cloud API payload. No more
submit-and-pray rejection loops.

Part of the [Lit Pigeon](https://github.com/snxstudio/lit-pigeon) family
(open-source, framework-agnostic email + messaging tooling).

> ⚠️ Early WIP. The `@lit-pigeon/whatsapp-core` model + validator land first;
> the `<pigeon-whatsapp-editor>` UI and an MCP server for AI authoring follow.

## Packages

| Package | What it does |
|---|---|
| `@lit-pigeon/whatsapp-core` | Template TypeScript model + validator against Meta's message-template rules (character limits, variable rules, button constraints, category policy). |
| `@lit-pigeon/whatsapp-editor` | *(next)* `<pigeon-whatsapp-editor>` Lit web component — form editor + live chat-bubble preview. |

## License

MIT
