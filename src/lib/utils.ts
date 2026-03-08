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

    // In development (local), we don't need the prefix if we are running at root
    // But for consistency with GH Pages build, we should typically have them match
    // Next.js basePath handles this in dev too if configured.
    return `${prefix}${cleanPath}`;
}
