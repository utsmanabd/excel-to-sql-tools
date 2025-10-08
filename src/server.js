import express from 'express';
import cors from 'cors';
import { router as excelSqlRouter } from './routes/excelSql.routes.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, '../public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/excel-sql', excelSqlRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


