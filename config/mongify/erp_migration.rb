# ERPNext User
table "tabUser" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "enabled", :integer
  column "email", :string
  column "first_name", :string
  column "middle_name", :string
  column "last_name", :string
  column "full_name", :string
  column "username", :string
  column "language", :string
  column "time_zone", :string
  column "gender", :string
  column "birth_date", :date
  column "phone", :string
  column "location", :string
  column "bio", :text
  column "mobile_no", :string
  column "user_type", :string
  column "last_active", :datetime
  column "last_login", :string
end

# ERPNext Role
table "tabRole" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "role_name", :string
  column "home_page", :string
  column "restrict_to_domain", :string
  column "disabled", :integer
  column "desk_access", :integer
  column "two_factor_auth", :integer
end

# ERPNext Contact
table "tabContact" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "first_name", :string
  column "middle_name", :string
  column "last_name", :string
  column "email_id", :string
  column "user", :string
  column "status", :string
  column "salutation", :string
  column "designation", :string
  column "gender", :string
  column "phone", :string
  column "mobile_no", :string
  column "company_name", :string
end

# ERPNext Address
table "tabAddress" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "address_title", :string
  column "address_type", :string
  column "address_line1", :string
  column "address_line2", :string
  column "city", :string
  column "state", :string
  column "country", :string
  column "pincode", :string
  column "email_id", :string
  column "phone", :string
  column "is_primary_address", :integer
  column "is_shipping_address", :integer
end

# ERPNext Country
table "tabCountry" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "country_name", :string
  column "date_format", :string
  column "time_format", :string
  column "code", :string
end

# ERPNext Currency
table "tabCurrency" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "currency_name", :string
  column "enabled", :integer
  column "fraction", :string
  column "symbol", :string
  column "number_format", :string
end

# ERPNext Gender
table "tabGender" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "gender", :string
end

# ERPNext Salutation
table "tabSalutation" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "salutation", :string
end

# ERPNext Comment
table "tabComment" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "comment_type", :string
  column "comment_email", :string
  column "subject", :text
  column "comment_by", :string
  column "published", :integer
  column "seen", :integer
  column "reference_doctype", :string
  column "reference_name", :string
  column "content", :text
end

# ERPNext File
table "tabFile" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "file_name", :string
  column "file_url", :text
  column "module", :string
  column "attached_to_name", :string
  column "file_size", :integer
  column "attached_to_doctype", :string
  column "is_private", :integer
  column "file_type", :string
  column "folder", :string
  column "content_hash", :string
end

# ERPNext ToDo
table "tabToDo" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "status", :string
  column "priority", :string
  column "color", :string
  column "date", :date
  column "allocated_to", :string
  column "description", :text
  column "reference_type", :string
  column "reference_name", :string
  column "assigned_by", :string
  column "assigned_by_full_name", :string
end

# ERPNext Version
table "tabVersion" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "ref_doctype", :string
  column "docname", :string
  column "data", :text
end

# ERPNext Tag
table "tabTag" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "description", :text
end

# ERPNext Domain
table "tabDomain" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "domain", :string
end

# ERPNext Language
table "tabLanguage" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "enabled", :integer
  column "language_code", :string
  column "language_name", :string
  column "flag", :string
  column "based_on", :string
end

# ERPNext Blogger
table "tabBlogger" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "disabled", :integer
  column "short_name", :string
  column "full_name", :string
  column "user", :string
  column "bio", :text
end

# ERPNext Newsletter
table "tabNewsletter" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "email_sent_at", :datetime
  column "total_recipients", :integer
  column "email_sent", :integer
  column "sender_name", :string
  column "sender_email", :string
  column "subject", :text
  column "content_type", :string
  column "message", :text
  column "published", :integer
  column "route", :string
end

# ERPNext Notification
table "tabNotification" do
  column "name", :key
  column "creation", :datetime
  column "modified", :datetime
  column "modified_by", :string
  column "owner", :string
  column "enabled", :integer
  column "channel", :string
  column "subject", :string
  column "event", :string
  column "document_type", :string
  column "method", :string
  column "sender", :string
  column "sender_email", :string
  column "message", :text
end
