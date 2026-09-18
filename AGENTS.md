# AGENTS.md (workspace root)

Actual app lives in `rnbguj/` (Next.js root: `C:\rnbguj\rnbguj`).

Full fast-run instructions: see `rnbguj/AGENTS.md` — read that file first.

Short version:
1. `workdir` must always be `C:\rnbguj\rnbguj`.
2. Check `http://localhost:3000` with `Invoke-WebRequest` before starting anything — 200 means done.
3. Never `npm install` if `rnbguj/node_modules/.bin/next.cmd` exists. Run `npm run dev -- --port 3000`.
4. `EADDRINUSE` = already running. Never use `Start-Process "npm"` on Windows.
