# Contributing to KDS Platform 🚀

Thanks for contributing! Here's how to get started.

## Quick Start

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/KDSAIDEV.git
cd KDSAIDEV

# Install deps
npm install

# Start dev server
npm run dev

# Before committing — always run these
npm run lint
npx tsc --noEmit --skipLibCheck
npm run build
```

## Branch Naming

| Pattern | Example |
|---------|---------|
| `feat/description` | `feat/user-auth` |
| `fix/description` | `fix/header-layout` |
| `docs/description` | `docs/api-reference` |
| `chore/description` | `chore/update-deps` |
| `ci/description` | `ci/add-deploy-pipeline` |

## Commit Messages

We use conventional commits:

```
feat: add 3D hero animation
fix: resolve mobile navigation overlap
docs: update API reference
chore: bump dependencies
ci: add CodeQL security scanning
```

## Before You Push (Required)

```bash
make lint        # ESLint check
make typecheck   # TypeScript type check
make build       # Production build
```

**All three must pass.** The CI pipeline will reject PRs that don't.

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run the checks above
4. Push and open a PR
5. Fill out the PR template — it's there for a reason
6. Get at least one review before merging
7. Squash merge with a descriptive message

## Code Standards

- **TypeScript** — strict mode, no `any` without justification
- **Components** — functional with hooks, no class components
- **Styling** — Tailwind CSS, no inline styles unless dynamic
- **Imports** — use `@/` path aliases, sort imports
- **Error handling** — no silent failures, add proper error boundaries
- **Environment variables** — never commit `.env` files, use `.env.example`

## Project Structure

```
KDSAIDEV/
├── src/
│   ├── app/          # Next.js app router (if migrated)
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities, API clients
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
├── .github/          # CI/CD workflows, templates
└── Makefile          # Developer commands
```

## CI/CD Pipeline

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Every PR | Lint, type-check, build |
| `deploy.yml` | Push to main | Build → deploy to Hostinger |
| `release.yml` | Version bump | Tag & create GitHub release |
| `codeql.yml` | Weekly + PRs | Security analysis |
| `stale.yml` | Daily | Auto-close stale issues/PRs |

## Environment Variables

See `.env.example` for required variables. Add yours to a local `.env` file — **never commit it**.

## Need Help?

- Open an issue — use the templates, they exist for a reason
- Check existing issues and PRs first
- Be specific. "It's broken" is not helpful.

---

**The Kings Drippin' Swag — The Future Is Now.** 💧
