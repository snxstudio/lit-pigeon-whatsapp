import { describe, it, expect } from 'vitest';
import {
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
  validateTemplate,
  type WhatsAppTemplate,
} from '../src/index.js';

function templateWithLanguage(language: string): WhatsAppTemplate {
  return {
    name: 'demo',
    language,
    category: 'UTILITY',
    components: [{ type: 'BODY', text: 'Hi there {{1}}!', example: { body_text: [['Sam']] } }],
  };
}

describe('supported languages', () => {
  it('recognises known codes and rejects unknown ones', () => {
    expect(isSupportedLanguage('en_US')).toBe(true);
    expect(isSupportedLanguage('pt_BR')).toBe(true);
    expect(isSupportedLanguage('xx_YY')).toBe(false);
    expect(SUPPORTED_LANGUAGES).toContain('en_US');
  });

  it('warns (does not error) on an unknown language', () => {
    const result = validateTemplate(templateWithLanguage('xx_YY'));
    expect(result.valid).toBe(true); // warning only — still submittable-shaped
    expect(result.warnings.map((w) => w.rule)).toContain('language-unknown');
    expect(result.errors.map((e) => e.rule)).not.toContain('language-unknown');
  });

  it('does not warn on a supported language', () => {
    const result = validateTemplate(templateWithLanguage('en_US'));
    expect(result.warnings.map((w) => w.rule)).not.toContain('language-unknown');
  });
});
