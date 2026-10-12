# AI-Assisted Development Guide — SoundSphere

Use AI as a pair programmer and reviewer, not as a substitute for understanding the code.

## 1. Working rules

- Work on one small feature at a time.
- Read the existing files before proposing edits.
- Ask for the smallest coherent patch, not a rewrite of the whole project.
- Preserve current folder structure unless there is a clear reason to change it.
- Do not invent API fields or assume an endpoint exists.
- Check the official API docs for provider-specific behavior.
- Explain trade-offs briefly and identify files changed.
- After code changes, provide manual test steps.
- Do not add dependencies without explaining why they are needed.
- Never paste secrets, tokens, or private data into prompts.

## 2. Prompt template for implementing a feature

```text
You are reviewing the SoundSphere React + Vite project.

Feature:
[Describe one feature and its acceptance criteria.]

Before coding:
1. Inspect the relevant existing files.
2. Explain the smallest implementation plan.
3. Identify edge cases and API assumptions.

Implementation rules:
- Follow docs/CODE_STANDARDS.md.
- Keep logic concise, explicit, and easy to test.
- Avoid unnecessary abstractions and dependencies.
- Keep API calls inside services/.
- Handle loading, empty, error, and missing-field states.
- Do not break existing routes or the shared audio player.
- Do not rewrite unrelated files.

Output:
- List files to create/change.
- Provide complete code for only those files.
- Explain key decisions briefly.
- Give a manual test checklist.
```

## 3. Prompt template for code review

```text
Review this SoundSphere change like a careful senior frontend engineer.

Look for:
- incorrect state ownership or duplicated state,
- stale async requests and missing effect cleanup,
- incorrect API assumptions,
- audio resource/listener leaks,
- localStorage parsing and validation problems,
- accessibility and responsive issues,
- confusing names, duplication, and unnecessary abstractions.

Do not rewrite everything. Rank findings by severity and propose the smallest safe fixes.
```

## 4. Prompt template for debugging

```text
Help debug this SoundSphere issue.

Expected behavior:
[What should happen.]

Actual behavior:
[What happens.]

Error/log:
[Exact error message.]

Relevant files:
[Paste only the related files.]

First explain the likely cause using the actual code. Then suggest the smallest fix. Do not guess API behavior; state what needs to be verified.
```

## 5. Definition of good code

- Another developer can understand the intent without decoding clever tricks.
- Each function has a clear job.
- Data and UI states are explicit.
- Failure paths are designed, not ignored.
- API assumptions are documented.
- Tests or repeatable manual checks exist.
- The code is no more abstract than the problem requires.
