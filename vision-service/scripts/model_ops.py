#!/usr/bin/env python3
"""CLI utility for Vision AI Model Operations and Integrity Auditing."""

import argparse
import json
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.services.model_manager import ModelManager


def print_table(rows, headers):
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(val)))

    header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
    separator = "-+-".join("-" * col_widths[i] for i in range(len(headers)))
    print(header_line)
    print(separator)
    for row in rows:
        print(" | ".join(str(val).ljust(col_widths[i]) for i, val in enumerate(row)))


def cmd_verify(args):
    manager = ModelManager(models_dir=PROJECT_ROOT / "models")
    print(f"=== Auditing Vision AI Models (Registry v{manager.registry_data.get('version', 'unknown')}) ===")
    results = manager.verify_all(only_active=not args.all, check_hashes=not args.fast)

    rows = []
    all_ok = True
    for key, data in results.items():
        status = "PASSED" if data["valid"] else "FAILED"
        if not data["valid"]:
            all_ok = False
        size_mb = f"{data['size_bytes'] / (1024 * 1024):.1f} MB" if data["exists"] else "N/A"
        active = "Yes" if data["active_runtime"] else "No"
        rows.append([key, data["name"], data["format"], active, size_mb, status, data["message"]])

    print_table(rows, ["Key", "Model Name", "Format", "Active", "Size", "Status", "Details"])
    print()

    if all_ok:
        print("[SUCCESS] All audited model artifacts are present and mathematically valid.")
        return 0
    else:
        print("[ERROR] One or more model artifacts failed verification!", file=sys.stderr)
        return 1


def cmd_info(args):
    manager = ModelManager(models_dir=PROJECT_ROOT / "models")
    print(json.dumps(manager.registry_data, indent=2, ensure_ascii=False))
    return 0


def main():
    parser = argparse.ArgumentParser(description="Foodee Vision Model Operations CLI")
    subparsers = parser.add_subparsers(dest="command")

    # verify
    verify_p = subparsers.add_parser("verify", help="Verify model existence, size, and SHA256 hashes")
    verify_p.add_argument("--all", action="store_true", help="Audit all registered models, not just active runtime")
    verify_p.add_argument("--fast", action="store_true", help="Skip SHA256 checksum recalculation")

    # info
    subparsers.add_parser("info", help="Print model registry metadata JSON")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return 1

    if args.command == "verify":
        return cmd_verify(args)
    elif args.command == "info":
        return cmd_info(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
