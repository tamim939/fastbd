# Firestore Security Specification - Premium Download Hub

## Data Invariants
1. A **post** must be created by an authenticated admin.
2. **Settings** (notice, sliders) can only be updated by authenticated admins.
3. **Users** can read all posts, categories, and settings.
4. **Users** can only manage their own profile.
5. **Admins** have full write access to posts, categories, and settings.

## The "Dirty Dozen" Payloads (Denial Expected)
1. Unauthenticated post creation.
2. User trying to update a post's download link.
3. User trying to delete a category.
4. User trying to upgrade their role to 'admin' in their profile.
5. User trying to write to the `admins` collection.
6. User trying to update the global `settings/general`.
7. Creating a post with a 2MB title (exceeding string limit).
8. Updating a post but changing its `createdAt` field (immutable).
9. Spoofing `authorId` in a post create.
10. Anonymous user trying to write to posts.
11. User trying to read another user's private data (if any was split).
12. Admin trying to create a post with missing required fields.

## Test Strategy
I will generate rules that:
- Default deny everything.
- Allow read for authenticated users on public collections.
- Allow read/write for UIDs found in the `/admins/` collection.
- Enforce strict typing via `isValid[Entity]` helpers.
