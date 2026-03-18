# MongoDB Relational Migrator (MRM) Migration Guide

## Overview
MongoDB Relational Migrator (MRM) is a GUI-based tool. These steps outline how to perform the migration for the three thesis databases.

## Steps for Each Database (blog_db, ecommerce_db, erp_db)

1. **New Project**:
   - Open MongoDB Relational Migrator.
   - Create a new project named accordingly (e.g., `Thesis_Blog_Migration`).

2. **Connect to Source**:
   - Choose **MySQL** as the source.
   - Connection String: `mysql://root:rootpassword@localhost:3306/blog_db`
   - Select the relevant schema.

3. **Define Mapping**:
   - Review the inferred schema.
   - For **blog_db**: Map `posts` and `comments` as separate collections or embed `comments` into `posts`.
   - For **ecommerce_db**: Map `orders` and `order_items` (consider embedding items into orders).
   - For **erp_db**: Handle self-referencing `employees` table carefully.

4. **Connect to Target**:
   - Choose **MongoDB** as the target.
   - Connection String: `mongodb://localhost:27017`
   - Target Database: `blog_db_migrated_mrm`

5. **Run Migration**:
   - Select "Snapshot" migration.
   - Start the job and monitor the progress in the "Jobs" tab.

6. **Verify**:
   - Use MongoDB Compass to check the resulting documents.
