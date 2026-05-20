# erp_db — Reference tables and domain separation ERD

Subset of the ERPNext / Frappe schema focused on **reference Doctypes** (each in its own `tab*` table with string `name` as primary key) and a minimal illustration of **cross-domain links** (`tabLanguage` → `tabUser`, `tabCountry` → `tabAddress`). `tabRole` is shown as an isolated reference table: assigning roles to users is done via link/child Doctypes in full ERPNext and does not appear as a foreign key in this exported table set. Excludes contacts, files, comments, todos, versions, tags, notifications, blogger, and newsletter tables (see [ERD.md](./ERD.md) for the full `erp_db` diagram).

View in VS Code (Markdown Preview Mermaid Support extension) or paste the block into https://mermaid.live

---

## Independent reference tables and key relationships

_Referential integrity is enforced in Frappe/ERPNext (DocType layer), not as MySQL `FOREIGN KEY` constraints. Reference tables are not linked to one another at the storage level; edges below are logical application references only._

```mermaid
erDiagram
    tabCountry {
        varchar name PK
        varchar country_name
        varchar code
    }
    tabCurrency {
        varchar name PK
        varchar currency_name
        varchar symbol
        int enabled
    }
    tabLanguage {
        varchar name PK
        varchar language_code
        varchar language_name
        int enabled
    }
    tabRole {
        varchar name PK
        varchar role_name
        int desk_access
        int disabled
    }
    tabGender {
        varchar name PK
        varchar gender
    }
    tabSalutation {
        varchar name PK
        varchar salutation
    }
    tabDomain {
        varchar name PK
        varchar domain
    }
    tabUser {
        varchar name PK
        varchar email
        varchar username
        varchar language
        varchar full_name
        int enabled
    }
    tabAddress {
        varchar name PK
        varchar address_line1
        varchar city
        varchar country
        int is_primary_address
    }

    tabLanguage ||--o{ tabUser : "name to language"
    tabCountry ||--o{ tabAddress : "name to country"
```
