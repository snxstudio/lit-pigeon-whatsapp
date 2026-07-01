/**
 * Language / locale codes WhatsApp accepts for message templates.
 * See the "Supported Languages" table in Meta's message-template docs.
 */
export const SUPPORTED_LANGUAGES = [
  'af', 'sq', 'ar', 'az', 'bn', 'bg', 'ca', 'zh_CN', 'zh_HK', 'zh_TW', 'hr',
  'cs', 'da', 'nl', 'en', 'en_GB', 'en_US', 'et', 'fil', 'fi', 'fr', 'ka',
  'de', 'el', 'gu', 'ha', 'he', 'hi', 'hu', 'id', 'ga', 'it', 'ja', 'kn',
  'kk', 'rw_RW', 'ko', 'ky_KG', 'lo', 'lv', 'lt', 'mk', 'ms', 'ml', 'mr',
  'nb', 'fa', 'pl', 'pt_BR', 'pt_PT', 'pa', 'ro', 'ru', 'sr', 'sk', 'sl',
  'es', 'es_AR', 'es_ES', 'es_MX', 'sw', 'sv', 'ta', 'te', 'th', 'tr', 'uk',
  'ur', 'uz', 'vi', 'zu',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_SET: ReadonlySet<string> = new Set(SUPPORTED_LANGUAGES);

/** True when `code` is a WhatsApp-supported template language code. */
export function isSupportedLanguage(code: string): boolean {
  return LANGUAGE_SET.has(code);
}
