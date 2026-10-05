## Git

- Only commit or push changes when explicitly requested.
- Before committing, inspect the exact diff and perform a secret scan.
- Write concise, direct commit messages that clearly describe what changed.
- Keep commit subjects natural and human-readable.
- Do not use conventional commit prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `perf:`, or `test:`.
- Avoid vague or generic messages such as `changes`, `updates`, `fix stuff`, or `AI changes`.

## Commit Attribution

- AI agents MUST NOT add `Co-Authored-By` trailers to commits.
- AI agents MUST NOT include their model name, agent name, vendor name, or other AI attribution in commit messages.
- All commits MUST use the user's existing Git author and committer identity.
- NEVER modify `user.name` or `user.email`.
- Do not add `Co-authored-by`, `Co-Authored-By`, or any equivalent attribution trailer unless explicitly requested by the user.
- Before committing, verify that the commit message contains no AI attribution trailer.

## Commit Message Style

- Write commit messages as a developer would naturally describe the change.
- Use a single concise subject line by default.
- Describe the primary user-facing or code-level change directly.
- Do not use conventional commit prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `perf:`, or `test:`.
- Do not automatically add bullet points, summaries, implementation details, or a commit body.
- Add a commit body only when the change is complex enough that the subject alone cannot reasonably explain it.
- Keep the subject specific, concise, and natural.
- Avoid vague, generic, robotic, or overly polished wording.
- Do not mention AI assistance, prompts, agents, models, or automated generation unless explicitly requested.