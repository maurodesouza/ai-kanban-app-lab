/**
 * Generates a random ID with specified length
 * @param length - Length of the ID (default: 12)
 * @returns Random string ID
 */
export function randomId(length = 12): string {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export const random = {
  id: randomId,
};
