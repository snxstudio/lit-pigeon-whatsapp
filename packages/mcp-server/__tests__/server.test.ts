import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';
import { createServer } from '../src/server';

/** Spin up the server and a client wired together over an in-memory transport. */
async function connect(): Promise<Client> {
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

function textOf(result: { content: unknown }): string {
  const content = result.content as Array<{ type: string; text: string }>;
  return content[0].text;
}

describe('whatsapp MCP server', () => {
  it('exposes the expected tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'build_cloud_api_payload',
      'create_template',
      'list_categories',
      'render_preview_text',
      'validate_template',
    ]);
  });

  it('validate_template reports errors for an invalid template', async () => {
    const client = await connect();
    const template: WhatsAppTemplate = {
      name: 'Bad Name', // spaces + capitals are invalid
      language: 'en_US',
      category: 'UTILITY',
      components: [{ type: 'BODY', text: '' }], // empty body
    };
    const result = await client.callTool({ name: 'validate_template', arguments: { template } });
    const parsed = JSON.parse(textOf(result));
    expect(parsed.valid).toBe(false);
    const rules = parsed.errors.map((e: { rule: string }) => e.rule);
    expect(rules).toContain('name-format');
    expect(rules).toContain('body-empty');
  });

  it('validate_template accepts a valid template', async () => {
    const client = await connect();
    const template: WhatsAppTemplate = {
      name: 'order_update',
      language: 'en_US',
      category: 'UTILITY',
      components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
    };
    const result = await client.callTool({ name: 'validate_template', arguments: { template } });
    expect(JSON.parse(textOf(result)).valid).toBe(true);
  });

  it('create_template + build_cloud_api_payload produce a submittable payload', async () => {
    const client = await connect();
    const created = await client.callTool({
      name: 'create_template',
      arguments: {
        name: 'welcome_msg',
        category: 'MARKETING',
        body_text: 'Welcome aboard, {{1}}!',
        body_samples: ['Sam'],
        footer_text: 'Reply STOP to opt out',
      },
    });
    const { template } = JSON.parse(textOf(created));
    expect(template.name).toBe('welcome_msg');

    const payload = await client.callTool({
      name: 'build_cloud_api_payload',
      arguments: { template },
    });
    const parsed = JSON.parse(textOf(payload));
    expect(parsed.ok).toBe(true);
    expect(parsed.payload.components.some((c: { type: string }) => c.type === 'BODY')).toBe(true);
  });
});
