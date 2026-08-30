# GradeOwl Web

Teacher-facing Next.js client for the GradeOwl assessment workflow: exam setup,
rubric review, submission upload, grading review, and results.

## Local stack

This app runs on port 3000 and normally talks to the GradeOwl backend on port
8000 through the server-side proxy. Install dependencies and start the client:

```bash
npm ci
npm run dev
```

Set `API_URL` to the backend URL when it is not `http://localhost:8000`. The
browser must call `/api/proxy/[...path]`, not the backend directly. The proxy
reads the backend JWT from httpOnly cookies, attaches it server-side, and keeps
backend tokens out of client-side JavaScript.

Firebase sign-in exchanges an ID token through `/api/auth/token`; the resulting
access and refresh tokens are stored in httpOnly cookies. The local dev-login
route is disabled unless both `APP_ENV=development` and a truthy
`DEV_AUTH_BYPASS` are set, and it always requires an explicit `email` query
parameter. Do not enable the bypass outside an isolated local demonstration.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Playwright tests require explicitly configured compatible local Web and backend
services; do not start or deploy external systems only to run them.

## Deployment

The active MVP deployment target is AWS ECS/Fargate behind the parent
workspace's ALB. The production web URL is `https://gradeowl.neuraconcept.com`
and the backend URL is `https://api.neuraconcept.com`. Use the parent workspace
AWS MVP deployment and readiness workflows for release operations.

`.github/workflows/deploy.yml` is retained only as the manually dispatched
**Legacy Cloud Run rollback** workflow. It has no automatic trigger and is not
the AWS MVP deployment path.
