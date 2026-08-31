# Tasks 9–10 implementation notes

## Task 9 — exam activity feed

- Added the `/exams/[id]/activity` view and an Activity link beside the exam status.
- The TanStack Query hook uses the real proxy route: `GET /api/proxy/exams/{id}/activity?limit=50`.
- The page shows newest-first actor, curated summary, action, and relative time, with loading, empty, and retryable error states.
- The activity type uses `actor_name`, matching the existing Flutter activity screen's response consumption.

## Task 10 — concept diagnosis to action

- Added a `Concept actions` tab on exam results. Each card shows weak-concept evidence, a prerequisite trace, an explicit root cause, and one approvable next step.
- `lib/concepts/prerequisite-trace.ts` follows `from_id` (dependent) to `to_id` (prerequisite), limits traversal to two hops, uses a visited set for cycles, skips dangling nodes, and chooses higher-confidence candidates first.
- Foundational concepts render `This is a foundational concept — no upstream gap.` and still receive a concrete small-group action.

### Mocked versus real

- **Real:** Task 9 calls the production-ready activity endpoint through the existing httpOnly-cookie API proxy.
- **Mocked for now:** Task 10 is intentionally fixture-backed in `lib/concepts/fixture.ts`; `useConceptActions` is the marked adapter boundary. Its approval state is local to the current review and is visibly labelled as such.
- When Tasks 6–8 publish their final API contract, replace only the `queryFn` in `lib/api/hooks/use-concept-actions.ts` with the proxy-backed request and retain the component/type boundary.

## Browser screenshots

- `output/playwright/task-9-activity.png`
- `output/playwright/task-10-concept-actions-approved.png`
- `output/playwright/task-10-foundational-action.png`

Browser verification used the local Next.js app with isolated Playwright route mocks for unavailable local backend data. No application API or backend state was changed.
