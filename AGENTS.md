# AGENTS.md: maso-tech/payhook-acme-extension

<!-- org-cli:start -->
## Use the Masotech CLIs: `slowed` and `payhook`

Agents reach the Masotech services (console.slowed.app, Lilo, Payhook,
console.payhook.link, *.maso.tec.br) through two CLIs. Do not use `aws`,
DynamoDB, GA4, Sentry, Stripe or `scripts/*.js --live` for anything they do.

- **`slowed`** (repo `maso-tech/slowed-cli`, checkout
  `~/Repositories/maso-technologies/slowed-cli`) covers Slowed analytics,
  every console view, Lilo's workflows and the Payhook funnel. Start with
  `slowed report`.
- **`payhook`** (repo `maso-tech/payhook-cli`, checkout
  `~/Repositories/maso-technologies/payhook-cli`) covers:
  - workspace settings as code: `payhook pull` → edit → `payhook diff` →
    `payhook push --yes`, but push only once the user approves the change;
  - console.payhook.link: `payhook console …`.
- **Logins are the user's.** Hand them `slowed login`, `payhook login` or
  `payhook console login`.
- **When a command is missing or broken:**
  1. Fix the CLI in its checkout and run its tests.
  2. Commit and push to main.
  3. Run the command again.

  A change in this repo that adds a console route, setting or workflow needs
  the matching CLI command in the same piece of work.
<!-- org-cli:end -->
