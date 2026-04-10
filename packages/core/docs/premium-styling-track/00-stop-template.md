# STOP Template

Every wave in the premium styling track (H0-H5, I0-I7) must deliver a
STOP packet in this format before Codex audit.

## Required Fields

```
## STOP -- Wave {ID}: {Title}

### Commit(s)
| Repo | Hash | Message |
|------|------|---------|
| ... | ... | ... |

### Files Changed
- list every file touched

### Decisions Taken
- list each decision, using frozen vocabulary from 00-glossary.md

### What Remains Intentionally Deferred
- list what this wave explicitly leaves for later

### Verification
| Check | Result |
|-------|--------|
| DS typecheck | ... |
| DS build | ... |
| lint:folders | ... (if folders moved) |
| app-platform typecheck | ... (if public imports changed) |
| tests | ... (count + pass/fail) |

### Codex Audit Questions (self-check)
1. Did naming become more or less declarative?
2. Did a folder gain a single clear role or stay mixed?
3. Did compatibility remain explicit?
4. Did any first-party brand lose expressive power?
5. Did the wave stay inside its scope?

### Request
Codex: please audit Wave {ID} before I continue.
```

## Documentation Waves (H0-H5)

Documentation waves touch docs only. Verification is:
- No code changes
- Vocabulary consistent with 00-glossary.md
- Reading order preserved

## Implementation Waves (I0-I7)

Implementation waves must include full verification:
- typecheck
- build
- lint:folders (if ownership boundaries touched)
- app-platform typecheck (if public exports changed)
- targeted tests
