#!/usr/bin/env node

/**
 * Minimal build script
 *
 * Steps performed:
 * 1. Ensure the build/ directory is empty
 * 2. Validate that each configured source exists
 * 3. Copy configured files/directories into build/
 */

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const outDir = path.join(root, "build");
const sources = [
    { type: "file", path: path.join(root, "index.html") },
];

function ensureEmptyDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function validateSource(item) {
    if (!fs.existsSync(item.path)) {
        throw new Error(`Source not found: ${item.path}`);
    }
}

function copyItem(item) {
    const relative = path.relative(root, item.path);
    const destination = path.join(outDir, relative);

    if (item.type === "file") {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(item.path, destination);
    } else if (item.type === "dir") {
        fs.cpSync(item.path, destination, { recursive: true });
    } else {
        throw new Error(`Unknown source type: ${item.type}`);
    }
}

function main() {
    sources.forEach(validateSource);
    ensureEmptyDir(outDir);
    sources.forEach(copyItem);

    console.log("Build completed successfully");
    console.log(`Output folder: ${outDir}`);
}

try {
    main();
} catch (err) {
    console.error("Build failed");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
}
