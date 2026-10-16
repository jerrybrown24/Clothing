#!/usr/bin/env bash
# Mentor — always-on, self-learning & self-improving layer for Claude Code.
# Install:   bash install-mentor.sh          Uninstall: bash install-mentor.sh --uninstall
# Everything lives in ~/.claude/mentor (memory is plain markdown you own). Nothing leaves your machine.
set -euo pipefail
CLAUDE_DIR="${CLAUDE_HOME:-$HOME/.claude}"
M="$CLAUDE_DIR/mentor"; BEGIN="<!-- MENTOR:BEGIN -->"; END="<!-- MENTOR:END -->"
command -v python3 >/dev/null || { echo "python3 is required (used by the hooks)"; exit 1; }

strip_block() { # remove marked block from CLAUDE.md
  [ -f "$CLAUDE_DIR/CLAUDE.md" ] && python3 - "$CLAUDE_DIR/CLAUDE.md" "$BEGIN" "$END" <<'PY'
import sys,re
p,b,e=sys.argv[1:4]; s=open(p).read()
s=re.sub(re.escape(b)+r".*?"+re.escape(e)+r"\n?","",s,flags=re.S); open(p,"w").write(s)
PY
  return 0
}
edit_settings() { # $1 = add|remove
python3 - "$CLAUDE_DIR/settings.json" "$M" "$1" <<'PY'
import sys,json,os
p,m,mode=sys.argv[1:4]
d=json.load(open(p)) if os.path.exists(p) and os.path.getsize(p) else {}
h=d.setdefault("hooks",{})
def clean(ev):
    h[ev]=[g for g in h.get(ev,[]) if not any("/mentor/hooks/" in x.get("command","") for x in g.get("hooks",[]))]
for ev in ("SessionStart","Stop"): clean(ev)
if mode=="add":
    h["SessionStart"].append({"hooks":[{"type":"command","command":f"python3 {m}/hooks/session_start.py"}]})
    h["Stop"].append({"hooks":[{"type":"command","command":f"python3 {m}/hooks/stop.py"}]})
for ev in list(h):
    if not h[ev]: del h[ev]
if not h: d.pop("hooks",None)
json.dump(d,open(p,"w"),indent=2)
PY
}

if [ "${1:-}" = "--uninstall" ]; then
  strip_block; edit_settings remove
  echo "Mentor hooks and instructions removed. Memory kept at $M/memory (delete it to erase everything)."; exit 0
fi

mkdir -p "$M/hooks" "$M/memory/log" "$M/state"
[ -f "$CLAUDE_DIR/settings.json" ] && cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.mentor-backup"

# ---------- seed memory (never overwrites existing memory) ----------
seed() { [ -f "$M/memory/$1" ] || cat > "$M/memory/$1"; }
seed profile.md <<'EOF'
# User Profile (learned)
_Entry format: date · observation · evidence · confidence(low/med/high). Guesses marked (inferred)._
## Thinking model
## Prompting style
## Decision habits
## Strengths
## Blind spots / growth areas
EOF
seed vision.md <<'EOF'
# Vision & Principles (learned)
## Goals
## Principles
## Non-negotiables
EOF
seed corrections.md <<'EOF'
# Corrections & Preferences
_Direct feedback outranks any learned pattern. Format: Don't X / Do Y · date · evidence_
EOF
seed best-practices.md <<'EOF'
# Best Practices (curated)
_practice · why · source/reasoning · adopted by user? (y/n/unknown)_
## Prompting
- State goal, context, constraints and success criteria up front · cuts ambiguity · general · unknown
- Give an example of good output when style matters · anchors format · general · unknown
## Thinking
- Separate facts, assumptions and decisions · exposes hidden risk · general · unknown
- Define "done" before starting · prevents scope drift · general · unknown
- Seek the strongest counter-argument to your own plan · general · unknown
EOF
seed proposals.md <<'EOF'
# Proposals to improve the mentor itself (need user approval)
_None yet._
EOF

# ---------- always-on instructions ----------
cat > "$M/instructions.md" <<'EOF'
# Mentor (always on — no command needed)
You are also this user's self-learning thinking partner. Memory lives in ~/.claude/mentor/memory/
(profile.md, vision.md, corrections.md, best-practices.md, proposals.md, log/). The SessionStart hook shows
you its contents. Apply it silently on every task: mirror the user's reasoning style and prompt conventions,
and steer toward their vision.

ALIGN, THEN CHALLENGE
- Follow intent first; never override their approach silently.
- When their approach conflicts with best practice, hides a risk, or a clearly better option exists, say so in
  one short block: **Suggestion** … **Why** … **Your call.** Then do what they decide. Be honest over agreeable.
- Don't nitpick or re-argue decided points; record decisions in corrections.md.
- If intent is unclear, state your assumption and proceed unless being wrong is costly; then ask one question.

COACH
- After a task, when a prompt was ambiguous/underspecified in a way that cost accuracy, add ONE line:
  "Prompt tip: …" with a sharper phrasing in their voice. Also reinforce strengths in their thinking. Be sparing.

LEARN CONTINUOUSLY (this is automatic, not on request)
- Signals worth recording: corrections, rejections/acceptances, repeated phrasings, how they decompose problems,
  unstated assumptions, goals, preferences, and where YOU erred.
- When a "Mentor: update memory" instruction arrives from the Stop hook, silently update the memory files with
  Edit/Write tools (evidence-backed entries: date · observation · evidence · confidence) and append raw notes to
  memory/log/<today>.md. Do not narrate it; at most one short line like "Noted: …" if something significant changed.
- If memory is empty, learn passively; ask at most one or two natural questions (goals, how they like to think)
  once, at a sensible moment, never as an interrogation.
- When the SessionStart hook says a weekly review is due, do it: merge duplicates, raise confidence on repeated
  patterns, delete stale/contradicted entries, grade your own mistakes, write improvements to proposals.md, then
  give a brief growth report (what's improving in their prompting/thinking + 1–3 focus areas).

GUARDRAILS
- Learn only from evidence. Direct corrections outrank learned patterns. Mark inferences (inferred).
- Never edit hook scripts, this file, or settings; propose changes in proposals.md and ask the user to approve.
- No secrets or sensitive personal data in memory. Keep memory concise.
- User controls: "show memory", "edit memory", "forget X", "reset memory", "pause mentor" — obey immediately.
EOF

# ---------- hooks ----------
cat > "$M/hooks/session_start.py" <<'EOF'
#!/usr/bin/env python3
"""SessionStart: inject mentor instructions + memory into context; flag weekly review when due."""
import os, sys, time, glob
M = os.path.expanduser(os.path.join(os.environ.get("CLAUDE_HOME", "~/.claude"), "mentor"))
if os.path.exists(os.path.join(M, "state", "paused")): sys.exit(0)
def rd(p, lim):
    try: return open(p).read()[:lim]
    except Exception: return ""
out = ["[MENTOR — always-on]\n", rd(os.path.join(M, "instructions.md"), 6000)]
for n in ("profile", "vision", "corrections", "best-practices"):
    out.append(f"\n--- memory/{n}.md ---\n" + rd(os.path.join(M, "memory", n + ".md"), 4000))
state = os.path.join(M, "state", "last_review")
last = os.path.getmtime(state) if os.path.exists(state) else 0
logs = glob.glob(os.path.join(M, "memory", "log", "*.md"))
if logs and time.time() - last > 7 * 86400:
    out.append("\nMENTOR: weekly review is DUE. Do it early in this session (see instructions), then run "
               f"`touch {state}`.")
print("".join(out))
EOF
cat > "$M/hooks/stop.py" <<'EOF'
#!/usr/bin/env python3
"""Stop: every N assistant turns, ask Claude to silently update mentor memory. Loop-safe."""
import os, sys, json
M = os.path.expanduser(os.path.join(os.environ.get("CLAUDE_HOME", "~/.claude"), "mentor"))
N = int(os.environ.get("MENTOR_EVERY", "4"))
if os.path.exists(os.path.join(M, "state", "paused")): sys.exit(0)
try: d = json.load(sys.stdin)
except Exception: sys.exit(0)
if d.get("stop_hook_active"): sys.exit(0)          # never loop
sid = str(d.get("session_id", "x")).replace("/", "_")
f = os.path.join(M, "state", f"turns_{sid}")
try: n = int(open(f).read()) + 1
except Exception: n = 1
open(f, "w").write(str(n))
if n % N == 0:
    print(json.dumps({"decision": "block", "reason":
        "Mentor: update memory. Silently review the recent exchange for learnable signals (corrections, "
        "accept/reject patterns, phrasing and reasoning habits, goals, assumptions, your own errors). Edit "
        "~/.claude/mentor/memory/*.md with evidence-backed entries (date · observation · evidence · confidence) "
        "and append raw notes to memory/log/<today>.md. If nothing new, do nothing. Do not narrate; at most one "
        "short 'Noted: …' line if something significant changed."}))
EOF

# ---------- wire into Claude Code ----------
touch "$CLAUDE_DIR/CLAUDE.md"; strip_block
{ echo "$BEGIN"; echo "See also the always-on mentor behavior below (managed by install-mentor.sh)."; cat "$M/instructions.md"; echo "$END"; } >> "$CLAUDE_DIR/CLAUDE.md"
edit_settings add
echo "Mentor installed. Start any new Claude Code session — it now loads your memory and learns automatically."
echo "Memory: $M/memory   |  Pause: touch $M/state/paused   |  Uninstall: bash $0 --uninstall"
