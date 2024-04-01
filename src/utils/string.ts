/**
 * Normalize a name by converting it to lowercase and removing spaces.
 * @param name
 * @returns {string} The normalized name.
 */
export function normalizeName(name: string): string {
  return name.toLowerCase().replaceAll(' ', '')
}
