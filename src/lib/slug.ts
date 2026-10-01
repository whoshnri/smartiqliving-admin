/**
 * Mirrors `slugify` in `api/lib/blog.ts`. The API is still the authority — it
 * re-derives and validates — but generating a sensible slug here saves typing.
 */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** Converts an ISO timestamp into a `datetime-local` input value. */
export function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Converts a `datetime-local` value back into an ISO timestamp. */
export function fromDateTimeLocal(value: string) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
