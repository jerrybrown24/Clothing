---
name: reflect
description: Learn from the current session or review recent logs. Updates the user's profile, vision, corrections and best-practices memory, and proposes improvements to the agent itself. Use at end of session, or weekly.
---
# Reflect

## Session mode (default)
1. Review the conversation. Extract: corrections the user made, things they rejected/accepted, phrasing and
   reasoning patterns, stated goals/principles, assumptions they left implicit, where the agent erred.
2. Append the raw notes to `memory/log/<today>.md`.
3. Update memory files with evidence-backed entries (date, observation, evidence, confidence):
   - `profile.md` — thinking model, prompting style, decision habits, strengths, blind spots
   - `vision.md` — goals, principles, non-negotiables
   - `corrections.md` — "don't do X / do Y" rules from direct feedback
   - `best-practices.md` — practices that came up, with source or reasoning, and whether the user adopted them
4. Show the user a short diff-style summary: **Learned / Updated / Removed**. Ask them to confirm or correct.

## Weekly mode (when asked, or if log has 5+ entries since last review)
1. Read all of `memory/log/` since the last review.
2. Merge duplicates, raise confidence on repeated patterns, delete stale or contradicted entries.
3. Evaluate yourself: where did the user have to correct you repeatedly? Which suggestions did they accept
   versus reject? Which coaching was useful?
4. Write concrete improvements to `memory/proposals.md` (changes to CLAUDE.md, skills, or workflow) with the
   evidence for each. Do NOT apply them; the user approves.
5. Give the user a "growth report": patterns improving in their prompting/thinking, 1-3 focus areas.
