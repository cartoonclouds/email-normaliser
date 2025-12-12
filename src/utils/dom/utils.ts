export function getDocument(): Document | null {
  if (typeof globalThis !== 'undefined' && globalThis.document) {
    return globalThis.document
  }

  if (typeof document !== 'undefined') {
    return document
  }

  return null
}

export function getConsole(): Console | null {
  if (typeof globalThis !== 'undefined' && globalThis.console) {
    return globalThis.console
  }

  if (typeof console !== 'undefined') {
    return console
  }

  return null
}
