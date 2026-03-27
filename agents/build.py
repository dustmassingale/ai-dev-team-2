#!/usr/bin/env python3
"""
build.py — Assembles all source files into a single index.html SPA.

Usage:
    python build.py

Output:
    index.html (in the project root)
"""

import json
import os
from typing import Any, Dict, List


def read(path: str) -> str:
    """Read file content as string."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def read_json(path: str) -> Dict[str, Any]:
    """Read and parse JSON file content."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}


def write(path: str, content: str) -> None:
    """Write file content."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def get_files_in_directory(directory: str) -> List[str]:
    """Get all files in a directory recursively."""
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, directory)
            files.append(rel_path)
    return sorted(files)


def bundle_assets() -> str:
    """Bundle all modular JS and CSS files into index.html."""

    # Read existing index.html structure
    base_html = read("index.html")

    # Find all JS files in lib directory
    js_files = get_files_in_directory("lib/js")
    css_files = get_files_in_directory("lib/css")

    # Build script tags for dependencies
    dependency_scripts = []
    dependency_styles = []

    for js_file in sorted(js_files):
        if js_file.endswith(".js"):
            rel_path = f"lib/{os.path.basename(os.path.dirname(js_file))}/{os.path.basename(js_file)}"
            dependency_scripts.append(f'<script src="{rel_path}"></script>')

    for css_file in sorted(css_files):
        if css_file.endswith(".css"):
            rel_path = f"lib/{os.path.basename(os.path.dirname(css_file))}/{os.path.basename(css_file)}"
            dependency_styles.append(f'<link rel="stylesheet" href="{rel_path}">')

    # Build the bundled HTML
    bundled_html = base_html

    # Add dependencies before closing head tag (find it and insert)
    if "<head>" in bundled_html:
        head_start = bundled_html.index("<head>") + len("<head>")
        head_end = bundled_html.find("</head>", head_start)

        deps_html = "\n".join(dependency_styles) + "\n" + "\n".join(dependency_scripts)

        # Insert dependencies after :root styles
        insert_pos = bundled_html.find("  :root", head_start)
        if insert_pos != -1:
            bundled_html = (
                bundled_html[:insert_pos] + deps_html + bundled_html[insert_pos:]
            )

    return bundled_html


def main():
    """Main entry point."""
    print("Starting build process...")

    try:
        # Bundle all assets into index.html
        bundled_content = bundle_assets()

        # Write the bundled content back to index.html
        write("index.html", bundled_content)

        print("Build completed successfully!")
        print(
            f"Updated index.html with {len(get_files_in_directory('lib/js'))} JS files and {len(get_files_in_directory('lib/css'))} CSS files"
        )

    except Exception as e:
        print(f"Build failed: {e}")
        raise


if __name__ == "__main__":
    main()
