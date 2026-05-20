# blog_db — Core content and metadata ERD

Subset of the WordPress schema: posts, users, comments, and key–value metadata tables (`wp_postmeta`, `wp_commentmeta`, `wp_usermeta`, `wp_options`). Excludes taxonomy, links, and Action Scheduler (see [ERD.md](./ERD.md) for the full `blog_db` diagram).

View in VS Code (Markdown Preview Mermaid Support extension) or paste the block into https://mermaid.live

---

## Core tables and metadata relationships

_Logical relationships only; MySQL may not declare `FOREIGN KEY` constraints. `wp_options` is site-wide configuration and has no foreign key to posts._

```mermaid
erDiagram
    wp_posts {
        bigint ID PK
        bigint post_author
        varchar post_type
        varchar post_status
        text post_title
        bigint post_parent
    }
    wp_users {
        bigint ID PK
        varchar user_login
        varchar user_email
        varchar display_name
    }
    wp_comments {
        bigint comment_ID PK
        bigint comment_post_ID
        bigint comment_parent
        bigint user_id
        text comment_content
    }
    wp_postmeta {
        bigint meta_id PK
        bigint post_id
        varchar meta_key
        text meta_value
    }
    wp_commentmeta {
        bigint meta_id PK
        bigint comment_id
        varchar meta_key
        text meta_value
    }
    wp_usermeta {
        bigint umeta_id PK
        bigint user_id
        varchar meta_key
        text meta_value
    }
    wp_options {
        bigint option_id PK
        varchar option_name
        text option_value
        varchar autoload
    }

    wp_users ||--o{ wp_posts : "author"
    wp_posts ||--o{ wp_posts : "parent child"
    wp_posts ||--o{ wp_comments : "on post"
    wp_users ||--o{ wp_comments : "logged in user"
    wp_comments ||--o{ wp_comments : "thread parent"
    wp_posts ||--o{ wp_postmeta : "post meta"
    wp_users ||--o{ wp_usermeta : "user meta"
    wp_comments ||--o{ wp_commentmeta : "comment meta"
```
