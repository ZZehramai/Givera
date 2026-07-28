const localBackendHosts = new Set(["127.0.0.1", "localhost"]);

export function mediaUrl(value, fallback) {
  if (!value) return fallback;

  if (!value.startsWith("http")) {
    return value.startsWith("/") ? value : `/${value}`;
  }

  try {
    const url = new URL(value);
    if (localBackendHosts.has(url.hostname)) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return fallback;
  }

  return value;
}
