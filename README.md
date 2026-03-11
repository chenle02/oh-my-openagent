# oh-my-openagent (Research Fork)

This is a **fork** of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent) by [@code-yeongyu](https://github.com/code-yeongyu), tailored for **mathematics research workflows**. It extends the upstream plugin with features for AI-assisted paper development, including multi-model orchestration for LaTeX writing and a human-in-the-loop injection mechanism.

**Upstream**: [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)
**This fork**: [chenle02/oh-my-openagent](https://github.com/chenle02/oh-my-openagent)

For the full upstream documentation (agents, hooks, tools, configuration), see the [upstream README](https://github.com/code-yeongyu/oh-my-openagent#readme).

---

## What This Fork Adds

### 1. NOTES.md Human Injection (Hook-Level)

**Problem**: When a worker agent (e.g., GPT 5.4) runs autonomously via `task()`, the user has no way to send directives mid-execution. The session is blocked while the worker operates.

**Solution**: The todo-continuation-enforcer hook now checks for a `NOTES.md` file in the project root on every `session.idle` event. If found, its contents are injected into the continuation prompt as priority directives, then the file is deleted to acknowledge receipt.

**How it works**:

```
Worker (GPT 5.4) is developing your paper, working through TODO items
    |
    v
Worker finishes a TODO item, session goes idle
    |
    v
todo-continuation-enforcer fires:
  1. Checks for incomplete TODOs (existing behavior)
  2. Checks for NOTES.md in project root (NEW)
  3. If NOTES.md exists: reads contents, deletes file
  4. Injects continuation prompt with TODO status + human notes
    |
    v
Worker receives: "Continue working. [HUMAN NOTES]: Focus on Theorem 2.3..."
    |
    v
Worker pivots to follow your directive
```

**Usage**: While a worker agent is running, create `NOTES.md` in your project root:

```bash
echo "The bound in Lemma 3.1 should use Gronwall's inequality, not BDG" > NOTES.md
```

The worker picks this up at the next idle checkpoint (typically between TODO items). The file is consumed (deleted) after injection to prevent re-triggering.

**Two communication channels**:

| File | Recipient | When read | Purpose |
|------|-----------|-----------|---------|
| `Progress.md` > `## Human Notes` | Orchestrator (Opus) | Between rounds | Strategic direction |
| `NOTES.md` | Worker (GPT 5.4) | Within a round, at idle checkpoints | Tactical mid-work directives |

**Changed files**:
- `src/hooks/todo-continuation-enforcer/notes-reader.ts` (new)
- `src/hooks/todo-continuation-enforcer/continuation-injection.ts` (modified)

### 2. `/paper-dev` Command

A goal-driven paper development loop where an orchestrator (Opus 4.6) supervises a worker (GPT 5.4 High) via `task()` delegation. The worker runs autonomously with todo-continuation enforcement, and the orchestrator evaluates results between rounds.

This command lives in `~/.claude/commands/paper-dev.md` (not in this repo). See the [le_claude](https://github.com/chenle02/le_claude) repository for the command source.

### 3. `paper-revision` Custom Category

A custom model category in `oh-my-opencode.json` that maps to `openai/gpt-5.4` with `high` variant, used by `/paper-dev` for worker delegation.

---

## Installation (Local Build)

This fork is installed from a local clone, not from npm. This avoids merge conflicts with upstream when syncing.

```bash
# Clone the fork
git clone git@github.com:chenle02/oh-my-openagent.git ~/oh-my-openagent

# Install dependencies and build
cd ~/oh-my-openagent
bun install
bun run build

# Point OpenCode to the local build
# Edit ~/.config/opencode/opencode.json:
# "plugin": ["/path/to/oh-my-openagent", ...]
```

## Syncing with Upstream

```bash
cd ~/oh-my-openagent
git fetch upstream
git merge upstream/dev
# Resolve conflicts if any (our changes are isolated to notes-reader.ts
# and a small addition in continuation-injection.ts)
bun run build
```

---

## Upstream

All credit for the core plugin goes to [@code-yeongyu](https://github.com/code-yeongyu) and the oh-my-opencode contributors. This fork makes minimal, targeted modifications for research use. See the [upstream repository](https://github.com/code-yeongyu/oh-my-openagent) for the full project.
