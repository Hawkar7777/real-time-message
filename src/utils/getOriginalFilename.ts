export function getOriginalFilename(filename: string): string {
  // Supported extensions you expect (adjust as needed)
  const exts = [".pdf", ".webm", ".png", ".jpg", ".jpeg", ".gif"];

  for (const ext of exts) {
    const idx = filename.toLowerCase().indexOf(ext);
    if (idx !== -1) {
      // Return substring up to end of extension
      return filename.slice(0, idx + ext.length);
    }
  }

  // If no known extension found, return original filename
  return filename;
}
