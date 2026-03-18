-- Global fix for pgloader authentication compatibility
CREATE USER IF NOT EXISTS 'migration_user'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
GRANT ALL PRIVILEGES ON *.* TO 'migration_user'@'%';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
FLUSH PRIVILEGES;

-- BLOG DB
CREATE DATABASE IF NOT EXISTS blog_db;
USE blog_db;
CREATE TABLE IF NOT EXISTS posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, post_id INT, author VARCHAR(100), content TEXT, FOREIGN KEY (post_id) REFERENCES posts(id));
INSERT INTO posts (title, content) VALUES ('Thesis Start', 'Beginning my research on migrations.');
INSERT INTO comments (post_id, author, content) VALUES (1, 'Nathalie', 'Excited to see the results!');

-- ECOMMERCE DB
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;
CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2));
CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, customer_name VARCHAR(255), total DECIMAL(10,2));
CREATE TABLE IF NOT EXISTS order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, product_id INT, quantity INT, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));
INSERT INTO products (name, price) VALUES ('Laptop', 999.99), ('Mouse', 25.00);
INSERT INTO orders (customer_name, total) VALUES ('John Doe', 1024.99);
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 1, 1), (1, 2, 1);

-- ERP DB
CREATE DATABASE IF NOT EXISTS erp_db;
USE erp_db;
CREATE TABLE IF NOT EXISTS departments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));
CREATE TABLE IF NOT EXISTS employees (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), manager_id INT, FOREIGN KEY (manager_id) REFERENCES employees(id));
CREATE TABLE IF NOT EXISTS projects (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), department_id INT, FOREIGN KEY (department_id) REFERENCES departments(id));
INSERT INTO departments (name) VALUES ('Engineering'), ('HR');
INSERT INTO employees (name, manager_id) VALUES ('Alice', NULL), ('Bob', 1);
INSERT INTO projects (name, department_id) VALUES ('Migration Project', 1);
