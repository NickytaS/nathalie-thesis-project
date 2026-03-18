import mysql.connector
import random
import string
import datetime

# Configuration
CONFIG = {
    'host': '127.0.0.1',
    'user': 'migration_user',
    'password': 'rootpassword',
    'port': 3306
}

def get_random_string(length=10):
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

def generate_blog_data(cursor, num_posts=1000):
    print(f"Generating {num_posts} posts and comments for blog_db...")
    cursor.execute("USE blog_db")
    
    # Batch insert posts
    post_data = []
    for i in range(num_posts):
        post_data.append((f"Post Title {i}", f"This is the content for post {i}. " + get_random_string(50)))
    
    cursor.executemany("INSERT INTO posts (title, content) VALUES (%s, %s)", post_data)
    
    # Get post IDs
    cursor.execute("SELECT id FROM posts")
    post_ids = [row[0] for row in cursor.fetchall()]
    
    # Batch insert comments
    comment_data = []
    for pid in post_ids:
        for _ in range(random.randint(1, 3)):
            comment_data.append((pid, f"Author {get_random_string(5)}", f"Comment on post {pid}: " + get_random_string(30)))
    
    cursor.executemany("INSERT INTO comments (post_id, author, content) VALUES (%s, %s, %s)", comment_data)

def generate_ecommerce_data(cursor, num_products=500, num_orders=1000):
    print(f"Generating {num_products} products and {num_orders} orders for ecommerce_db...")
    cursor.execute("USE ecommerce_db")
    
    # Products
    product_data = [(f"Product {i}", random.uniform(10.0, 1000.0)) for i in range(num_products)]
    cursor.executemany("INSERT INTO products (name, price) VALUES (%s, %s)", product_data)
    
    # Get product IDs
    cursor.execute("SELECT id FROM products")
    product_ids = [row[0] for row in cursor.fetchall()]
    
    # Orders
    order_data = [(f"Customer {get_random_string(5)}", 0.0) for i in range(num_orders)]
    cursor.executemany("INSERT INTO orders (customer_name, total) VALUES (%s, %s)", order_data)
    
    # Get order IDs
    cursor.execute("SELECT id FROM orders")
    order_ids = [row[0] for row in cursor.fetchall()]
    
    # Order Items and recalculate totals
    item_data = []
    order_totals = {oid: 0.0 for oid in order_ids}
    
    for oid in order_ids:
        for _ in range(random.randint(1, 5)):
            pid = random.choice(product_ids)
            qty = random.randint(1, 3)
            item_data.append((oid, pid, qty))
    
    cursor.executemany("INSERT INTO order_items (order_id, product_id, quantity) VALUES (%s, %s, %s)", item_data)

def generate_erp_data(cursor, num_depts=50, num_employees=1000):
    print(f"Generating {num_depts} departments and {num_employees} employees for erp_db...")
    cursor.execute("USE erp_db")
    
    # Departments
    dept_data = [(f"Department {get_random_string(8)}",) for i in range(num_depts)]
    cursor.executemany("INSERT INTO departments (name) VALUES (%s)", dept_data)
    
    # Employees (simplifying hierarchy for mass data)
    emp_data = [(f"Employee {i}", None) for i in range(num_employees)]
    cursor.executemany("INSERT INTO employees (name, manager_id) VALUES (%s, %s)", emp_data)
    
    # Projects
    cursor.execute("SELECT id FROM departments")
    dept_ids = [row[0] for row in cursor.fetchall()]
    project_data = [(f"Project {get_random_string(10)}", random.choice(dept_ids)) for i in range(500)]
    cursor.executemany("INSERT INTO projects (name, department_id) VALUES (%s, %s)", project_data)

if __name__ == "__main__":
    try:
        conn = mysql.connector.connect(**CONFIG)
        cursor = conn.cursor()
        
        # Start generation
        start_time = datetime.datetime.now()
        print(f"Data Generation Started at {start_time}")
        
        generate_blog_data(cursor, 2000)
        generate_ecommerce_data(cursor, 1000, 2000)
        generate_erp_data(cursor, 100, 2000)
        
        conn.commit()
        
        end_time = datetime.datetime.now()
        print(f"Successfully completed in {end_time - start_time}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
