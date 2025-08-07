export function localDate() {
  const created_at = new Date().toISOString();
  const utcDate = new Date(created_at);
  const localDateStr = utcDate.toLocaleString();
  return localDateStr;
}
