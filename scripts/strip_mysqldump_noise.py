"""Remove mysqldump comments, LOCK/UNLOCK, and DISABLE/ENABLE KEYS lines.

Reads UTF-16 LE (BOM) or UTF-8; writes UTF-8 LF. Safe for InnoDB WordPress dumps.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

DISABLE_ENABLE = re.compile(
    r"^\s*/\*!40000 ALTER TABLE `[^`]+` (DISABLE|ENABLE) KEYS \*/;\s*$"
)


def read_sql(path: Path) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
        return raw.decode("utf-16")
    return raw.decode("utf-8")


def strip_lines(text: str) -> str:
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    for line in lines:
        s = line.strip()
        if s.startswith("--"):
            continue
        if s.startswith("LOCK TABLES"):
            continue
        if s == "UNLOCK TABLES;":
            continue
        if DISABLE_ENABLE.match(line):
            continue
        out.append(line)
    raw = "".join(out)
    raw = re.sub(r"(\r?\n){3,}", "\n\n", raw)
    if not raw.endswith("\n"):
        raw += "\n"
    return raw


def main() -> None:
    path = Path(__file__).resolve().parents[1] / "docker" / "mysql" / "blog_db.sql"
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
    text = read_sql(path)
    path.write_text(strip_lines(text), encoding="utf-8", newline="\n")
    print(f"Stripped: {path}")


if __name__ == "__main__":
    main()
