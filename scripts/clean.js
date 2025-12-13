#!/usr/bin/env node

/**
 * Removes the generated build directory.
 */

const fs = require("node:fs");
const path = require("node:path");

const buildDir = path.join(process.cwd(), "build");

try {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log("Cleaned build directory");
} catch (err) {
    console.error("Failed to clean build directory");
    console.error(err);
    process.exit(1);
}
