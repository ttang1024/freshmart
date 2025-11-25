#!/usr/bin/env python3
"""
Simple helper to apply SQL migration file to the database using DATABASE_URL env var.
Usage:
  python backend/scripts/apply_migration.py ../sql/add_user_settings_columns.sql

This script uses psycopg2 if available. If psycopg2 isn't installed it prints the psql command to run manually.
Make sure to BACKUP your database before running migrations in production.
"""
import os
import sys
from pathlib import Path

SQL_FILE = sys.argv[1] if len(sys.argv) > 1 else "../sql/add_user_settings_columns.sql"
SQL_PATH = Path(SQL_FILE)
if not SQL_PATH.exists():
    print(f"SQL file not found: {SQL_PATH.resolve()}")
    sys.exit(1)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print(
        "Please set the DATABASE_URL environment variable (e.g. postgresql://user:pass@host:5432/dbname)"
    )
    print("Or run the SQL using psql:")
    print(f"  psql <{SQL_PATH}")
    sys.exit(1)

# Try to use psycopg2
try:
    import psycopg2
    from psycopg2 import sql
except Exception:
    print(
        "psycopg2 not installed. You can install it with: pip install psycopg2-binary"
    )
    print("Or run the SQL directly using psql:")
    print(f'  psql "{DATABASE_URL}" -f {SQL_PATH}')
    sys.exit(0)

print(f"Applying SQL file {SQL_PATH} to database from DATABASE_URL")
with open(SQL_PATH, "r") as fh:
    sql_text = fh.read()

# psycopg2 expects a connection string in a certain format; pass it directly
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
try:
    with conn.cursor() as cur:
        cur.execute(sql_text)
        print("Migration applied successfully.")
except Exception as e:
    print("Migration failed:", e)
    raise
finally:
    conn.close()
