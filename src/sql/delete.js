import { quoteIdentifier, sqlValue } from './common.js';

export function buildDeleteSQL({ rows, table, dbType, batch = true }) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const qTable = quoteIdentifier(table, dbType);

  // Build WHERE from all columns in the row
  const buildWhere = (row) =>
    Object.entries(row)
      .map(([k, v]) => `${quoteIdentifier(k, dbType)} = ${sqlValue(v, dbType)}`)
      .join(' AND ');

  const statements = rows.map((row) => `DELETE FROM ${qTable} WHERE ${buildWhere(row)};`);
  return batch ? statements.join('\n') : statements.join('\n');
}


