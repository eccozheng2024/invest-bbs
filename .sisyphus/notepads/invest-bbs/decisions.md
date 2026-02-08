## Technical Decisions

### 2026-02-08: Initial Architecture
- **Framework**: Next.js 15 + Payload CMS v3
- **Database**: PostgreSQL (adapter: @payloadcms/db-postgres)
- **Storage**: Cloudflare R2 via @payloadcms/storage-s3
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Package Manager**: pnpm

### Permission Model
- Roles: `admin` | `user`
- User Status: `pending` | `approved` | `rejected`
- Only approved users can create posts and upload files
- Admins can manage all content and approve users

### Collection Relationships
```
Users 1-->* Posts
Users 1-->* Comments
Posts 1-->* Comments
Posts 1-->* Attachments
Comments 1-->* Comments (replies, max 2 levels)
```

### File Upload Constraints
- Max file size: 50MB
- Allowed types: PDF, MP4, MOV, EPUB, MOBI
- Stored in R2 with public read access

### 2026-02-08: Runtime/Verification Adjustments
- `vitest` scoped to `tests/unit/**` to avoid executing Playwright suites inside Vitest.
- Playwright `webServer.command` switched to `npx next dev -p 3000` because `pnpm` is unavailable in current environment.
- Several app routes/pages marked `dynamic = 'force-dynamic'` to avoid static prerender DB dependency failures.
- `posts.content` field simplified to `textarea` for v1 (fast delivery, less editor complexity).
