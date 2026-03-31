# Commit & push (safe staging, review, conventional commit)

Use this workflow when the user runs **/commit-push**. Execute it in the project root unless they specify otherwise.

## Goals

1. **Catch mistakes before staging**: surface untracked and modified files that often should not be committed.
2. **Stage everything intentional**: include **all** changes the user wants—**including untracked**—using `git add -A` only after review.
3. **Commit with best-practice messages** (Conventional Commits–style when it fits the repo).
4. **Push** the current branch to `origin` safely (no blind `--force`).

---

## 1. Inspect the working tree

Run and use the output in your reasoning (show the user a concise summary):

```bash
git status -sb
git status --porcelain=v1 -uall
```

Optional (helps spot large accidental adds):

```bash
git diff --stat
git diff --cached --stat
```

If the repo uses **Yarn PnP**, `git add -A` may stage `.pnp.cjs`, `.pnp.loader.mjs`, `.yarn/`, and `yarn.lock`—confirm with the user these are intended if present. If the repo uses **Bun**, the canonical lockfile is **`bun.lock`**; do not commit stray `yarn.lock` / `package-lock.json` unless the team explicitly wants multiple package managers.

---

## 2. “Questionable files” gate (mandatory)

Before **any** `git add`, classify paths into **safe** vs **questionable**.

**Always treat as questionable** (stop and ask the user, one batch or file-by-file for clarity):

- **Secrets & env**: `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, `credentials`, `*.secret`, API keys in filenames.
- **Dependencies & vendor trees**: `node_modules/`, `vendor/` (when not part of the project’s chosen workflow).
- **Build & generated output**: `dist/`, `build/`, `.next/`, `out/`, `coverage/`, `*.tsbuildinfo`, `.turbo/`, `.cache/` (unless the team explicitly commits them—confirm).
- **OS / editor junk**: `.DS_Store`, `Thumbs.db`, `*.swp`, `.idea/` (unless the team commits shared IDE settings on purpose).
- **Duplicate lockfiles**: e.g. both `package-lock.json` and `yarn.lock` when the project standardizes on one package manager—flag it.
- **Large or binary blobs** that look accidental (screenshots, zips, dumps) unless the user asked to commit assets.

For **each questionable path** (or group):

1. **Ask explicitly**: “Do you want to commit `<path>`?”
2. If **no**: offer to **add an appropriate ignore rule** to `.gitignore` (or an existing ignore file). Only edit `.gitignore` after the user confirms.
3. If **yes**: proceed, but note *why* in the commit message body if it is unusual (e.g. “check in Yarn releases”).

Do **not** run `git add -A` until questionable items are resolved or explicitly overridden by the user.

---

## 3. Stage all intended changes

When (and only when) the user has confirmed what to include:

```bash
git add -A
```

Then show:

```bash
git diff --cached --stat
```

If the staged set still contains something the user did not intend, stop and fix staging (`git restore --staged …` / `git reset`) before committing.

---

## 4. Optional quality gate (if scripts exist)

If `package.json` defines them, run **as appropriate** (do not invent new scripts):

- Prefer `bun run lint` / `npm run lint` / `yarn lint` (match `package.json` / lockfile).
- Prefer `bun test` / `npm test` / `yarn test` if present and fast.

If a check fails, **do not commit** until the user fixes or explicitly chooses to commit anyway (warn them).

---

## 5. Commit message (best practices)

- Use **Conventional Commits** when it matches the project: `type(scope): summary`
  - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`.
- **Subject line**
  - ≤ **72** characters.
  - **Imperative** mood: “add”, “fix”, not “added”, “fixed”.
  - **No trailing period**.
  - Capitalize the first word of the summary.
- **Body** (optional but encouraged for non-trivial changes): what changed and **why**, wrapped at ~72 cols.

Examples:

- `fix(auth): handle refresh token expiry`
- `chore: add commit-push Cursor command`
- `feat(ui): add loading state to submit button`

If the branch name contains a ticket/issue (e.g. `PROJ-123`, `#456`), ask if the user wants it in the subject or body.

**Do not** commit with a meaningless message like “updates” or “fix stuff”.

---

## 6. Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <short summary>

<longer explanation if needed>
EOF
)"
```

(Use a single `-m` with a clear subject; add a second `-m` for body if your environment prefers.)

---

## 7. Push

1. Confirm branch name: `git branch --show-current`
2. Push upstream:

```bash
git push -u origin HEAD
```

If the push is rejected:

- Prefer `git pull --rebase` (or `git fetch` + `git rebase`) and resolve conflicts, then push again.
- Use **`--force-with-lease`** only if the user explicitly requests a force push after a rebase they understand; never suggest blind `--force`.

---

## 8. Report back

Summarize for the user:

- What was staged (high level).
- Final commit SHA and message.
- Remote branch and push result.

If anything was added to `.gitignore`, mention the exact rules added.
