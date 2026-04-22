// List of RTL language codes (without locale suffix)
const RTL_LANGUAGES = ['fa', 'ar'];

export function isRTL(language: string): boolean {
    return RTL_LANGUAGES.includes(language);
}