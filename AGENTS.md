# Maintaining implementation guidance

Read docs/implementation-guide.md and docs/implementation-pitfalls.md when implementing or clarifying renderer behavior.

When a task reveals a commonly overlooked semantic, usability, presentation, accessibility or performance distinction, update the relevant spec rule and pitfalls entry as appropriate. Add a framework-neutral acceptance case or example when practical. Do not catalogue ordinary coding mistakes. Preserve functional parity across ports without requiring identical code or pixels; explicitly document platform limitations and unverified support. Do not describe a behavior vector as an executed renderer test unless an adapter ran it.
