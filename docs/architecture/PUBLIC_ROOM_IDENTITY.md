# Public room identity

JoinDraftPick uses two identifiers for rooms:

| Identity | Role |
| --- | --- |
| **UUID** (`rooms.id`) | Internal database primary key. Used by organizer/admin routes and server actions. |
| **Room code** (`rooms.join_code`) | Public share identifier. Six uppercase alphanumeric characters, unique for the life of the room. |

## Canonical participant URL

```
/r/{ROOMCODE}
```

Example: `https://joindraftpick.com/r/87ZMAB`

Copy Link, QR codes, and shared invite URLs use this format. Room codes are normalized to uppercase before lookup.

## Organizer routes

Admin and draft tooling remain on UUID routes, for example:

- `/room/{uuid}/admin`
- `/room/{uuid}/draft`

Knowing a room code alone does not grant organizer access.

## Backward compatibility

Legacy participant links continue to work:

- `/room/{uuid}/join` redirects to `/r/{ROOMCODE}` (query params preserved).
- `/room/{uuid}` and other UUID routes remain available for existing bookmarks.

## Indexing

`/r/[roomCode]` pages are marked `noindex` and are not sitemap content.
