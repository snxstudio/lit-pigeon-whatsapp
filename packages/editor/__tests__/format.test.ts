import { describe, it, expect } from 'vitest';
import { substituteVariables, renderWhatsAppText } from '../src/format';

describe('substituteVariables', () => {
  it('replaces positional placeholders with samples', () => {
    expect(substituteVariables('Hi {{1}}, order {{2}}', ['Sam', '#42'])).toBe(
      'Hi Sam, order #42',
    );
  });

  it('tolerates whitespace inside the braces', () => {
    expect(substituteVariables('Hi {{ 1 }}', ['Sam'])).toBe('Hi Sam');
  });

  it('leaves a placeholder untouched when the sample is missing or empty', () => {
    expect(substituteVariables('Hi {{1}} {{2}}', ['Sam'])).toBe('Hi Sam {{2}}');
    expect(substituteVariables('Hi {{1}}', [''])).toBe('Hi {{1}}');
  });
});

describe('renderWhatsAppText', () => {
  it('escapes HTML before formatting (XSS-safe)', () => {
    expect(renderWhatsAppText('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;',
    );
    expect(renderWhatsAppText(`a & b "c" 'd'`)).toBe('a &amp; b &quot;c&quot; &#39;d&#39;');
  });

  it('applies bold, italic, strike and monospace', () => {
    expect(renderWhatsAppText('*b*')).toBe('<strong>b</strong>');
    expect(renderWhatsAppText('_i_')).toBe('<em>i</em>');
    expect(renderWhatsAppText('~s~')).toBe('<del>s</del>');
    expect(renderWhatsAppText('```m```')).toBe('<code>m</code>');
  });

  it('converts newlines to <br> after inline formatting', () => {
    expect(renderWhatsAppText('a\n*b*')).toBe('a<br><strong>b</strong>');
  });

  it('does not format across newlines', () => {
    expect(renderWhatsAppText('*a\nb*')).toBe('*a<br>b*');
  });

  it('keeps escaped entities intact inside formatting', () => {
    expect(renderWhatsAppText('*a&b*')).toBe('<strong>a&amp;b</strong>');
  });
});
