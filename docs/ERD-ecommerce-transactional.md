# ecommerce_db — Transactional order flow and relational decomposition ERD

Subset of the WooCommerce (HPOS-style) schema focused on **orders**, **line items**, **customer**, **product linkage**, **tax**, and **shipping zones**. Excludes analytics (`wp_wc_order_stats`), coupons-only lookups, admin notes, downloads, payment tokens, sessions, webhooks, and logging (see [ERD.md](./ERD.md) for the full `ecommerce_db` diagram).

View in VS Code (Markdown Preview Mermaid Support extension) or paste the block into https://mermaid.live

---

## Transactional tables and key relationships

_Logical relationships as in WooCommerce; MySQL may not declare every `FOREIGN KEY`. `wp_woocommerce_order_itemmeta` and `wp_wc_orders_meta` retain key–value rows alongside normalized order tables._

```mermaid
erDiagram
    wp_wc_orders {
        bigint id PK
        varchar status
        varchar currency
        decimal total_amount
        bigint customer_id
        bigint parent_order_id
        varchar billing_email
        datetime date_created_gmt
    }
    wp_wc_customer_lookup {
        bigint customer_id PK
        bigint user_id
        varchar email
        varchar first_name
        varchar last_name
    }
    wp_woocommerce_order_items {
        bigint order_item_id PK
        bigint order_id
        varchar order_item_type
        text order_item_name
    }
    wp_woocommerce_order_itemmeta {
        bigint meta_id PK
        bigint order_item_id
        varchar meta_key
        text meta_value
    }
    wp_wc_order_addresses {
        bigint id PK
        bigint order_id
        varchar address_type
        text address_1
        text city
        text postcode
        text country
    }
    wp_wc_order_operational_data {
        bigint id PK
        bigint order_id
        datetime date_paid_gmt
        decimal shipping_total_amount
        decimal discount_total_amount
    }
    wp_wc_orders_meta {
        bigint id PK
        bigint order_id
        varchar meta_key
        text meta_value
    }
    wp_wc_order_product_lookup {
        bigint order_item_id PK
        bigint order_id
        bigint product_id
        bigint variation_id
        int product_qty
    }
    wp_wc_product_meta_lookup {
        bigint product_id PK
        varchar sku
        varchar stock_status
        varchar tax_class
    }
    wp_wc_order_tax_lookup {
        bigint order_id
        bigint tax_rate_id
        float order_tax
        float total_tax
    }
    wp_woocommerce_tax_rates {
        bigint tax_rate_id PK
        varchar tax_rate_country
        varchar tax_rate
        varchar tax_rate_class
    }
    wp_woocommerce_tax_rate_locations {
        bigint location_id PK
        bigint tax_rate_id
        varchar location_code
    }
    wp_wc_tax_rate_classes {
        bigint tax_rate_class_id PK
        varchar slug
    }
    wp_woocommerce_shipping_zones {
        bigint zone_id PK
        varchar zone_name
    }
    wp_woocommerce_shipping_zone_locations {
        bigint location_id PK
        bigint zone_id
        varchar location_code
    }
    wp_woocommerce_shipping_zone_methods {
        bigint instance_id PK
        bigint zone_id
        varchar method_id
    }

    wp_wc_customer_lookup ||--o{ wp_wc_orders : "customer_id"
    wp_wc_orders ||--o{ wp_wc_orders : "parent_order_id"
    wp_wc_orders ||--o{ wp_woocommerce_order_items : "order_id"
    wp_woocommerce_order_items ||--o{ wp_woocommerce_order_itemmeta : "order_item_id"
    wp_wc_orders ||--o{ wp_wc_order_addresses : "order_id"
    wp_wc_orders ||--o{ wp_wc_order_operational_data : "order_id"
    wp_wc_orders ||--o{ wp_wc_orders_meta : "order_id"
    wp_wc_orders ||--o{ wp_wc_order_product_lookup : "order_id"
    wp_woocommerce_order_items ||--o{ wp_wc_order_product_lookup : "order_item_id"
    wp_wc_product_meta_lookup ||--o{ wp_wc_order_product_lookup : "product_id"
    wp_wc_orders ||--o{ wp_wc_order_tax_lookup : "order_id"
    wp_woocommerce_tax_rates ||--o{ wp_wc_order_tax_lookup : "tax_rate_id"
    wp_wc_tax_rate_classes ||--o{ wp_woocommerce_tax_rates : "slug to tax_rate_class"
    wp_woocommerce_tax_rates ||--o{ wp_woocommerce_tax_rate_locations : "tax_rate_id"
    wp_woocommerce_shipping_zones ||--o{ wp_woocommerce_shipping_zone_locations : "zone_id"
    wp_woocommerce_shipping_zones ||--o{ wp_woocommerce_shipping_zone_methods : "zone_id"
```
