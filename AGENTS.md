# AGENTS.md

## Cursor Cloud specific instructions

State of the repository (as of environment setup):

- `vassal` is currently a **placeholder repository**. The only tracked files are
  `README.md` (a one-line tagline) and `LICENSE`.
- There is **no application code**, **no dependency manifest** (no `package.json`,
  `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.), **no lockfiles**, and **no
  services** to run.
- As a result there is nothing to install, build, lint, test, or run yet. Any
  setup/update script is a no-op until real project code and a dependency
  manifest are committed.

Toolchains available on the base VM image (for whenever code is added): Node.js
(`node -v`), Python 3 (`python3 --version`), Go (`go version`), and Rust
(`rustc --version`).

When application code and a dependency manifest are introduced, update the
environment update script (via the SetupVmEnvironment flow) to install those
dependencies, and replace this note with real service/run/test instructions.
