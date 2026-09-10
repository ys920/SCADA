import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export type HistorianSampleInput = {
  tagId: string;
  tagPath: string;
  tagName: string;
  dataType: string;
  quality: string;
  value: boolean | number | string;
  recordedAt?: string;
};

export async function ingestSamples(samples: HistorianSampleInput[]) {
  const sql = getSql();
  if (!sql) {
    return { ok: false as const, error: "DATABASE_URL not configured" };
  }
  if (samples.length === 0) return { ok: true as const, inserted: 0 };

  // Batch insert in chunks to stay within parameter limits
  const chunkSize = 50;
  let inserted = 0;
  for (let i = 0; i < samples.length; i += chunkSize) {
    const chunk = samples.slice(i, i + chunkSize);
    for (const s of chunk) {
      const valueNum = typeof s.value === "number" ? s.value : null;
      const valueBool = typeof s.value === "boolean" ? s.value : null;
      const valueText = typeof s.value === "string" ? s.value : null;
      await sql`
        INSERT INTO historian_samples
          (tag_id, tag_path, tag_name, value_num, value_bool, value_text, data_type, quality, recorded_at)
        VALUES
          (${s.tagId}, ${s.tagPath}, ${s.tagName}, ${valueNum}, ${valueBool}, ${valueText},
           ${s.dataType}, ${s.quality}, ${s.recordedAt ? new Date(s.recordedAt) : new Date()})
      `;
      inserted += 1;
    }
  }
  return { ok: true as const, inserted };
}

export async function querySamples(opts: {
  tagId?: string;
  limit?: number;
}) {
  const sql = getSql();
  if (!sql) {
    return { ok: false as const, error: "DATABASE_URL not configured", rows: [] };
  }
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 1000);
  if (opts.tagId) {
    const rows = await sql`
      SELECT id, tag_id, tag_path, tag_name, value_num, value_bool, value_text,
             data_type, quality, recorded_at
      FROM historian_samples
      WHERE tag_id = ${opts.tagId}
      ORDER BY recorded_at DESC
      LIMIT ${limit}
    `;
    return { ok: true as const, rows };
  }
  const rows = await sql`
    SELECT id, tag_id, tag_path, tag_name, value_num, value_bool, value_text,
           data_type, quality, recorded_at
    FROM historian_samples
    ORDER BY recorded_at DESC
    LIMIT ${limit}
  `;
  return { ok: true as const, rows };
}

export async function historianStatus() {
  const sql = getSql();
  if (!sql) {
    return {
      ok: false as const,
      configured: false,
      message: "DATABASE_URL not set — historian disabled",
    };
  }
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS count, MAX(recorded_at) AS last_at
      FROM historian_samples
    `;
    return {
      ok: true as const,
      configured: true,
      count: rows[0]?.count ?? 0,
      lastAt: rows[0]?.last_at ?? null,
      message: "Historian connected",
    };
  } catch (err) {
    return {
      ok: false as const,
      configured: true,
      message: err instanceof Error ? err.message : "Historian query failed",
    };
  }
}
