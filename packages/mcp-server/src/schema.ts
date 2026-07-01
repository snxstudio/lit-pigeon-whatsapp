import { z } from 'zod';

/** Zod schemas mirroring the `@lit-pigeon/whatsapp-core` template model, used
 *  as MCP tool input schemas so the tools are self-describing. */

export const categorySchema = z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']);
export const headerFormatSchema = z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']);

const buttonSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('QUICK_REPLY'), text: z.string() }),
  z.object({
    type: z.literal('URL'),
    text: z.string(),
    url: z.string(),
    example: z.array(z.string()).optional(),
  }),
  z.object({ type: z.literal('PHONE_NUMBER'), text: z.string(), phone_number: z.string() }),
  z.object({ type: z.literal('COPY_CODE'), example: z.string() }),
]);

const componentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('HEADER'),
    format: headerFormatSchema,
    text: z.string().optional(),
    example: z
      .object({
        header_text: z.array(z.string()).optional(),
        header_handle: z.array(z.string()).optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal('BODY'),
    text: z.string(),
    example: z.object({ body_text: z.array(z.array(z.string())).optional() }).optional(),
  }),
  z.object({ type: z.literal('FOOTER'), text: z.string() }),
  z.object({ type: z.literal('BUTTONS'), buttons: z.array(buttonSchema) }),
]);

export const templateSchema = z.object({
  name: z.string(),
  language: z.string(),
  category: categorySchema,
  components: z.array(componentSchema),
});

/** Input shape for the `create_template` convenience tool. */
export const createInputShape = {
  name: z.string().describe('Template name: lowercase letters, numbers and underscores only.'),
  category: categorySchema.describe('MARKETING, UTILITY, or AUTHENTICATION.'),
  language: z.string().default('en_US').describe('Language/locale code, e.g. en_US.'),
  body_text: z.string().describe('Body text. Use {{1}}, {{2}}… for variables.'),
  body_samples: z
    .array(z.string())
    .optional()
    .describe('Sample values for the body variables, in order.'),
  header_text: z.string().optional().describe('Optional TEXT header (may contain one {{1}}).'),
  header_sample: z.string().optional().describe('Sample value for the header variable.'),
  footer_text: z.string().optional().describe('Optional footer text (no variables allowed).'),
};
