# Admin control room

The administration UI uses the shared Belancer palette and fonts, a responsive sidebar, live overview counts, recent audit events, status badges and clearer editors. Search remains mounted while records load; duplicate requests are guarded. API validation messages are readable.

Games shows the complete shared player catalog: five backend-managed ranked games and 23 local practice games. Ranked games retain configuration and availability editing. Practice cards link to their player detail pages; practice rules are still maintained in code and scores are not stored in ranked leaderboards. This change does not implement practice-game administration APIs.

## Validation

- Frontend production build passed; nine frontend tests passed.
- Existing backend suite: 70 tests passed.
- Browser checks used a separate temporary SQLite database and synthetic accounts, never the operator's production data.
- Verified user suspension/reactivation, user pagination/search, ranked configuration saving, challenge creation/publication/closure, result flag/clear/invalidate/restore, FAQ add/remove, content saving and its public contact-page rendering.
- Verified all 28 catalog entries appear in admin and the Tic Tac Toe detail link works.
- Inspected desktop overview and a narrow viewport; navigation wraps and page content fits horizontally.

Counts come from the API, not generated example charts. This is a demo control room, not automatic cheat detection or a replacement for production security monitoring. No new dependency or backend migration is required for this UI change.
