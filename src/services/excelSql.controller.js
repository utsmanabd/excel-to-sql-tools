import { parseExcelBufferToJson } from '../utils/xlsx.parser.js';
import { buildInsertSQL } from '../sql/insert.js';
import { buildUpdateSQL } from '../sql/update.js';
import { buildDeleteSQL } from '../sql/delete.js';
import { buildUpsertSQL } from '../sql/upsert.js';
import { z } from 'zod';

const baseSchema = z.object({
  table: z.string().min(1),
  dbType: z.enum(['postgres', 'mysql', 'mssql']).default('postgres'),
  // Coerce boolean because multipart form-data sends strings
  batch: z.coerce.boolean().optional().default(true),
  // If true, respond as downloadable .sql file instead of JSON
  asFile: z.coerce.boolean().optional().default(true),
});

// Accept string (CSV or JSON array string) or array of strings
const stringOrStringArray = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed;
      } catch {
        // fall through to CSV split
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return val;
}, z.array(z.string()).min(1));

export async function excelToInsert(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required (field: file)' });
    const body = baseSchema.parse(req.body);

    const rows = parseExcelBufferToJson(req.file.buffer);
    const sql = buildInsertSQL({
      rows,
      table: body.table,
      dbType: body.dbType,
      batch: body.batch,
    });
    if (body.asFile) {
      const filename = `${body.table}_insert_${Date.now()}.sql`;
      res.set('Content-Type', 'application/sql');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(sql);
    }
    return res.json({ sql });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function excelToUpdate(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required (field: file)' });
    const schema = baseSchema.extend({ whereFields: stringOrStringArray });
    const body = schema.parse(req.body);

    const rows = parseExcelBufferToJson(req.file.buffer);
    const sql = buildUpdateSQL({
      rows,
      table: body.table,
      dbType: body.dbType,
      whereFields: body.whereFields,
      batch: body.batch,
    });
    if (body.asFile) {
      const filename = `${body.table}_update_${Date.now()}.sql`;
      res.set('Content-Type', 'application/sql');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(sql);
    }
    return res.json({ sql });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function excelToDelete(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required (field: file)' });
    const body = baseSchema.parse(req.body);
    const rows = parseExcelBufferToJson(req.file.buffer);
    const sql = buildDeleteSQL({
      rows,
      table: body.table,
      dbType: body.dbType,
      batch: body.batch,
    });
    if (body.asFile) {
      const filename = `${body.table}_delete_${Date.now()}.sql`;
      res.set('Content-Type', 'application/sql');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(sql);
    }
    return res.json({ sql });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function excelToUpsert(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required (field: file)' });
    const schema = baseSchema.extend({ uniqueFields: stringOrStringArray });
    const body = schema.parse(req.body);

    const rows = parseExcelBufferToJson(req.file.buffer);
    const sql = buildUpsertSQL({
      rows,
      table: body.table,
      dbType: body.dbType,
      uniqueFields: body.uniqueFields,
      batch: body.batch,
    });
    if (body.asFile) {
      const filename = `${body.table}_upsert_${Date.now()}.sql`;
      res.set('Content-Type', 'application/sql');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(sql);
    }
    return res.json({ sql });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}


