# Database ERDs

Generated from live MySQL source databases.

View in VS Code (Markdown Preview Mermaid Support extension) or paste any block into https://mermaid.live

---

## WordPress Core (blog_db)

_WordPress — posts, users, comments, terms, metadata and action scheduler_  
_16 entities · 15 relationships_

```mermaid
erDiagram
    wp_posts {
        bigint ID PK
        bigint post_author
        datetime post_date
        datetime post_date_gmt
        text post_content
        text post_title
        text post_excerpt
        varchar post_status
        varchar comment_status
        varchar ping_status
        varchar post_password
        varchar post_name
        text to_ping
        text pinged
        datetime post_modified
        datetime post_modified_gmt
        text post_content_filtered
        bigint post_parent
        varchar guid
        int menu_order
        varchar post_type
        varchar post_mime_type
        bigint comment_count
    }
    wp_users {
        bigint ID PK
        varchar user_login
        varchar user_pass
        varchar user_nicename
        varchar user_email
        varchar user_url
        datetime user_registered
        varchar user_activation_key
        int user_status
        varchar display_name
    }
    wp_comments {
        bigint comment_ID PK
        bigint comment_post_ID FK
        varchar comment_author
        varchar comment_author_email
        varchar comment_author_url
        varchar comment_author_IP
        datetime comment_date
        datetime comment_date_gmt
        text comment_content
        int comment_karma
        varchar comment_approved
        varchar comment_agent
        varchar comment_type
        bigint comment_parent FK
        bigint user_id FK
    }
    wp_postmeta {
        bigint meta_id PK
        bigint post_id FK
        varchar meta_key
        text meta_value
    }
    wp_usermeta {
        bigint umeta_id PK
        bigint user_id FK
        varchar meta_key
        text meta_value
    }
    wp_commentmeta {
        bigint meta_id PK
        bigint comment_id FK
        varchar meta_key
        text meta_value
    }
    wp_terms {
        bigint term_id PK
        varchar name
        varchar slug
        bigint term_group
    }
    wp_term_taxonomy {
        bigint term_taxonomy_id PK
        bigint term_id FK
        varchar taxonomy
        text description
        bigint parent
        bigint count
    }
    wp_term_relationships {
        bigint object_id PK
        bigint term_taxonomy_id PK
        int term_order
    }
    wp_termmeta {
        bigint meta_id PK
        bigint term_id FK
        varchar meta_key
        text meta_value
    }
    wp_links {
        bigint link_id PK
        varchar link_url
        varchar link_name
        varchar link_image
        varchar link_target
        varchar link_description
        varchar link_visible
        bigint link_owner
        int link_rating
        datetime link_updated
        varchar link_rel
        text link_notes
        varchar link_rss
    }
    wp_actionscheduler_actions {
        bigint action_id PK
        varchar hook
        varchar status
        datetime scheduled_date_gmt
        datetime scheduled_date_local
        int priority
        varchar args
        text schedule
        bigint group_id FK
        int attempts
        datetime last_attempt_gmt
        datetime last_attempt_local
        bigint claim_id
        varchar extended_args
    }
    wp_actionscheduler_claims {
        bigint claim_id PK
        datetime date_created_gmt
    }
    wp_actionscheduler_groups {
        bigint group_id PK
        varchar slug
    }
    wp_actionscheduler_logs {
        bigint log_id PK
        bigint action_id FK
        text message
        datetime log_date_gmt
        datetime log_date_local
    }
    wp_options {
        bigint option_id PK
        varchar option_name
        text option_value
        varchar autoload
    }
    wp_users ||--o{ wp_posts : "ID -> post_author"
    wp_posts ||--o{ wp_posts : "ID -> post_parent"
    wp_posts ||--o{ wp_comments : "ID -> comment_post_ID"
    wp_users ||--o{ wp_comments : "ID -> user_id"
    wp_comments ||--o{ wp_comments : "comment_ID -> comment_parent"
    wp_posts ||--o{ wp_postmeta : "ID -> post_id"
    wp_users ||--o{ wp_usermeta : "ID -> user_id"
    wp_comments ||--o{ wp_commentmeta : "comment_ID -> comment_id"
    wp_terms ||--o{ wp_term_taxonomy : "term_id -> term_id"
    wp_term_taxonomy ||--o{ wp_term_relationships : "term_taxonomy_id -> term_taxonomy_id"
    wp_posts ||--o{ wp_term_relationships : "ID -> object_id"
    wp_terms ||--o{ wp_termmeta : "term_id -> term_id"
    wp_actionscheduler_claims ||--o{ wp_actionscheduler_actions : "claim_id -> claim_id"
    wp_actionscheduler_actions ||--o{ wp_actionscheduler_logs : "action_id -> action_id"
    wp_actionscheduler_groups ||--o{ wp_actionscheduler_actions : "group_id -> group_id"
```

---

## WooCommerce (ecommerce_db) — all 34 tables

_Orders, analytics, shipping, tax, payments, downloads and admin_  
_34 entities · 22 relationships_

```mermaid
erDiagram
    wp_wc_orders {
        bigint id PK
        varchar status
        varchar currency
        varchar type
        decimal tax_amount
        decimal total_amount
        bigint customer_id
        varchar billing_email
        datetime date_created_gmt
        datetime date_updated_gmt
        bigint parent_order_id
        varchar payment_method
        text payment_method_title
        varchar transaction_id
        varchar ip_address
        text user_agent
        text customer_note
    }
    wp_woocommerce_order_items {
        bigint order_item_id PK
        text order_item_name
        varchar order_item_type
        bigint order_id FK
    }
    wp_woocommerce_order_itemmeta {
        bigint meta_id PK
        bigint order_item_id FK
        varchar meta_key
        text meta_value
    }
    wp_wc_order_addresses {
        bigint id PK
        bigint order_id FK
        varchar address_type
        text first_name
        text last_name
        text company
        text address_1
        text address_2
        text city
        text state
        text postcode
        text country
        varchar email
        varchar phone
    }
    wp_wc_order_operational_data {
        bigint id PK
        bigint order_id FK
        varchar created_via
        varchar woocommerce_version
        int prices_include_tax
        varchar cart_hash
        varchar order_key
        datetime date_paid_gmt
        datetime date_completed_gmt
        decimal shipping_tax_amount
        decimal shipping_total_amount
        decimal discount_tax_amount
        decimal discount_total_amount
    }
    wp_wc_orders_meta {
        bigint id PK
        bigint order_id FK
        varchar meta_key
        text meta_value
    }
    wp_wc_customer_lookup {
        bigint customer_id PK
        bigint user_id
        varchar username
        varchar first_name
        varchar last_name
        varchar email
        timestamp date_last_active
        timestamp date_registered
        char country
        varchar postcode
        varchar city
        varchar state
    }
    wp_wc_order_stats {
        bigint order_id PK
        bigint parent_id
        datetime date_created
        datetime date_created_gmt
        datetime date_paid
        datetime date_completed
        int num_items_sold
        float total_sales
        float tax_total
        float shipping_total
        float net_total
        int returning_customer
        varchar status
        bigint customer_id
    }
    wp_wc_order_product_lookup {
        bigint order_item_id PK
        bigint order_id FK
        bigint product_id
        bigint variation_id
        bigint customer_id
        datetime date_created
        int product_qty
        float product_net_revenue
        float product_gross_revenue
        float coupon_amount
        float tax_amount
        float shipping_amount
        float shipping_tax_amount
    }
    wp_wc_order_coupon_lookup {
        bigint order_id FK
        bigint coupon_id
        datetime date_created
        float discount_amount
    }
    wp_wc_order_tax_lookup {
        bigint order_id FK
        bigint tax_rate_id
        datetime date_created
        float shipping_tax
        float order_tax
        float total_tax
    }
    wp_wc_product_meta_lookup {
        bigint product_id PK
        varchar sku
        varchar global_unique_id
        int virtual
        int downloadable
        decimal min_price
        decimal max_price
        int onsale
        float stock_quantity
        varchar stock_status
        bigint rating_count
        decimal average_rating
        bigint total_sales
        varchar tax_status
        varchar tax_class
    }
    wp_wc_product_attributes_lookup {
        bigint product_id
        bigint product_or_parent_id
        varchar taxonomy
        bigint term_id
        int is_variation_attribute
        int in_stock
    }
    wp_wc_category_lookup {
        bigint category_tree_id PK
        bigint category_id
    }
    wp_woocommerce_shipping_zones {
        bigint zone_id PK
        varchar zone_name
        bigint zone_order
    }
    wp_woocommerce_shipping_zone_locations {
        bigint location_id PK
        bigint zone_id FK
        varchar location_code
        varchar location_type
    }
    wp_woocommerce_shipping_zone_methods {
        bigint instance_id PK
        bigint zone_id FK
        varchar method_id
        bigint method_order
        int is_enabled
    }
    wp_woocommerce_tax_rates {
        bigint tax_rate_id PK
        varchar tax_rate_country
        varchar tax_rate_state
        varchar tax_rate
        varchar tax_rate_name
        bigint tax_rate_priority
        int tax_rate_compound
        int tax_rate_shipping
        bigint tax_rate_order
        varchar tax_rate_class
    }
    wp_woocommerce_tax_rate_locations {
        bigint location_id PK
        varchar location_code
        bigint tax_rate_id FK
        varchar location_type
    }
    wp_wc_tax_rate_classes {
        bigint tax_rate_class_id PK
        varchar name
        varchar slug
    }
    wp_woocommerce_payment_tokens {
        bigint token_id PK
        varchar gateway_id
        text token
        bigint user_id
        varchar type
        int is_default
    }
    wp_woocommerce_payment_tokenmeta {
        bigint meta_id PK
        bigint payment_token_id FK
        varchar meta_key
        text meta_value
    }
    wp_woocommerce_downloadable_product_permissions {
        bigint permission_id PK
        varchar download_id
        bigint product_id
        bigint order_id
        varchar order_key
        varchar user_email
        bigint user_id
        varchar downloads_remaining
        datetime access_granted
        datetime access_expires
        bigint download_count
    }
    wp_wc_download_log {
        bigint download_log_id PK
        datetime timestamp
        bigint permission_id FK
        bigint user_id
        varchar user_ip_address
    }
    wp_wc_product_download_directories {
        bigint url_id PK
        varchar url
        int enabled
    }
    wp_wc_admin_notes {
        bigint note_id PK
        varchar name
        varchar type
        varchar locale
        text title
        text content
        varchar status
        varchar source
        datetime date_created
        datetime date_reminder
        int is_snoozable
        varchar layout
        varchar image
        int is_deleted
        int is_read
        varchar icon
    }
    wp_wc_admin_note_actions {
        bigint action_id PK
        bigint note_id FK
        varchar name
        varchar label
        text query
        varchar status
        varchar actioned_text
        varchar nonce_action
        varchar nonce_name
    }
    wp_woocommerce_api_keys {
        bigint key_id PK
        bigint user_id
        varchar description
        varchar permissions
        char consumer_key
        char consumer_secret
        char truncated_key
        datetime last_access
    }
    wp_wc_webhooks {
        bigint webhook_id PK
        varchar status
        text name
        bigint user_id
        text delivery_url
        varchar topic
        datetime date_created_gmt
        datetime date_modified_gmt
        int api_version
        int failure_count
        int pending_delivery
    }
    wp_woocommerce_sessions {
        bigint session_id PK
        char session_key
        text session_value
        bigint session_expiry
    }
    wp_woocommerce_attribute_taxonomies {
        bigint attribute_id PK
        varchar attribute_name
        varchar attribute_label
        varchar attribute_type
        varchar attribute_orderby
        int attribute_public
    }
    wp_woocommerce_log {
        bigint log_id PK
        datetime timestamp
        int level
        varchar source
        text message
        text context
    }
    wp_wc_rate_limits {
        bigint rate_limit_id PK
        varchar rate_limit_key
        bigint rate_limit_expiry
        int rate_limit_remaining
    }
    wp_wc_customer_lookup ||--o{ wp_wc_orders : "customer_id -> customer_id"
    wp_wc_orders ||--o{ wp_wc_order_stats : "id -> order_id"
    wp_wc_orders ||--o{ wp_woocommerce_order_items : "id -> order_id"
    wp_woocommerce_order_items ||--o{ wp_woocommerce_order_itemmeta : "order_item_id -> order_item_id"
    wp_wc_orders ||--o{ wp_wc_order_addresses : "id -> order_id"
    wp_wc_orders ||--o{ wp_wc_order_operational_data : "id -> order_id"
    wp_wc_orders ||--o{ wp_wc_orders_meta : "id -> order_id"
    wp_wc_orders ||--o{ wp_wc_order_product_lookup : "id -> order_id"
    wp_wc_orders ||--o{ wp_wc_order_coupon_lookup : "id -> order_id"
    wp_wc_orders ||--o{ wp_wc_order_tax_lookup : "id -> order_id"
    wp_wc_product_meta_lookup ||--o{ wp_wc_order_product_lookup : "product_id -> product_id"
    wp_wc_product_meta_lookup ||--o{ wp_wc_product_attributes_lookup : "product_id -> product_id"
    wp_wc_tax_rate_classes ||--o{ wp_woocommerce_tax_rates : "slug -> tax_rate_class"
    wp_woocommerce_tax_rates ||--o{ wp_woocommerce_tax_rate_locations : "tax_rate_id -> tax_rate_id"
    wp_woocommerce_tax_rates ||--o{ wp_wc_order_tax_lookup : "tax_rate_id -> tax_rate_id"
    wp_woocommerce_shipping_zones ||--o{ wp_woocommerce_shipping_zone_locations : "zone_id -> zone_id"
    wp_woocommerce_shipping_zones ||--o{ wp_woocommerce_shipping_zone_methods : "zone_id -> zone_id"
    wp_woocommerce_attribute_taxonomies ||--o{ wp_wc_product_attributes_lookup : "attribute_name -> taxonomy"
    wp_woocommerce_payment_tokens ||--o{ wp_woocommerce_payment_tokenmeta : "token_id -> payment_token_id"
    wp_woocommerce_downloadable_product_permissions ||--o{ wp_wc_download_log : "permission_id -> permission_id"
    wp_woocommerce_downloadable_product_permissions ||--o{ wp_wc_product_download_directories : "product_id -> url_id"
    wp_wc_admin_notes ||--o{ wp_wc_admin_note_actions : "note_id -> note_id"
```

---

## ERPNext (erp_db) — all 18 tables

_Users, roles, contacts, reference data, content and system tables_  
_18 entities · 10 relationships · classified as **3NF** in the thesis (tabular Doctypes; referential integrity enforced in Frappe/ERPNext, not as MySQL `FOREIGN KEY` constraints)._  
_ERPNext uses string `name` as PK and application-level references (no DB-level FK constraints)._

```mermaid
erDiagram
    tabUser {
        varchar name PK
        datetime creation
        datetime modified
        int enabled
        varchar email
        varchar first_name
        varchar middle_name
        varchar last_name
        varchar full_name
        varchar username
        varchar language
        varchar time_zone
        varchar gender
        date birth_date
        varchar phone
        varchar mobile_no
        varchar location
        text bio
        varchar user_type
        datetime last_active
        varchar last_login
        varchar api_key
        text api_secret
        varchar role_profile_name
        varchar desk_theme
        int simultaneous_sessions
        int send_welcome_email
        int unsubscribed
    }
    tabRole {
        varchar name PK
        datetime creation
        datetime modified
        varchar role_name
        varchar home_page
        varchar restrict_to_domain
        int disabled
        int is_custom
        int desk_access
        int two_factor_auth
    }
    tabContact {
        varchar name PK
        datetime creation
        datetime modified
        varchar first_name
        varchar middle_name
        varchar last_name
        varchar email_id
        varchar user
        varchar address
        varchar status
        varchar salutation
        varchar designation
        varchar gender
        varchar phone
        varchar mobile_no
        varchar company_name
        int is_primary_contact
        int unsubscribed
    }
    tabCountry {
        varchar name PK
        datetime creation
        datetime modified
        varchar country_name
        varchar date_format
        varchar time_format
        text time_zones
        varchar code
    }
    tabCurrency {
        varchar name PK
        datetime creation
        datetime modified
        varchar currency_name
        int enabled
        varchar fraction
        int fraction_units
        decimal smallest_currency_fraction_value
        varchar symbol
        int symbol_on_right
        varchar number_format
    }
    tabLanguage {
        varchar name PK
        datetime creation
        datetime modified
        int enabled
        varchar language_code
        varchar language_name
        varchar flag
        varchar based_on
    }
    tabGender {
        varchar name PK
        datetime creation
        datetime modified
        varchar gender
    }
    tabSalutation {
        varchar name PK
        datetime creation
        datetime modified
        varchar salutation
    }
    tabDomain {
        varchar name PK
        datetime creation
        datetime modified
        varchar domain
    }
    tabAddress {
        varchar name PK
        datetime creation
        datetime modified
        varchar address_title
        varchar address_type
        varchar address_line1
        varchar address_line2
        varchar city
        varchar county
        varchar state
        varchar country
        varchar pincode
        varchar email_id
        varchar phone
        varchar fax
        int is_primary_address
        int is_shipping_address
        int disabled
    }
    tabBlogger {
        varchar name PK
        datetime creation
        datetime modified
        int disabled
        varchar short_name
        varchar full_name
        varchar user
        text bio
        text avatar
    }
    tabNewsletter {
        varchar name PK
        datetime creation
        datetime modified
        datetime email_sent_at
        int total_recipients
        int email_sent
        varchar sender_name
        varchar sender_email
        varchar send_from
        text subject
        varchar content_type
        text message
        int published
        varchar route
        int schedule_sending
        datetime schedule_send
    }
    tabNotification {
        varchar name PK
        datetime creation
        datetime modified
        int enabled
        int is_standard
        varchar module
        varchar channel
        varchar subject
        varchar event
        varchar document_type
        varchar method
        varchar sender
        varchar sender_email
        text message
        varchar message_type
        int attach_print
        varchar print_format
    }
    tabComment {
        varchar name PK
        datetime creation
        datetime modified
        varchar comment_type
        varchar comment_email
        text subject
        varchar comment_by
        int published
        int seen
        varchar reference_doctype
        varchar reference_name
        varchar reference_owner
        text content
        varchar ip_address
    }
    tabFile {
        varchar name PK
        datetime creation
        datetime modified
        varchar file_name
        text file_url
        varchar file_type
        bigint file_size
        varchar folder
        int is_folder
        int is_private
        int is_home_folder
        int is_attachments_folder
        varchar attached_to_doctype
        varchar attached_to_name
        varchar attached_to_field
        varchar module
        varchar content_hash
        int uploaded_to_dropbox
        int uploaded_to_google_drive
    }
    tabToDo {
        varchar name PK
        datetime creation
        datetime modified
        varchar status
        varchar priority
        varchar color
        date date
        varchar allocated_to
        text description
        varchar reference_type
        varchar reference_name
        varchar role
        varchar assigned_by
        varchar assigned_by_full_name
        varchar assignment_rule
    }
    tabVersion {
        bigint name PK
        datetime creation
        datetime modified
        varchar ref_doctype
        varchar docname
        text data
    }
    tabTag {
        varchar name PK
        datetime creation
        datetime modified
        text description
    }
    tabLanguage ||--o{ tabUser : "name -> language"
    tabUser ||--o{ tabContact : "name -> user"
    tabSalutation ||--o{ tabContact : "name -> salutation"
    tabGender ||--o{ tabContact : "name -> gender"
    tabUser ||--o{ tabBlogger : "name -> user"
    tabBlogger ||--o{ tabNewsletter : "user -> sender_email"
    tabCountry ||--o{ tabAddress : "name -> country"
    tabUser ||--o{ tabFile : "name -> attached_to_name"
    tabUser ||--o{ tabToDo : "name -> allocated_to"
    tabUser ||--o{ tabComment : "name -> comment_by"
```
