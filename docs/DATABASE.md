# Database Design

PostgreSQL is accessed only through Prisma. The schema is in `server/prisma/schema.prisma`.

## Relationships

```text
User 1 -------- * Memory * -------- 0..1 Prompt
 owner                 optional selected prompt
```

## User

| Field        | Type/constraint                                 |
| ------------ | ----------------------------------------------- |
| id           | UUID primary key                                |
| name         | required text                                   |
| username     | required, unique text                           |
| email        | required, unique text                           |
| passwordHash | required text; never selected for public output |
| bio          | nullable text                                   |
| avatarUrl    | nullable text                                   |
| createdAt    | creation timestamp                              |
| updatedAt    | automatically updated timestamp                 |

Usernames and emails must be normalized to lowercase in the application before persistence. Username format/length and all text limits are enforced at the API boundary; unique database constraints remain the final concurrency-safe check.

## Memory

| Field       | Type/constraint                                               |
| ----------- | ------------------------------------------------------------- |
| id          | UUID primary key                                              |
| ownerId     | required foreign key to User; cascades on owner deletion      |
| authorName  | nullable for anonymous submissions                            |
| message     | required text                                                 |
| isAnonymous | boolean, default false                                        |
| promptId    | nullable foreign key to Prompt; set null if prompt is deleted |
| photoUrl    | nullable text                                                 |
| isFavorite  | boolean, default false                                        |
| isPinned    | boolean, default false                                        |
| isHidden    | boolean, default false                                        |
| createdAt   | creation timestamp                                            |
| updatedAt   | automatically updated timestamp                               |

Indexes support owner dashboard ordering, owner visibility queries, and prompt lookup. The API must ensure `authorName` is present when `isAnonymous` is false and never disclose it for anonymous public output.

## Prompt

| Field     | Type/constraint       |
| --------- | --------------------- |
| id        | UUID primary key      |
| text      | required text         |
| category  | required text         |
| isActive  | boolean, default true |
| createdAt | creation timestamp    |

An index supports active prompts by category. Prompts are shared curated content, not owner-created in the MVP.

## Migration policy

No migration is generated during initialization because no database connection is assumed. After local PostgreSQL is configured, review the schema and run `npm run prisma:migrate -w server -- --name init`. Commit the generated migration. Never edit an applied migration or run destructive reset commands against shared data.
