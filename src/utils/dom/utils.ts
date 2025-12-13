/**
 * Get the global document object if available.
 *
 * @returns The global Document object or null if not available.
 */
export function getDocument(): Document | null {
  if (typeof globalThis !== 'undefined' && globalThis.document) {
    return globalThis.document
  }

  if (typeof document !== 'undefined') {
    return document
  }

  return null
}

/**
 * Get the global console object if available.
 *
 * @returns The global Console object or null if not available.
 */
export function getConsole(): Console | null {
  if (typeof globalThis !== 'undefined' && globalThis.console) {
    return globalThis.console
  }

  if (typeof console !== 'undefined') {
    return console
  }

  return null
}
