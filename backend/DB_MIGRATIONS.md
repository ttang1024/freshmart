Database migration: add user settings columns

This repository's models expect the `users` table to have the following columns:

- `email_notifications` BOOLEAN DEFAULT TRUE
- `two_factor_enabled` BOOLEAN DEFAULT FALSE
- `payment_methods` TEXT DEFAULT '[]'

If your database was created before these fields were added, the API may crash when SQLAlchemy tries to SELECT the full `users` row (UndefinedColumn errors). To fix this, apply the SQL below.

Files added:
- `backend/sql/add_user_settings_columns.sql` — SQL statements to alter the `users` table and update existing NULLs.
- `backend/scripts/apply_migration.py` — Python helper that runs the SQL using `DATABASE_URL` env var (uses psycopg2).

How to run (recommended):
1) Backup your DB first. Example using pg_dump:

```bash
pg_dump "$DATABASE_URL" -f dump_before_migration.sql
```

2) Run the SQL with psql (recommended):

```bash
# If DATABASE_URL is set as: postgres://user:pass@host:5432/dbname
psql "$DATABASE_URL" -f backend/sql/add_user_settings_columns.sql
```

Or use the included Python helper (requires psycopg2):

```bash
# install dependency if needed
pip install psycopg2-binary
# run the helper (assumes DATABASE_URL env var set)
python backend/scripts/apply_migration.py backend/sql/add_user_settings_columns.sql
```

Notes:
- The SQL uses `ADD COLUMN IF NOT EXISTS` so it is safe to run multiple times.
- The script will also set sane defaults for existing rows.
- For production use, prefer an Alembic migration so you can track schema versions. I can generate a simple Alembic migration file if you'd like.

Rollback:
- These ALTERs are additive; to remove the columns you can run DROP COLUMN statements, but **do not** drop them without checking for dependent code/data.

If you want, I can:
- Create an Alembic migration and configure Alembic in this repo,
- Or run the script here (if you give permission and the environment has DB access).
