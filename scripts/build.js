#!/usr/bin/env node

/**
 * Minimal build for a static HTML site.
 * Copies index.html into /build.
 */

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const outDir = path.join(root, "build");

function ensureEmptyDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

try {
    ensureEmptyDir(outDir);

    const src = path.join(root, "index.html");
    const dst = path.join(outDir, "index.html");

    if (!fs.existsSync(src)) {
        console.error("✖ Build failed: index.html not found at project root");
        process.exit(1);
    }

    fs.copyFileSync(src, dst);

    console.log("✔ Build completed successfully");
    console.log(`→ Output folder: ${outDir}`);
} catch (err) {
    console.error("✖ Build failed");
    console.error(err);
    process.exit(1);
}
