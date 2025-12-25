#!/usr/bin/env node

/**
 * Minimal build script
 *
 * Steps performed:
 * 1. Ensure the build/ directory is empty
 * 2. Validate that each configured source exists
 * 3. Copy configured files/directories into build/
 * 4. Inject version strings into HTML for cache busting
 */

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const outDir = path.join(root, "build");
const pkg = require(path.join(root, "package.json"));

const sources = [
    { type: "file", path: path.join(root, "src", "index.html") },
    { type: "file", path: path.join(root, "src", "styles", "main.css") },
    { type: "file", path: path.join(root, "src", "scripts", "main.js") },
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

function injectVersion(htmlContent) {
    const version = pkg.version;
    return htmlContent
        .replace(/href="styles\/main\.css"/g, `href="styles/main.css?v=${version}"`)
        .replace(/src="scripts\/main\.js"/g, `src="scripts/main.js?v=${version}"`);
}

function copyItem(item) {
    const srcDir = path.join(root, "src");
    const relative = path.relative(srcDir, item.path);
    const destination = path.join(outDir, relative);

    if (item.type === "file") {
        fs.mkdirSync(path.dirname(destination), { recursive: true });

        if (item.path.endsWith(".html")) {
            let content = fs.readFileSync(item.path, "utf8");
            content = injectVersion(content);
            fs.writeFileSync(destination, content, "utf8");
        } else {
            fs.copyFileSync(item.path, destination);
        }
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
