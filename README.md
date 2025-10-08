# Helper Script API

Simple Express API to convert Excel files into SQL scripts (insert/update/delete/upsert).

## Run

```bash
npm install
npm run dev
```

## Endpoints

Base path: `/api/excel-sql`

- `POST /insert`
- `POST /update`
- `POST /delete`
- `POST /upsert`

Multipart form-data fields:
- `file`: Excel file (.xlsx/.xls)
- Common body fields: `table` (string), `dbType` (postgres|mysql|mssql), `batch` (boolean, optional)
 - `asFile` (boolean, optional, default: true) → jika true, response berupa file `.sql` (content-type: application/sql). Kalau false, response JSON `{ sql }`.

Additional fields:
- Update: `whereFields` as array of strings
- Upsert: `uniqueFields` as array of strings

## Example (curl)

```bash
curl -X POST http://localhost:3000/api/excel-sql/insert \
  -F "file=@./examples/data.xlsx" \
  -F "table=my_table" \
  -F "dbType=postgres" \
  -F "batch=true" \
  -F "asFile=false"   # set false untuk dapatkan JSON
```

