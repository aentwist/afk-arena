export function toKebabCase(plain: string): string {
  return plain.replaceAll(" ", "-").toLowerCase();
}
