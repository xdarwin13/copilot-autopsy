#!/usr/bin/env node

/**
 * Copilot Autopsy CLI Entry Point
 * A terminal-first forensic analysis tool powered by GitHub Copilot CLI
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { cli } from '../src/cli.js';

// Run the CLI
cli(process.argv);
