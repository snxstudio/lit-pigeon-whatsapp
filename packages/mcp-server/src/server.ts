import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CATEGORIES, validateTemplate, type WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { templateSchema, createInputShape } from './schema.js';
import {
  createTemplate,
  renderPreviewText,
  buildCloudApiPayload,
  type CreateTemplateInput,
} from './template.js';

export {
  createTemplate,
  renderPreviewText,
  buildCloudApiPayload,
  substitute,
  type CreateTemplateInput,
  type CloudApiPayloadResult,
} from './template.js';

/** Wrap a value as an MCP text-content result (pretty-printed JSON). */
function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

/**
 * Build the WhatsApp-template MCP server with all tools registered.
 * Connect it to a transport (e.g. {@link StdioServerTransport}) to run it.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'lit-pigeon-whatsapp', version: '0.0.0' });

  server.registerTool(
    'create_template',
    {
      title: 'Create WhatsApp template',
      description:
        'Build a WhatsApp message template from simple fields and return it together with its validation result.',
      inputSchema: createInputShape,
    },
    async (args) => {
      const template = createTemplate(args as CreateTemplateInput);
      return json({ template, validation: validateTemplate(template) });
    },
  );

  server.registerTool(
    'validate_template',
    {
      title: 'Validate WhatsApp template',
      description:
        "Validate a template against Meta's Cloud API rules. Returns { valid, errors, warnings }.",
      inputSchema: { template: templateSchema },
    },
    async ({ template }) => json(validateTemplate(template as WhatsAppTemplate)),
  );

  server.registerTool(
    'list_categories',
    {
      title: 'List template categories',
      description: 'List the valid WhatsApp template categories.',
    },
    async () => json(CATEGORIES),
  );

  server.registerTool(
    'render_preview_text',
    {
      title: 'Render preview text',
      description:
        'Render a plain-text preview of the template with {{n}} variables substituted from the sample values.',
      inputSchema: { template: templateSchema },
    },
    async ({ template }) => ({
      content: [{ type: 'text' as const, text: renderPreviewText(template as WhatsAppTemplate) }],
    }),
  );

  server.registerTool(
    'build_cloud_api_payload',
    {
      title: 'Build Cloud API payload',
      description:
        'Validate then build the POST /{waba-id}/message_templates request body. Refuses (ok:false) on validation errors.',
      inputSchema: { template: templateSchema },
    },
    async ({ template }) => json(buildCloudApiPayload(template as WhatsAppTemplate)),
  );

  return server;
}
