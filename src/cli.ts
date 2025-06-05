#!/usr/bin/env node

import fs from 'fs';
import util from 'util';

import { ast, NodeVisitor, ASTRootBase } from './index';

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

class TestVisitor extends NodeVisitor {
    public visited: { [key: string]: number };

    constructor() {
        super();
        this.visited = {};
    }

    override genericVisit(node: ASTRootBase): void {
        const key = node.constructor.name;
        this.visited[key] = (this.visited[key] ?? 0) + 1;
        return super.genericVisit(node);
    }
}

const tree = ast(input);
const visitor = new TestVisitor();
visitor.visit(tree);
// eslint-disable-next-line no-console
console.log(util.inspect(visitor.visited, { showHidden: false, depth: null, colors: true }));
// eslint-disable-next-line no-console
console.log(util.inspect(tree, { showHidden: false, depth: null, colors: true }));

function help() {
    // eslint-disable-next-line no-console
    console.log('Usage: tlb-parser <input>');
    // eslint-disable-next-line no-console
    console.log('  input: input file');
}
