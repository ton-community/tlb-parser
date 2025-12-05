#!/usr/bin/env node

import fs from 'fs';
import util from 'util';

import { ast, counterASTNodes } from './lib';

if (process.argv[2] === '--help' || process.argv[2] === '-h' || process.argv[2] === 'help') {
    help();
    process.exit(0);
}

const inputPath = process.argv[2];
if (!inputPath) {
    // eslint-disable-next-line no-console
    console.error('No input file');
    help();
    process.exit(1);
}

if (!fs.existsSync(inputPath)) {
    // eslint-disable-next-line no-console
    console.error('Input file does not exist');
    process.exit(1);
}

const input = fs.readFileSync(inputPath, 'utf-8');
const tree = ast(input);
// eslint-disable-next-line no-console
console.log(util.inspect(tree, { showHidden: false, depth: null, colors: true }));
const counter = counterASTNodes(tree);
// eslint-disable-next-line no-console
console.log(util.inspect(counter.nodes, { showHidden: false, depth: null, colors: true }));

function help() {
    // eslint-disable-next-line no-console
    console.log('Usage: tlb-parser <input>');
    // eslint-disable-next-line no-console
    console.log('  input: input file');
}
