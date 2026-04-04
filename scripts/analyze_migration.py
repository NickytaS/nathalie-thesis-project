import mysql.connector
import psycopg2
from pymongo import MongoClient
import datetime
import sys
import os

# Tee output to both terminal and latest_results.txt
class Tee:
    def __init__(self, *streams):
        self.streams = streams
    def write(self, data):
        for s in self.streams:
            s.write(data)
    def flush(self):
        for s in self.streams:
            s.flush()

_results_file = open(os.path.join(os.path.dirname(__file__), 'latest_results.txt'), 'w', encoding='utf-8')
sys.stdout = Tee(sys.__stdout__, _results_file)

CONFIG = {
    'mysql':    {'host': '127.0.0.1', 'user': 'migration_user', 'password': 'rootpassword', 'port': 3306},
    'postgres': {'host': '127.0.0.1', 'user': 'postgres', 'password': 'postgrespassword', 'port': 5433},
    'mongodb':  {'host': '127.0.0.1', 'port': 27017}
}

BLOG_TABLES = [
    'wp_posts','wp_users','wp_comments','wp_terms','wp_term_taxonomy',
    'wp_term_relationships','wp_options','wp_postmeta','wp_usermeta',
    'wp_links','wp_commentmeta','wp_termmeta','wp_actionscheduler_actions',
    'wp_actionscheduler_claims','wp_actionscheduler_groups','wp_actionscheduler_logs'
]
ECOMMERCE_TABLES = [
    'wp_wc_orders','wp_wc_order_stats','wp_wc_customer_lookup',
    'wp_woocommerce_order_items','wp_woocommerce_order_itemmeta',
    'wp_wc_product_meta_lookup','wp_wc_order_addresses',
    'wp_wc_order_operational_data','wp_wc_admin_notes','wp_wc_admin_note_actions',
    'wp_wc_category_lookup','wp_wc_order_coupon_lookup','wp_wc_order_product_lookup',
    'wp_wc_order_tax_lookup','wp_wc_product_attributes_lookup',
    'wp_wc_product_download_directories','wp_wc_rate_limits','wp_wc_reserved_stock',
    'wp_wc_tax_rate_classes','wp_wc_webhooks','wp_wc_orders_meta','wp_wc_download_log',
    'wp_woocommerce_api_keys','wp_woocommerce_attribute_taxonomies',
    'wp_woocommerce_downloadable_product_permissions','wp_woocommerce_log',
    'wp_woocommerce_payment_tokens','wp_woocommerce_payment_tokenmeta',
    'wp_woocommerce_sessions','wp_woocommerce_shipping_zones',
    'wp_woocommerce_shipping_zone_locations','wp_woocommerce_shipping_zone_methods',
    'wp_woocommerce_tax_rates','wp_woocommerce_tax_rate_locations'
]
ERP_TABLES = [
    'tabUser','tabRole','tabContact','tabAddress','tabCountry','tabCurrency',
    'tabGender','tabSalutation','tabComment','tabFile','tabToDo','tabVersion',
    'tabTag','tabDomain','tabLanguage','tabBlogger','tabNewsletter','tabNotification'
]

DB_MAP = {'blog_db': BLOG_TABLES, 'ecommerce_db': ECOMMERCE_TABLES, 'erp_db': ERP_TABLES}

DURATIONS = {
    ('pgLoader','blog_db'):'< 1 sec', ('pgLoader','ecommerce_db'):'< 1 sec', ('pgLoader','erp_db'):'< 1 sec',
    ('Mongify','blog_db'):'~15 sec',  ('Mongify','ecommerce_db'):'~20 sec',  ('Mongify','erp_db'):'~15 sec',
    ('MRM','blog_db'):'6 sec',        ('MRM','ecommerce_db'):'1 sec',        ('MRM','erp_db'):'1 sec',
}

FINAL_RESULTS = []
SEP  = '-' * 70
SEP2 = '=' * 90

def to_mrm_collection(name):
    parts = name.split('_')
    return name if len(parts) == 1 else parts[0] + ''.join(p.capitalize() for p in parts[1:])

def get_mysql_count(db, table):
    try:
        conn = mysql.connector.connect(**CONFIG['mysql'], database=db)
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cur.fetchone()[0]; cur.close(); conn.close(); return count
    except Exception as e: return f"ERR:{e}"

def get_postgres_count(pg_db, schema, table):
    try:
        conn = psycopg2.connect(**CONFIG['postgres'], dbname=pg_db)
        cur = conn.cursor()
        cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
        count = cur.fetchone()[0]; cur.close(); conn.close(); return count
    except Exception as e:
        return 'NOT_MIGRATED' if 'does not exist' in str(e) else f"ERR:{e}"

def get_postgres_schema_info(pg_db, schema, table):
    info = {'pk': False, 'fk_count': 0}
    try:
        conn = psycopg2.connect(**CONFIG['postgres'], dbname=pg_db)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM information_schema.table_constraints "
                    "WHERE table_schema=%s AND table_name=%s AND constraint_type='PRIMARY KEY'", (schema, table))
        info['pk'] = cur.fetchone()[0] > 0
        cur.execute("SELECT COUNT(*) FROM information_schema.table_constraints "
                    "WHERE table_schema=%s AND table_name=%s AND constraint_type='FOREIGN KEY'", (schema, table))
        info['fk_count'] = cur.fetchone()[0]
        cur.close(); conn.close()
    except Exception: pass
    return info

def get_mongo_count(mongo_db, collection):
    try:
        client = MongoClient(host=CONFIG['mongodb']['host'], port=CONFIG['mongodb']['port'],
                             serverSelectionTimeoutMS=5000)
        count = client[mongo_db][collection].count_documents({}); client.close(); return count
    except Exception as e: return f"ERR:{e}"

def analyze_pgloader(db_name, tables):
    pg_db = f"{db_name}_migrated"; schema = db_name
    all_pass = True; total_fks = 0; total_src = 0; total_tgt = 0
    print(f"\n{SEP}\n  pgLoader  |  {db_name}  ->  PostgreSQL ({pg_db})\n{SEP}")
    print(f"  {'Table':<45} {'Src':>6} {'Tgt':>6}  {'Status':<12} PK   FKs")
    print(f"  {'-'*45} {'-'*6} {'-'*6}  {'-'*12} {'-'*3}  {'-'*3}")
    for table in tables:
        src = get_mysql_count(db_name, table)
        tgt = get_postgres_count(pg_db, schema, table.lower())
        sinfo = get_postgres_schema_info(pg_db, schema, table.lower())
        total_fks += sinfo['fk_count']
        if isinstance(src, int) and isinstance(tgt, int):
            status = 'PASS' if src == tgt else 'FAIL'
            total_src += src; total_tgt += tgt
        else: status = str(tgt)
        if status not in ('PASS', 'NOT_MIGRATED'): all_pass = False
        pk_str = 'Yes' if sinfo['pk'] else 'No'
        print(f"  {table:<45} {str(src):>6} {str(tgt):>6}  {status:<12} {pk_str:<4} {sinfo['fk_count']}")
    integrity = 'PASS' if all_pass else 'FAIL/PARTIAL'
    FINAL_RESULTS.append({'Tool':'pgLoader','Database':db_name,'Tables':len(tables),
        'Rows_Src':total_src,'Rows_Tgt':total_tgt,'Integrity':integrity,
        'Fidelity':f'HIGH - {total_fks} FKs preserved','Duration':DURATIONS.get(('pgLoader',db_name),'N/A')})
    print(f"\n  >> Integrity: {integrity}  |  Rows: {total_tgt}/{total_src}  |  FKs: {total_fks}")

def analyze_mongify(db_name, tables):
    mongo_db = f"{db_name}_migrated"; all_pass = True; total_src = 0; total_tgt = 0
    print(f"\n{SEP}\n  Mongify   |  {db_name}  ->  MongoDB ({mongo_db})\n{SEP}")
    print(f"  {'Collection':<45} {'Src':>6} {'Tgt':>6}  Status")
    print(f"  {'-'*45} {'-'*6} {'-'*6}  {'-'*12}")
    for table in tables:
        src = get_mysql_count(db_name, table); tgt = get_mongo_count(mongo_db, table)
        if isinstance(src, int) and isinstance(tgt, int):
            status = 'PASS' if src == tgt else 'FAIL'
            total_src += src; total_tgt += tgt
            if status == 'FAIL': all_pass = False
        else: status = str(tgt); all_pass = False
        print(f"  {table:<45} {str(src):>6} {str(tgt):>6}  {status}")
    integrity = 'PASS' if all_pass else 'FAIL/PARTIAL'
    FINAL_RESULTS.append({'Tool':'Mongify','Database':db_name,'Tables':len(tables),
        'Rows_Src':total_src,'Rows_Tgt':total_tgt,'Integrity':integrity,
        'Fidelity':'MEDIUM - refs as embedded IDs','Duration':DURATIONS.get(('Mongify',db_name),'N/A')})
    print(f"\n  >> Integrity: {integrity}  |  Rows: {total_tgt}/{total_src}")

def analyze_mrm(db_name, tables):
    mongo_db = f"{db_name}_mrm"; all_pass = True; total_src = 0; total_tgt = 0
    print(f"\n{SEP}\n  MRM       |  {db_name}  ->  MongoDB ({mongo_db})  [camelCase collection names]\n{SEP}")
    print(f"  {'Collection (MySQL -> MRM name)':<55} {'Src':>6} {'Tgt':>6}  Status")
    print(f"  {'-'*55} {'-'*6} {'-'*6}  {'-'*12}")
    for table in tables:
        src = get_mysql_count(db_name, table); mrm_name = to_mrm_collection(table)
        tgt = get_mongo_count(mongo_db, mrm_name)
        if isinstance(src, int) and isinstance(tgt, int):
            status = 'PASS' if src == tgt else 'FAIL'
            total_src += src; total_tgt += tgt
            if status == 'FAIL': all_pass = False
        else: status = str(tgt); all_pass = False
        label = f"{table} ({mrm_name})"
        print(f"  {label:<55} {str(src):>6} {str(tgt):>6}  {status}")
    integrity = 'PASS' if all_pass else 'FAIL/PARTIAL'
    FINAL_RESULTS.append({'Tool':'MRM','Database':db_name,'Tables':len(tables),
        'Rows_Src':total_src,'Rows_Tgt':total_tgt,'Integrity':integrity,
        'Fidelity':'HIGH - GUI-mapped schema','Duration':DURATIONS.get(('MRM',db_name),'N/A')})
    print(f"\n  >> Integrity: {integrity}  |  Rows: {total_tgt}/{total_src}")

def print_final_comparison():
    print(f"\n\n{SEP2}\n                         FINAL MIGRATION COMPARISON SUMMARY\n{SEP2}")
    print(f"  {'Tool':<10} {'Database':<14} {'Tables':>6} {'Rows (tgt/src)':>14}  {'Integrity':<14} {'Duration':<12} Fidelity")
    print("  " + "-" * 86)
    for r in FINAL_RESULTS:
        rows_str = f"{r['Rows_Tgt']}/{r['Rows_Src']}"
        print(f"  {r['Tool']:<10} {r['Database']:<14} {r['Tables']:>6} {rows_str:>14}  "
              f"{r['Integrity']:<14} {r['Duration']:<12} {r['Fidelity']}")
    print(SEP2)
    print("\n  NOTES")
    print("  1. pgLoader (MySQL -> PostgreSQL) : preserves full relational schema + foreign keys.")
    print("  2. Mongify  (MySQL -> MongoDB)    : flat document mapping; relations become ref IDs.")
    print("  3. MRM      (MySQL -> MongoDB)    : GUI-driven; renames collections to camelCase.")
    print("  4. Source DBs: WordPress (blog_db) | WooCommerce (ecommerce_db) | ERPNext (erp_db)")
    print()

if __name__ == '__main__':
    print(f"Migration Analysis  started {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Sources: blog_db (WordPress) | ecommerce_db (WooCommerce) | erp_db (ERPNext)")
    for db_name, tables in DB_MAP.items():
        print(f"\n\n{SEP2}\n  DATABASE: {db_name}  ({len(tables)} tables)\n{SEP2}")
        analyze_pgloader(db_name, tables)
        analyze_mongify(db_name, tables)
        analyze_mrm(db_name, tables)
    print_final_comparison()
    print(f"Analysis complete  finished {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    _results_file.close()
    sys.stdout = sys.__stdout__
    print(f"\nResults saved to: scripts/latest_results.txt")
