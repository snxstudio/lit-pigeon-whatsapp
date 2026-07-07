# @lit-pigeon/whatsapp-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (stdio) server for
building and validating [WhatsApp Business message
templates](https://developers.facebook.com/docs/whatsapp/message-templates),
backed by [`@lit-pigeon/whatsapp-core`](../core#readme).

## Tools

| Tool | Description |
| --- | --- |
| `create_template` | Build a template from simple fields; returns it + validation. |
| `validate_template` | Validate a template against Meta's rules (`{ valid, errors, warnings }`). |
| `list_categories` | List the valid template categories. |
| `render_preview_text` | Plain-text preview with `{{n}}` substituted from samples. |
| `build_cloud_api_payload` | Validate, then build the `POST /{waba-id}/message_templates` body (refuses on errors). |

## Run

```sh
npx -y @lit-pigeon/whatsapp-mcp
```

Register it with an MCP client (e.g. Claude Desktop):

```json
{
  "mcpServers": {
    "whatsapp": { "command": "npx", "args": ["-y", "@lit-pigeon/whatsapp-mcp"] }
  }
}
```

## Programmatic use

```ts
import { createServer } from '@lit-pigeon/whatsapp-mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createServer();
await server.connect(new StdioServerTransport());
```

## License

MIT — see [LICENSE](./LICENSE).
