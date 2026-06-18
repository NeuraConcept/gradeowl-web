/**
 * Convert a backend `image_path`/`image_url` into a URL the browser can load.
 *
 * In production object storage, the backend returns a signed `https://...` URL — pass it through.
 * In dev (no object storage), the backend returns the absolute filesystem path of the file
 * (e.g. `/Users/.../backend/data/uploads/exams/3/qp/file.jpeg` or
 * `/Users/.../backend/data/processed/foo_annotated.jpeg`).
 *
 * The static-file routes at the backend serve files via:
 *   - `/static/uploads/{relative_path}`   (relative to `<backend>/data/uploads/`)
 *   - `/static/processed/{relative_path}` (relative to `<backend>/data/processed/`)
 *
 * Extract the appropriate suffix and route through the auth-attaching Next.js proxy.
 */
export function imagePathToProxyUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const processedMarker = "data/processed/";
  const processedIdx = imagePath.indexOf(processedMarker);
  if (processedIdx >= 0) {
    const relative = imagePath.slice(processedIdx + processedMarker.length);
    return `/api/proxy/static/processed/${relative}`;
  }

  const uploadsMarker = "data/uploads/";
  const uploadsIdx = imagePath.indexOf(uploadsMarker);
  const relative =
    uploadsIdx >= 0
      ? imagePath.slice(uploadsIdx + uploadsMarker.length)
      : imagePath.replace(/^\/+/, "");
  return `/api/proxy/static/uploads/${relative}`;
}

/**
 * Given an original page image URL/path, derive the URL of its annotated overlay.
 *
 * Backend convention (`FileService.get_processed_path`):
 *   `<UPLOAD_DIR>/exams/.../foo.jpeg` → `<PROCESSED_DIR>/foo_annotated.jpeg`
 *
 * In production object storage, the original is a signed URL pointing at the object.
 * We can't predict the annotated object path from a signed URL alone, so this
 * helper only produces a useful result for dev/local-filesystem paths.
 * Returns `null` when it can't safely derive the annotated path (e.g. signed URL).
 */
export function deriveAnnotatedUrl(originalImagePath: string | null | undefined): string | null {
  if (!originalImagePath) return null;
  // Signed object URLs aren't predictable — caller should use the explicit annotated endpoint.
  if (/^https?:\/\//i.test(originalImagePath)) return null;

  // Extract the basename and extension from the original path.
  const lastSlash = originalImagePath.lastIndexOf("/");
  const filename = lastSlash >= 0 ? originalImagePath.slice(lastSlash + 1) : originalImagePath;
  const dotIdx = filename.lastIndexOf(".");
  if (dotIdx <= 0) return null;
  const base = filename.slice(0, dotIdx);
  const ext = filename.slice(dotIdx);
  return `/api/proxy/static/processed/${base}_annotated${ext}`;
}
