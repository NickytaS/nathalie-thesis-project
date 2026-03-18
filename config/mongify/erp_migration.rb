table "employees" do
  column "id", :key
  column "name", :string
  column "manager_id", :integer, :references => :employees
end

table "departments" do
  column "id", :key
  column "name", :string
end

table "projects" do
  column "id", :key
  column "name", :string
  column "department_id", :integer, :references => :departments
end
