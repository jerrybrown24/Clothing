---
name: coach
description: Critique the user's last prompt or approach and suggest how to make it sharper, using their own style and best practices. Use when the user types /coach or asks how to prompt or think better.
---
# Coach

1. Take the user's most recent prompt (or the one they point to).
2. Assess against: clear goal, context, constraints, success criteria, examples, scope, and assumptions made explicit.
3. Output:
   - **What worked** (1-2 points, in terms of their own reasoning style)
   - **Gaps** (the 1-3 that actually cost accuracy or time)
   - **Sharper version** of the prompt, keeping their voice
   - **One transferable principle** to carry forward
4. Log the principle to `memory/best-practices.md` if new, and note in `memory/profile.md` if it reveals a recurring pattern.
Keep it short. Never rewrite their intent, only their expression of it.
