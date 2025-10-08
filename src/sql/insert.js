import { quoteIdentifier, sqlValue, columnsAndValuesFromRow } from './common.js';

export function buildInsertSQL({ rows, table, dbType, batch = true }) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const filteredRows = rows.map((r) => ({ ...r }));
  const firstRow = filteredRows[0];
  const columns = Object.keys(firstRow);
  if (columns.length === 0) return '';

  const qCols = columns.map((c) => quoteIdentifier(c, dbType)).join(', ');
  const qTable = quoteIdentifier(table, dbType);

  if (batch) {
    const valuesList = filteredRows
      .map((row) => `(${columns.map((c) => sqlValue(row[c], dbType)).join(', ')})`)
      .join(',\n');
    return `INSERT INTO ${qTable} (${qCols})\nVALUES\n${valuesList};`;
  }

  return filteredRows
    .map((row) => {
      const vals = columns.map((c) => sqlValue(row[c], dbType)).join(', ');
      return `INSERT INTO ${qTable} (${qCols}) VALUES (${vals});`;
    })
    .join('\n');
}


