const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..'); // The root of your scheduler project

const config = getDefaultConfig(projectRoot);

// 1. Only watch the mobile app folder (ignore the root)
config.watchFolders = [projectRoot];

// 2. Force Metro to only look at its own node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
];

// 3. Block the root node_modules so they can't "leak" in
config.resolver.blockList = [
    new RegExp(`${path.resolve(workspaceRoot, 'node_modules')}/.*`),
];

// 4. Ensure Firebase always resolves to the local mobile version
config.resolver.extraNodeModules = {
    firebase: path.resolve(projectRoot, 'node_modules/firebase'),
};

module.exports = config;
