/**
 * Simple obfuscation layer for client-side keys.
 * NOTE: This is NOT encryption. It only prevents plain-text scraping.
 * Since GitHub Pages is static, true security requires a backend proxy.
 */

/**
 * Encodes a string to a simple format (reverse + base64).
 * Used during development or manual setup if needed.
 */
export const obfuscate = (str: string): string => {
    if (typeof window === "undefined") return "";
    return btoa(str.split("").reverse().join(""));
};

/**
 * Decodes the obfuscated string back to plain text for API calls.
 */
export const deobfuscate = (obfuscated: string): string => {
    if (!obfuscated || typeof window === "undefined") return "";
    try {
        return atob(obfuscated).split("").reverse().join("");
    } catch (e) {
        console.error("Failed to deobfuscate key:", e);
        return "";
    }
};

/**
 * Retrieves an environment variable and deobfuscates if necessary,
 * or handles plain text if not yet obfuscated.
 */
export const getSecureKey = (key: string | undefined): string => {
    if (!key) return "";

    // If it looks like a Telegram token (contains ':'), it's plain text
    if (key.includes(":")) return key;

    // If it's a numeric Chat ID (could be negative), it's plain text
    if (/^-?\d+$/.test(key)) return key;

    // Otherwise, treat as obfuscated, fallback to original if it fails
    const deobfuscated = deobfuscate(key);
    return deobfuscated || key;
};
