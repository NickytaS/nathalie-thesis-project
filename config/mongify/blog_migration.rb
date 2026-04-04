# WordPress Posts
table "wp_posts" do
  column "ID", :key
  column "post_author", :integer
  column "post_date", :datetime
  column "post_date_gmt", :datetime
  column "post_content", :text
  column "post_title", :string
  column "post_excerpt", :text
  column "post_status", :string
  column "comment_status", :string
  column "ping_status", :string
  column "post_password", :string
  column "post_name", :string
  column "post_modified", :datetime
  column "post_modified_gmt", :datetime
  column "post_parent", :integer
  column "guid", :string
  column "menu_order", :integer
  column "post_type", :string
  column "post_mime_type", :string
  column "comment_count", :integer
end

# WordPress Users
table "wp_users" do
  column "ID", :key
  column "user_login", :string
  column "user_pass", :string
  column "user_nicename", :string
  column "user_email", :string
  column "user_url", :string
  column "user_registered", :datetime
  column "user_activation_key", :string
  column "user_status", :integer
  column "display_name", :string
end

# WordPress Comments
table "wp_comments" do
  column "comment_ID", :key
  column "comment_post_ID", :integer, :references => "wp_posts"
  column "comment_author", :string
  column "comment_author_email", :string
  column "comment_author_url", :string
  column "comment_author_IP", :string
  column "comment_date", :datetime
  column "comment_date_gmt", :datetime
  column "comment_content", :text
  column "comment_karma", :integer
  column "comment_approved", :string
  column "comment_type", :string
  column "comment_parent", :integer
  column "user_id", :integer, :references => "wp_users"
end

# WordPress Terms
table "wp_terms" do
  column "term_id", :key
  column "name", :string
  column "slug", :string
  column "term_group", :integer
end

# WordPress Term Taxonomy
table "wp_term_taxonomy" do
  column "term_taxonomy_id", :key
  column "term_id", :integer, :references => "wp_terms"
  column "taxonomy", :string
  column "description", :text
  column "parent", :integer
  column "count", :integer
end

# WordPress Term Relationships
table "wp_term_relationships" do
  column "object_id", :key
  column "term_taxonomy_id", :integer, :references => "wp_term_taxonomy"
  column "term_order", :integer
end

# WordPress Options
table "wp_options" do
  column "option_id", :key
  column "option_name", :string
  column "option_value", :text
  column "autoload", :string
end

# WordPress User Meta
table "wp_usermeta" do
  column "umeta_id", :key
  column "user_id", :integer, :references => "wp_users"
  column "meta_key", :string
  column "meta_value", :text
end

# WordPress Post Meta
table "wp_postmeta" do
  column "meta_id", :key
  column "post_id", :integer, :references => "wp_posts"
  column "meta_key", :string
  column "meta_value", :text
end

# WordPress Comment Meta
table "wp_commentmeta" do
  column "meta_id", :key
  column "comment_id", :integer, :references => "wp_comments"
  column "meta_key", :string
  column "meta_value", :text
end

# WordPress Term Meta
table "wp_termmeta" do
  column "meta_id", :key
  column "term_id", :integer, :references => "wp_terms"
  column "meta_key", :string
  column "meta_value", :text
end

# WordPress Links
table "wp_links" do
  column "link_id", :key
  column "link_url", :string
  column "link_name", :string
  column "link_image", :string
  column "link_target", :string
  column "link_description", :string
  column "link_visible", :string
  column "link_owner", :integer
  column "link_rating", :integer
  column "link_updated", :datetime
  column "link_rel", :string
  column "link_notes", :text
  column "link_rss", :string
end

# WordPress Action Scheduler Actions
table "wp_actionscheduler_actions" do
  column "action_id", :key
  column "hook", :string
  column "status", :string
  column "scheduled_date_gmt", :datetime
  column "scheduled_date_local", :datetime
  column "priority", :integer
  column "args", :string
  column "schedule", :text
  column "group_id", :integer
  column "attempts", :integer
  column "last_attempt_gmt", :datetime
  column "last_attempt_local", :datetime
  column "claim_id", :integer
  column "extended_args", :string
end

# WordPress Action Scheduler Claims
table "wp_actionscheduler_claims" do
  column "claim_id", :key
  column "date_created_gmt", :datetime
end

# WordPress Action Scheduler Groups
table "wp_actionscheduler_groups" do
  column "group_id", :key
  column "slug", :string
end

# WordPress Action Scheduler Logs
table "wp_actionscheduler_logs" do
  column "log_id", :key
  column "action_id", :integer, :references => "wp_actionscheduler_actions"
  column "message", :text
  column "log_date_gmt", :datetime
  column "log_date_local", :datetime
end
