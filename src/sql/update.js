import { quoteIdentifier, sqlValue } from './common.js';

export function buildUpdateSQL({ rows, table, dbType, whereFields = [], batch = true }) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  if (!whereFields || whereFields.length === 0) throw new Error('whereFields is required for update');

  const qTable = quoteIdentifier(table, dbType);

  const buildSetClause = (row) => {
    const entries = Object.entries(row).filter(([k]) => !whereFields.includes(k));
    if (entries.length === 0) throw new Error('No columns to update after excluding whereFields');
    return entries.map(([k, v]) => `${quoteIdentifier(k, dbType)} = ${sqlValue(v, dbType)}`).join(', ');
  };

  const buildWhereClause = (row) => {
    return whereFields
      .map((k) => `${quoteIdentifier(k, dbType)} = ${sqlValue(row[k], dbType)}`)
      .join(' AND ');
  };

  const statements = rows.map((row) => `UPDATE ${qTable} SET ${buildSetClause(row)} WHERE ${buildWhereClause(row)};`);
  return batch ? statements.join('\n') : statements.join('\n');
}


