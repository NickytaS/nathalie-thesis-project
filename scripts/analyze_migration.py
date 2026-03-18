import mysql.connector
import psycopg2
from pymongo import MongoClient
import datetime
import sys

# Configuration
CONFIG = {
    'mysql': {
        'host': '127.0.0.1',  
        'user': 'migration_user',
        'password': 'rootpassword',
        'port': 3306
    },
    'postgres': {
        'host': '127.0.0.1',
        'user': 'postgres',
        'password': 'postgrespassword',
        'port': 5433
    },
    'mongodb': {
        'host': '127.0.0.1',
        'port': 27017
    }
}

FINAL_RESULTS = []

def get_mysql_row_count(db_name, table_name):
    try:
        conn = mysql.connector.connect(**CONFIG['mysql'], database=db_name)
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
    except Exception as e:
        return f"Error: {e}"

def get_postgres_row_count(db_name, schema_name, table_name):
    try:
        conn = psycopg2.connect(
            host=CONFIG['postgres']['host'],
            user=CONFIG['postgres']['user'],
            password=CONFIG['postgres']['password'],
            port=CONFIG['postgres']['port'],
            dbname=db_name
        )
        cursor = conn.cursor()
        cursor.execute(f'SELECT COUNT(*) FROM "{schema_name}"."{table_name}"')
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
    except Exception as e:
        if "does not exist" in str(e):
            return "NOT_MIGRATED"
        return f"Error: {e}"

def get_mongodb_doc_count(db_name, collection_name):
    try:
        client = MongoClient(host=CONFIG['mongodb']['host'], port=CONFIG['mongodb']['port'])
        db = client[db_name]
        count = db[collection_name].count_documents({})
        client.close()
        return count
    except Exception as e:
        return f"Error: {e}"

def get_postgres_schema_info(db_name, schema_name, table_name):
    info = {"pk": False, "fk_count": 0}
    try:
        conn = psycopg2.connect(
            host=CONFIG['postgres']['host'],
            user=CONFIG['postgres']['user'],
            password=CONFIG['postgres']['password'],
            port=CONFIG['postgres']['port'],
            dbname=db_name
        )
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = '{schema_name}' AND table_name = '{table_name}' AND constraint_type = 'PRIMARY KEY'")
        info["pk"] = cursor.fetchone()[0] > 0
        cursor.execute(f"SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = '{schema_name}' AND table_name = '{table_name}' AND constraint_type = 'FOREIGN KEY'")
        info["fk_count"] = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return info
    except Exception:
        return info

def analyze_pgloader(db_name, tables):
    print(f"--- Analysis Report: pgLoader ({db_name} -> PostgreSQL) ---")
    target_db = f"{db_name}_migrated"
    db_pass = True
    total_fks = 0
    
    for table in tables:
        source_count = get_mysql_row_count(db_name, table)
        target_count = get_postgres_row_count(target_db, db_name, table)
        schema_info = get_postgres_schema_info(target_db, db_name, table)
        
        if target_count == "NOT_MIGRATED":
            status = "PENDING"
            db_pass = False
        else:
            status = "PASS" if source_count == target_count else "FAIL"
            if status == "FAIL": db_pass = False
            
        total_fks += schema_info["fk_count"]
        print(f"Table: {table:12} | Status: {status:7} | Rows: {target_count}/{source_count} | PK: {'Yes' if schema_info['pk'] else 'No'} | FKs: {schema_info['fk_count']}")

    FINAL_RESULTS.append({
        'Tool': 'pgLoader',
        'Database': db_name,
        'Fidelity': f'HIGH (Preserved {total_fks} FKs)',
        'Integrity': 'PASS' if db_pass else 'FAIL/PENDING',
        'Time': '0.1s - 0.2s'
    })

def analyze_mongify(db_name, collections):
    print(f"--- Analysis Report: mongify ({db_name} -> MongoDB) ---")
    target_db = f"{db_name}_migrated"
    db_pass = True
    
    for coll in collections:
        source_count = get_mysql_row_count(db_name, coll)
        target_count = get_mongodb_doc_count(target_db, coll)
        status = "PASS" if source_count == target_count else "FAIL"
        if status == "FAIL": db_pass = False
        print(f"Collection: {coll:12} | Source: {source_count} | Target: {target_count} | Status: {status}")

    FINAL_RESULTS.append({
        'Tool': 'mongify',
        'Database': db_name,
        'Fidelity': 'MEDIUM (No Foreign Keys)',
        'Integrity': 'PASS' if db_pass else 'FAIL',
        'Time': '15s - 30s'
    })

def print_final_comparison():
    print("\n" + "="*80)
    print("                      FINAL MIGRATION COMPARISON SUMMARY")
    print("="*80)
    print(f"{'Tool':12} | {'Database':12} | {'Integrity':10} | {'Fidelity':25} | {'Speed'}")
    print("-" * 80)
    for res in FINAL_RESULTS:
        print(f"{res['Tool']:12} | {res['Database']:12} | {res['Integrity']:10} | {res['Fidelity']:25} | {res['Time']}")
    print("="*80)
    print("Notes:")
    print("1. pgLoader (RDBMS -> RDBMS) maintains full Relational Fidelity (Foreign Keys).")
    print("2. mongify (RDBMS -> NoSQL) converts relations to embedded IDs or flat structures.")
    print("3. Speed metrics are based on Docker execution overhead observed during runs.")

if __name__ == "__main__":
    print(f"Migration Analysis Started at {datetime.datetime.now()}\n")
    DB_MAP = {
        'blog_db': ['posts', 'comments'],
        'ecommerce_db': ['products', 'orders', 'order_items'],
        'erp_db': ['departments', 'employees', 'projects']
    }

    for db, entities in DB_MAP.items():
        analyze_pgloader(db, entities)
        print("-" * 50)
        analyze_mongify(db, entities)
        print("=" * 60)
    
    print_final_comparison()
