export function getStorageKey(key: string): string {
    if (typeof window === "undefined") return key;
    const user = window.localStorage.getItem("iq_current_user");
    if (!user) return key;
    return `iq_${user}_${key}`;
}
