table "products" do
  column "id", :key
  column "name", :string
  column "price", :decimal
end

table "orders" do
  column "id", :key
  column "customer_name", :string
  column "total", :decimal
end

table "order_items" do
  column "id", :key
  column "order_id", :integer, :references => :orders
  column "product_id", :integer, :references => :products
  column "quantity", :integer
end
