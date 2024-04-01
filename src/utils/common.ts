/**
 * Merge objects
 * @param target
 * @param source
 */
export const extend = Object.assign

/**
 * Arrayify a value.
 * @param target
 */
export function arraify<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target]
}

/**
 * Check if a value is an object.
 * @param value
 */
export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * Chunk an array into smaller arrays of a specified size.
 * @param array
 * @param size
 * @returns Returns a new array with the elements that are present in the first array but not in the second.
 */
export function chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
  if (array.length <= size) {
    return [array]
  }

  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size)
    chunks.push(chunk)
  }
  return chunks
}

/**
 * Delay the execution of the next line of code.
 * @param ms - The number of milliseconds to delay the execution.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Merge two objects deeply
 * @param defaults
 * @param overrides
 * @returns The merged object
 */
export function mergeDeep(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
) {
  const merged: Record<string, any> = { ...defaults }
  for (const key in overrides) {
    const value = overrides[key]
    if (value == null) {
      continue
    }

    const existing = merged[key]
    if (existing == null) {
      merged[key] = value
      continue
    }

    if (Array.isArray(existing) || Array.isArray(value)) {
      merged[key] = [...arraify(existing), ...arraify(value)]
      continue
    }

    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeDeep(
        existing,
        value,
      )
      continue
    }

    merged[key] = value
  }
  return merged
}
