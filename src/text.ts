const mojibakeMarkers = /[ÃÂâðŸØÙ]/;

export function repairMojibake(value: string): string {
  if (!mojibakeMarkers.test(value)) return value;
  try {
    const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0) & 0xff);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}
