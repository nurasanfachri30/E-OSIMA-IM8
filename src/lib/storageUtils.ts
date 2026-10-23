/**
 * Resilient Web Storage Utility
 * Prevents QuotaExceededError crashes, sanitizes oversized base64 strings,
 * and recovers gracefully when browser storage is restricted or full.
 */

export function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.code === 22 ||
      err.code === 1014 ||
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Remove oversized base64 strings (>30KB) from an object before saving to localStorage
 * to ensure settings/classes/metadata never exceed browser quota.
 */
function sanitizeForStorage(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeForStorage(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string' && v.startsWith('data:image/') && v.length > 30000) {
      // Omit huge base64 payload from persistent storage to preserve quota;
      // in-memory state will continue to hold the full image during the session.
      sanitized[k] = '';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeForStorage(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

/**
 * Safely retrieve an item from localStorage
 */
export function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[safeStorage] Failed to read key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safely save an item to localStorage with quota protection and fallback cleaning
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn(`[safeStorage] QuotaExceededError on "${key}". Attempting sanitized recovery...`);
      try {
        // Attempt 1: Sanitize large base64 strings from this value
        const sanitized = sanitizeForStorage(value);
        window.localStorage.setItem(key, JSON.stringify(sanitized));
        return true;
      } catch (retryErr) {
        if (isQuotaExceededError(retryErr)) {
          // Attempt 2: Clear bulky secondary keys if needed
          try {
            console.warn('[safeStorage] Clearing secondary storage caches to free space...');
            // Purge bulky keys that can be refetched or regenerated
            window.localStorage.removeItem('eosis_candidates_v1');
            window.localStorage.removeItem('eosis_students_v1');

            // Retry saving
            const sanitized = sanitizeForStorage(value);
            window.localStorage.setItem(key, JSON.stringify(sanitized));
            return true;
          } catch (finalErr) {
            console.error(`[safeStorage] Unable to save "${key}" even after recovery:`, finalErr);
            return false;
          }
        }
      }
    }
    console.warn(`[safeStorage] Failed to set key "${key}":`, err);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 */
export function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[safeStorage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Safely retrieve an item from sessionStorage
 */
export function safeSessionStorageGet<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return defaultValue;
    }
    const item = window.sessionStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[safeStorage] Failed to read session key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safely save an item to sessionStorage
 */
export function safeSessionStorageSet(key: string, value: unknown): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return false;
    }
    window.sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[safeStorage] Failed to set session key "${key}":`, err);
    return false;
  }
}

/**
 * Safely remove an item from sessionStorage
 */
export function safeSessionStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[safeStorage] Failed to remove session key "${key}":`, err);
  }
}
