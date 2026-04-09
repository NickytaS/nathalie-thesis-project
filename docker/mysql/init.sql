-- =============================================================
-- INIT.SQL — User setup only
-- Real data is loaded from: blog_db.sql, ecommerce_db.sql, erp_db.sql
-- =============================================================

CREATE USER IF NOT EXISTS 'migration_user'@'%' IDENTIFIED BY 'rootpassword';
GRANT ALL PRIVILEGES ON *.* TO 'migration_user'@'%';
FLUSH PRIVILEGES;
