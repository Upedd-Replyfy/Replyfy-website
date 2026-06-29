/**
 * Generate URL-safe slug from display name (categories, expert types).
 */
export function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
