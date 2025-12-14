#!/usr/bin/env node

/**
 * Release script
 * Usage: npm run release -- patch|minor|major|x.y.z
 *
 * Steps performed:
 * 1. Bump the version with npm version (creates commit)
 * 2. Create a release/x.y.z tag
 * 3. Push commit and tag to the configured remote/branch
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const config = {
    allowedBumps: ["patch", "minor", "major"],
    explicitVersionPattern: /^\d+\.\d+\.\d+$/,
    remote: process.env.RELEASE_REMOTE || "origin",
    branch: process.env.RELEASE_BRANCH || "main",
    packagePath: path.join(__dirname, "..", "package.json"),
};

function isValidReleaseArg(arg) {
    if (!arg) {
        return false;
    }

    return (
        config.allowedBumps.includes(arg) || config.explicitVersionPattern.test(arg)
    );
}

function parseReleaseArg() {
    const arg = process.argv[2];
    if (!isValidReleaseArg(arg)) {
        console.error("Usage: npm run release -- patch|minor|major|x.y.z");
        process.exit(1);
    }
    return arg;
}

function run(cmd) {
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (err) {
        console.error(`✖ Command failed: ${cmd}`);
        throw err;
    }
}

function readVersion() {
    const raw = fs.readFileSync(config.packagePath, "utf8");
    return JSON.parse(raw).version;
}

function bumpVersion(releaseArg) {
    run(`npm version ${releaseArg} --message "chore(release): bump to %s"`);
    const version = readVersion();
    console.log(`Version bumped to ${version}`);
    return version;
}

function createReleaseTag(version) {
    const tag = `release/${version}`;
    run(`git tag ${tag}`);
    console.log(`Release tag created: ${tag}`);
    return tag;
}

function pushCommitAndTag(tag) {
    run(`git push ${config.remote} HEAD:${config.branch}`);
    console.log(`Pushed commit to ${config.remote}/${config.branch}`);

    run(`git push ${config.remote} ${tag}`);
    console.log(`Pushed tag ${tag} to ${config.remote}`);
}

function main() {
    try {
        const releaseArg = parseReleaseArg();
        const nextVersion = bumpVersion(releaseArg);
        const tag = createReleaseTag(nextVersion);
        pushCommitAndTag(tag);

        console.log(`Release completed successfully for version ${nextVersion}`);
    } catch (err) {
        console.error("Release process failed");
        if (err.stderr) {
            console.error(err.stderr.toString());
        } else if (err.message) {
            console.error(err.message);
        }
        process.exit(1);
    }
}

main();
