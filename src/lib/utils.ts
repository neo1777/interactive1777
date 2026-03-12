/**
 * Utility to consistently handle asset paths across the application.
 * Prepends the repository name prefix if when deployed to GitHub Pages.
 */
export function getAssetPath(path: string): string {
    const prefix = "/interactive1777";

    // If the path already has the prefix or is a full URL, return as is
    if (path.startsWith(prefix) || path.startsWith("http") || path.startsWith("data:")) {
        return path;
    }

    // Ensure the path starts with a slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // In development and for Next.js components (Link/Image), the prefix is often handled automatically.
    // This utility is mainly for raw <img> tags or CSS.
    // If it already has the prefix, don't add it again.
    return path.startsWith(prefix) ? path : `${prefix}${cleanPath}`;
}
