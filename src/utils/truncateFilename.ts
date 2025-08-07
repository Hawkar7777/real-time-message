export function truncateFilename(filename: string, maxLength = 20): string {
  if (filename.length <= maxLength) return filename;
  return filename.slice(0, maxLength) + "...";
}
