import { Router } from 'express';
import { uploadSingle } from '../utils/upload.middleware.js';
import {
  excelToInsert,
  excelToUpdate,
  excelToDelete,
  excelToUpsert,
} from '../services/excelSql.controller.js';

export const router = Router();

// Single file field name: file
router.post('/insert', uploadSingle, excelToInsert);
router.post('/update', uploadSingle, excelToUpdate);
router.post('/delete', uploadSingle, excelToDelete);
router.post('/upsert', uploadSingle, excelToUpsert);


