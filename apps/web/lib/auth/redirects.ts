const fallbackPath = '/player';

export function isInternalPath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//') && !value.includes('://'));
}

export function safeReturnPath(value: string | null | undefined): string {
  return isInternalPath(value) ? value : fallbackPath;
}
