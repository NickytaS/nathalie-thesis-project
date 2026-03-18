table "posts" do
  column "id", :key
  column "title", :string
  column "content", :text
  column "created_at", :datetime
end

table "comments" do
  column "id", :key
  column "post_id", :integer, :references => :posts
  column "author", :string
  column "content", :text
end
