-- ============================================================
-- LIBRARY DB - New database for MRM (MongoDB Relational Migrator) migration
-- Thesis project: Nathalie
-- ============================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(100),
    birth_year INT
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_id INT,
    genre VARCHAR(100),
    published_year INT,
    isbn VARCHAR(20) UNIQUE,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table (many-to-many: members borrow books)
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    book_id INT,
    loan_date DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Sample data
INSERT INTO authors (name, nationality, birth_year) VALUES
    ('George Orwell', 'British', 1903),
    ('Toni Morrison', 'American', 1931),
    ('Haruki Murakami', 'Japanese', 1949);

INSERT INTO books (title, author_id, genre, published_year, isbn) VALUES
    ('1984', 1, 'Dystopian', 1949, '978-0451524935'),
    ('Animal Farm', 1, 'Satire', 1945, '978-0451526342'),
    ('Beloved', 2, 'Historical Fiction', 1987, '978-1400033416'),
    ('Norwegian Wood', 3, 'Romance', 1987, '978-0375704024'),
    ('Kafka on the Shore', 3, 'Magical Realism', 2002, '978-1400079278');

INSERT INTO members (name, email) VALUES
    ('Alice Martin', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Clara Jones', 'clara@example.com');

INSERT INTO loans (member_id, book_id, loan_date, return_date) VALUES
    (1, 1, '2026-01-10', '2026-01-20'),
    (1, 3, '2026-01-25', NULL),
    (2, 2, '2026-02-01', '2026-02-10'),
    (3, 4, '2026-02-15', NULL),
    (3, 5, '2026-02-20', NULL);
