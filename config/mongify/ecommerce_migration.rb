# WooCommerce Orders
table "wp_wc_orders" do
  column "id", :key
  column "status", :string
  column "currency", :string
  column "type", :string
  column "tax_amount", :string
  column "total_amount", :string
  column "customer_id", :integer
  column "billing_email", :string
  column "date_created_gmt", :datetime
  column "date_updated_gmt", :datetime
  column "parent_order_id", :integer
  column "payment_method", :string
  column "payment_method_title", :text
  column "transaction_id", :string
  column "ip_address", :string
  column "user_agent", :text
  column "customer_note", :text
end

# WooCommerce Order Stats
table "wp_wc_order_stats" do
  column "order_id", :key
  column "parent_id", :integer
  column "date_created", :datetime
  column "date_created_gmt", :datetime
  column "date_paid", :datetime
  column "date_completed", :datetime
  column "num_items_sold", :integer
  column "total_sales", :string
  column "tax_total", :string
  column "shipping_total", :string
  column "net_total", :string
  column "returning_customer", :integer
  column "status", :string
  column "customer_id", :integer
end

# WooCommerce Customer Lookup
table "wp_wc_customer_lookup" do
  column "customer_id", :key
  column "user_id", :integer
  column "username", :string
  column "first_name", :string
  column "last_name", :string
  column "email", :string
  column "date_last_active", :datetime
  column "date_registered", :datetime
  column "country", :string
  column "postcode", :string
  column "city", :string
  column "state", :string
end

# WooCommerce Order Items
table "wp_woocommerce_order_items" do
  column "order_item_id", :key
  column "order_item_name", :text
  column "order_item_type", :string
  column "order_id", :integer, :references => "wp_wc_orders"
end

# WooCommerce Order Item Meta
table "wp_woocommerce_order_itemmeta" do
  column "meta_id", :key
  column "order_item_id", :integer, :references => "wp_woocommerce_order_items"
  column "meta_key", :string
  column "meta_value", :text
end

# WooCommerce Product Meta Lookup
table "wp_wc_product_meta_lookup" do
  column "product_id", :key
  column "sku", :string
  column "global_unique_id", :string
  column "min_price", :string
  column "max_price", :string
  column "stock_quantity", :string
  column "stock_status", :string
  column "rating_count", :integer
  column "average_rating", :string
  column "total_sales", :integer
  column "tax_status", :string
  column "tax_class", :string
end

# WooCommerce Order Addresses
table "wp_wc_order_addresses" do
  column "id", :key
  column "order_id", :integer, :references => "wp_wc_orders"
  column "address_type", :string
  column "first_name", :text
  column "last_name", :text
  column "company", :text
  column "address_1", :text
  column "address_2", :text
  column "city", :text
  column "state", :text
  column "postcode", :text
  column "country", :text
  column "email", :string
  column "phone", :string
end

# WooCommerce Order Operational Data
table "wp_wc_order_operational_data" do
  column "id", :key
  column "order_id", :integer, :references => "wp_wc_orders"
  column "created_via", :string
  column "woocommerce_version", :string
  column "cart_hash", :string
  column "order_key", :string
  column "date_paid_gmt", :datetime
  column "date_completed_gmt", :datetime
  column "shipping_tax_amount", :string
  column "shipping_total_amount", :string
  column "discount_tax_amount", :string
  column "discount_total_amount", :string
end

# WooCommerce Admin Notes
table "wp_wc_admin_notes" do
  column "note_id", :key
  column "name", :string
  column "type", :string
  column "locale", :string
  column "title", :text
  column "content", :text
  column "status", :string
  column "source", :string
  column "date_created", :datetime
  column "date_reminder", :datetime
  column "layout", :string
  column "image", :string
  column "icon", :string
end

# WooCommerce Admin Note Actions
table "wp_wc_admin_note_actions" do
  column "action_id", :key
  column "note_id", :integer, :references => "wp_wc_admin_notes"
  column "name", :string
  column "label", :string
  column "query", :text
  column "status", :string
  column "actioned_text", :string
  column "nonce_action", :string
  column "nonce_name", :string
end

# WooCommerce Category Lookup
table "wp_wc_category_lookup" do
  column "category_tree_id", :key
  column "category_id", :integer
end

# WooCommerce Order Coupon Lookup
table "wp_wc_order_coupon_lookup" do
  column "order_id", :key
  column "coupon_id", :integer
  column "date_created", :datetime
  column "discount_amount", :string
end

# WooCommerce Order Product Lookup
table "wp_wc_order_product_lookup" do
  column "order_item_id", :key
  column "order_id", :integer, :references => "wp_wc_orders"
  column "product_id", :integer
  column "variation_id", :integer
  column "customer_id", :integer
  column "date_created", :datetime
  column "product_qty", :integer
  column "product_net_revenue", :string
  column "product_gross_revenue", :string
  column "coupon_amount", :string
  column "tax_amount", :string
  column "shipping_amount", :string
  column "shipping_tax_amount", :string
end

# WooCommerce Order Tax Lookup
table "wp_wc_order_tax_lookup" do
  column "order_id", :key
  column "tax_rate_id", :integer
  column "date_created", :datetime
  column "shipping_tax", :string
  column "order_tax", :string
  column "total_tax", :string
end

# WooCommerce Product Attributes Lookup
table "wp_wc_product_attributes_lookup" do
  column "product_id", :key
  column "product_or_parent_id", :integer
  column "taxonomy", :string
  column "term_id", :integer
end

# WooCommerce Product Download Directories
table "wp_wc_product_download_directories" do
  column "url_id", :key
  column "url", :string
end

# WooCommerce Rate Limits
table "wp_wc_rate_limits" do
  column "rate_limit_id", :key
  column "rate_limit_key", :string
  column "rate_limit_expiry", :integer
  column "rate_limit_remaining", :integer
end

# WooCommerce Reserved Stock
table "wp_wc_reserved_stock" do
  column "order_id", :key
  column "product_id", :integer
  column "stock_quantity", :string
  column "timestamp", :datetime
  column "expires", :datetime
end

# WooCommerce Tax Rate Classes
table "wp_wc_tax_rate_classes" do
  column "tax_rate_class_id", :key
  column "name", :string
  column "slug", :string
end

# WooCommerce Webhooks
table "wp_wc_webhooks" do
  column "webhook_id", :key
  column "status", :string
  column "name", :text
  column "user_id", :integer
  column "delivery_url", :text
  column "secret", :text
  column "topic", :string
  column "date_created", :datetime
  column "date_created_gmt", :datetime
  column "date_modified", :datetime
  column "date_modified_gmt", :datetime
  column "api_version", :integer
  column "failure_count", :integer
end

# WooCommerce Orders Meta
table "wp_wc_orders_meta" do
  column "id", :key
  column "order_id", :integer, :references => "wp_wc_orders"
  column "meta_key", :string
  column "meta_value", :text
end

# WooCommerce Download Log
table "wp_wc_download_log" do
  column "download_log_id", :key
  column "timestamp", :datetime
  column "permission_id", :integer
  column "user_id", :integer
  column "user_ip_address", :string
end

# WooCommerce API Keys
table "wp_woocommerce_api_keys" do
  column "key_id", :key
  column "user_id", :integer
  column "description", :string
  column "permissions", :string
  column "consumer_key", :string
  column "consumer_secret", :string
  column "truncated_key", :string
  column "last_access", :datetime
end

# WooCommerce Attribute Taxonomies
table "wp_woocommerce_attribute_taxonomies" do
  column "attribute_id", :key
  column "attribute_name", :string
  column "attribute_label", :string
  column "attribute_type", :string
  column "attribute_orderby", :string
  column "attribute_public", :integer
end

# WooCommerce Downloadable Product Permissions
table "wp_woocommerce_downloadable_product_permissions" do
  column "permission_id", :key
  column "download_id", :string
  column "product_id", :integer
  column "order_id", :integer
  column "order_key", :string
  column "user_email", :string
  column "user_id", :integer
  column "downloads_remaining", :string
  column "access_granted", :datetime
  column "access_expires", :datetime
  column "download_count", :integer
end

# WooCommerce Log
table "wp_woocommerce_log" do
  column "log_id", :key
  column "timestamp", :datetime
  column "level", :integer
  column "source", :string
  column "message", :text
  column "context", :text
end

# WooCommerce Payment Tokens
table "wp_woocommerce_payment_tokens" do
  column "token_id", :key
  column "gateway_id", :string
  column "token", :text
  column "user_id", :integer
  column "type", :string
end

# WooCommerce Payment Token Meta
table "wp_woocommerce_payment_tokenmeta" do
  column "meta_id", :key
  column "payment_token_id", :integer, :references => "wp_woocommerce_payment_tokens"
  column "meta_key", :string
  column "meta_value", :text
end

# WooCommerce Sessions
table "wp_woocommerce_sessions" do
  column "session_id", :key
  column "session_key", :string
  column "session_value", :text
  column "session_expiry", :integer
end

# WooCommerce Shipping Zones
table "wp_woocommerce_shipping_zones" do
  column "zone_id", :key
  column "zone_name", :string
  column "zone_order", :integer
end

# WooCommerce Shipping Zone Locations
table "wp_woocommerce_shipping_zone_locations" do
  column "location_id", :key
  column "zone_id", :integer, :references => "wp_woocommerce_shipping_zones"
  column "location_code", :string
  column "location_type", :string
end

# WooCommerce Shipping Zone Methods
table "wp_woocommerce_shipping_zone_methods" do
  column "instance_id", :key
  column "zone_id", :integer, :references => "wp_woocommerce_shipping_zones"
  column "method_id", :string
  column "method_order", :integer
end

# WooCommerce Tax Rates
table "wp_woocommerce_tax_rates" do
  column "tax_rate_id", :key
  column "tax_rate_country", :string
  column "tax_rate_state", :string
  column "tax_rate", :string
  column "tax_rate_name", :string
  column "tax_rate_priority", :integer
  column "tax_rate_compound", :integer
  column "tax_rate_shipping", :integer
  column "tax_rate_order", :integer
  column "tax_rate_class", :string
end

# WooCommerce Tax Rate Locations
table "wp_woocommerce_tax_rate_locations" do
  column "location_id", :key
  column "location_code", :string
  column "tax_rate_id", :integer, :references => "wp_woocommerce_tax_rates"
  column "location_type", :string
end
