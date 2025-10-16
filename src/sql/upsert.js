import { quoteIdentifier, sqlValue } from './common.js';

export function buildUpsertSQL({ rows, table, dbType, uniqueFields = [] }) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  if (!uniqueFields || uniqueFields.length === 0) throw new Error('uniqueFields is required for upsert');

  const qTable = quoteIdentifier(table, dbType);
  const columns = Object.keys(rows[0]);
  const nonKeyColumns = columns.filter((c) => !uniqueFields.includes(c));

  const insertColumns = columns.map((c) => quoteIdentifier(c, dbType)).join(', ');

  const valuesRows = rows
    .map((row) => `(${columns.map((c) => sqlValue(row[c], dbType)).join(', ')})`)
    .join(',\n');

  if (dbType === 'postgres') {
    const conflictTargets = uniqueFields.map((c) => quoteIdentifier(c, dbType)).join(', ');
    const setClause = nonKeyColumns
      .map((c) => `${quoteIdentifier(c, dbType)} = EXCLUDED.${quoteIdentifier(c, dbType)}`)
      .join(', ');
    return `INSERT INTO ${qTable} (${insertColumns})\nVALUES\n${valuesRows}\nON CONFLICT (${conflictTargets}) DO UPDATE SET ${setClause};`;
  }

  if (dbType === 'mysql') {
    const setClause = nonKeyColumns
      .map((c) => `${quoteIdentifier(c, dbType)} = VALUES(${quoteIdentifier(c, dbType)})`)
      .join(', ');
    return `INSERT INTO ${qTable} (${insertColumns})\nVALUES\n${valuesRows}\nON DUPLICATE KEY UPDATE ${setClause};`;
  }

  if (dbType === 'mssql') {
    // MERGE statement per row for reliability
    const statements = rows.map((row) => {
      const onClause = uniqueFields
        .map((c) => `T.${quoteIdentifier(c, dbType)} = S.${quoteIdentifier(c, dbType)}`)
        .join(' AND ');
      const insertCols = columns.map((c) => quoteIdentifier(c, dbType)).join(', ');
      const insertVals = columns.map((c) => sqlValue(row[c], dbType)).join(', ');
      const setClause = nonKeyColumns
        .map((c) => `T.${quoteIdentifier(c, dbType)} = S.${quoteIdentifier(c, dbType)}`)
        .join(', ');
      const sourceSelect = columns
        .map((c) => `${sqlValue(row[c], dbType)} AS ${quoteIdentifier(c, dbType)}`)
        .join(', ');
      return `MERGE INTO ${qTable} AS T USING (SELECT ${sourceSelect}) AS S ON (${onClause})\nWHEN MATCHED THEN UPDATE SET ${setClause}\nWHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals});`;
    });
    return statements.join('\n');
  }

  throw new Error(`Unsupported dbType: ${dbType}`);
}


