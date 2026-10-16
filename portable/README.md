# Mentor — always-on self-learning layer

## Claude Code (fully automatic)
    bash install-mentor.sh
Then just use Claude Code normally. No commands needed:
- SessionStart hook loads your memory + the mentor behavior into every session.
- Every 4th turn a Stop hook makes Claude silently update memory (set MENTOR_EVERY=N to change).
- Weekly, it reviews its own mistakes, merges/prunes memory, proposes self-improvements (you approve), and gives a growth report.
Pause: `touch ~/.claude/mentor/state/paused` · Uninstall: `bash install-mentor.sh --uninstall` (memory is kept).
Review hook code before installing: it only reads/writes ~/.claude/mentor and runs locally.

## claude.ai (semi-automatic)
Paste `claude-ai-custom-instructions.txt` into Settings -> Profile -> personal preferences (or a Project's instructions).
No file/hook access there, so it hands you a memory block to save and paste back.
