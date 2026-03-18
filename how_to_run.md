# How to Run: Thesis Database Migrations

This guide provides the exact commands needed to execute and verify the database migrations within the Docker environment.
follow it to the letter

## 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## 2. Start the Environment
Run this command to start all databases and initialization scripts (Wait ~10 seconds for healthy status).
```bash
docker-compose up -d
```

---

## 3. Execute Migrations

> [!IMPORTANT]
> **Windows Users (Git Bash/Mingw32)**: You MUST prefix all `docker-compose run` commands with `MSYS_NO_PATHCONV=1` to prevent path errors.

### A. pgLoader (MySQL → PostgreSQL)
```bash
# Blog Database
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_blog.conf

# Ecommerce Database
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_ecommerce.conf

# ERP Database
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_erp.conf
```

### B. mongify (MySQL → MongoDB)
```bash
# Blog Database
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_blog.config config/mongify/blog_migration.rb

# Ecommerce Database
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_ecommerce.config config/mongify/ecommerce_migration.rb

# ERP Database
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_erp.config config/mongify/erp_migration.rb
```

---

## 4. Verify Migrated Data

You can inspect the data directly inside the containers using the following commands:

### PostgreSQL Verification
```bash
# View Blog Data
docker exec -it postgres_target psql -U postgres -d blog_db_migrated -c "SELECT * FROM blog_db.posts;"

# View Ecommerce Data
docker exec -it postgres_target psql -U postgres -d ecommerce_db_migrated -c "SELECT * FROM ecommerce_db.products;"
```

### MongoDB Verification
```bash
# View Blog Data
docker exec -it mongodb_target mongosh blog_db_migrated --eval "db.posts.find().pretty()"

# View ERP Data
docker exec -it mongodb_target mongosh erp_db_migrated --eval "db.employees.find().pretty()"
```

---

## 5. Troubleshooting / Full Reset
If you want to start from a completely clean state (e.g., to reset IDs or re-run init scripts):
```bash
docker-compose down -v
docker-compose up -d
```



# 1. Wipe EVERYTHING (including the +1 stale rows)
docker-compose down -v
docker-compose up -d
# 2. Add the mass data to MySQL immediately
python scripts/generate_data.py
# 3. Run all migrations ONCE (use the batch commands below)
# pgLoader
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_blog.conf
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_ecommerce.conf
MSYS_NO_PATHCONV=1 docker-compose run --rm pgloader pgloader /config/pgloader_erp.conf
# mongify
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_blog.config config/mongify/blog_migration.rb
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_ecommerce.config config/mongify/ecommerce_migration.rb
MSYS_NO_PATHCONV=1 docker-compose run --rm mongify process config/mongify/database_erp.config config/mongify/erp_migration.rb
# 4. Final Clean Analysis
python scripts/analyze_migration.py
