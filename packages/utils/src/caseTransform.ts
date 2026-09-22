/**
 * Postgres/PostgREST return rows with snake_case column names; every shared
 * type in @wayfare/types is camelCase. Every query function that casts a
 * Supabase response to one of those types MUST pass it through this first —
 * otherwise multi-word fields (due_date, progress_override, category_id, ...)
 * silently come back `undefined` instead of throwing, which is how this bug
 * hid for a while (single-word fields like `title`/`status` happen to match
 * either way, so partial testing doesn't catch it).
 *
 * Shallow only, and deliberately so: a row's own columns get remapped, but a
 * jsonb column's contents (rich-text `content`, `frequency`, `recurrence_rule`)
 * are opaque application data, not database columns, and must pass through
 * unchanged.
 */
export function snakeToCamel<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

export function snakeToCamelArray<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => snakeToCamel<T>(row));
}
