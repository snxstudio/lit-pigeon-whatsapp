# @lit-pigeon/whatsapp-cloud

Submit and list [WhatsApp Business message
templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
via Meta's Graph API. Validates with
[`@lit-pigeon/whatsapp-core`](../core#readme) before submitting.

```sh
npm install @lit-pigeon/whatsapp-cloud
```

```ts
import { submitTemplate, listTemplates } from '@lit-pigeon/whatsapp-cloud';

const options = { wabaId: '<WABA_ID>', token: '<ACCESS_TOKEN>' };

// Validates first; throws TemplateValidationError (without calling the API)
// if the template has errors, or GraphApiError on a non-2xx response.
const created = await submitTemplate(template, options);

const { data } = await listTemplates(options, { fields: ['name', 'status'], limit: 20 });
```

## API

- `submitTemplate(template, options)` → `POST /{waba-id}/message_templates`
- `listTemplates(options, params?)` → `GET /{waba-id}/message_templates`
- `options`: `{ wabaId, token, version?, baseUrl?, fetch? }` (defaults: Graph `v21.0`,
  `https://graph.facebook.com`, global `fetch`).
- Errors: `TemplateValidationError` (`.errors`), `GraphApiError` (`.status`, `.body`).

## License

MIT — see [LICENSE](./LICENSE).
