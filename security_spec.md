# Security Specification for SaveSini

## 1. Data Invariants
1. **User Isolation**: A user can only read, write, or list documents under their own path `/users/{userId}/**` where `request.auth.uid == userId`.
2. **Email Verification**: Write operations require `request.auth.token.email_verified == true`.
3. **Identity Binding**: Incoming `userId` on links and collections must strictly equal `request.auth.uid`.
4. **Id Sanitization**: All document IDs must be valid alphanumeric strings under 128 characters (`^[a-zA-Z0-9_\-]+$`).
5. **Payload Bounding**:
   - `url`: Max 1024 chars
   - `title`: Max 300 chars
   - `notes`: Max 3000 chars
   - `tags`: Max 20 items, each string max 50 chars
   - `linkIds`: Max 100 items
6. **Default Deny**: All unmapped paths are closed (`allow read, write: if false;`).

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read/Write**: Unauthenticated user querying `/users/{userId}/links`.
2. **Cross-Tenant Hijack**: User B trying to read `/users/UserA/links/link-1`.
3. **Cross-Tenant Ingestion**: User B attempting to write to `/users/UserA/links/link-evil`.
4. **Spoofed Owner UID**: Writing to `/users/UserA/links/link-1` with `userId: "UserB"`.
5. **Path Traversal / Poisoned ID**: ID containing `../` or special shell characters.
6. **Denial-of-Wallet Payload**: String field with 1MB payload violating `.size() <= 3000`.
7. **Unverified Email Spoof**: Token where `email_verified == false` attempting database mutation.
8. **Invalid Platform Enum**: Link with `platform: "malicious_network"`.
9. **Unbounded Array Attack**: Injecting 50,000 array items into `tags`.
10. **Ghost Field Injection**: Adding `{ backdoorKey: true }` to document payload.
11. **Direct Path Tampering**: Attempting write to root collection `/links`.
12. **Blanket Query Scraping**: Malicious user running collectionGroup query to scrape other users' notes.
