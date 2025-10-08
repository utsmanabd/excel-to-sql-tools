const identifierQuoteByDb = {
  postgres: '"',
  mysql: '`',
  mssql: '"',
};

export function quoteIdentifier(name, dbType) {
  const q = identifierQuoteByDb[dbType] || '"';
  return `${q}${String(name).replaceAll(q, q + q)}${q}`;
}

export function sqlValue(v, dbType) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  // Date detection: if looks like date string or Date instance
  const isDate = v instanceof Date;
  const s = isDate ? v.toISOString() : String(v);
  const escaped = s.replaceAll("'", "''");
  return `'${escaped}'`;
}

export function columnsAndValuesFromRow(row) {
  const columns = Object.keys(row);
  const values = columns.map((c) => row[c]);
  return { columns, values };
}


