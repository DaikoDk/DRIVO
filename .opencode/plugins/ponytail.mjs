import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { tool } from '@opencode-ai/plugin';

const require = createRequire(import.meta.url);
const { getPonytailInstructions } = require('C:/Agentes/ponytail/hooks/ponytail-instructions');
const { getDefaultMode, normalizePersistedMode } = require('C:/Agentes/ponytail/hooks/ponytail-config');

const statePath = path.join(
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
  'opencode',
  '.ponytail-active',
);

function readMode() {
  try {
    return normalizePersistedMode(fs.readFileSync(statePath, 'utf8').trim()) || getDefaultMode();
  } catch (e) {
    return getDefaultMode();
  }
}

function writeMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

export const PonytailPlugin = async ({ project, client, $, directory, worktree }) => {
  return {
    tool: {
      ponytail: tool({
        description: 'Set ponytail intensity level (lite/full/ultra/off) or report current level',
        args: {
          level: tool.schema.string().optional().describe('Intensity level: lite, full, ultra, or off'),
        },
        async execute(args) {
          const currentMode = readMode();
          if (!args.level) {
            return `Current ponytail level: ${currentMode}`;
          }
          const mode = normalizePersistedMode(args.level.trim());
          if (!mode) {
            return `Invalid level. Use: lite, full, ultra, or off`;
          }
          writeMode(mode);
          return `Ponytail level set to: ${mode}`;
        },
      }),

      'ponytail-review': tool({
        description: 'Review the current git diff for over-engineering and suggest deletions',
        args: {},
        async execute(args, context) {
          const mode = readMode();
          const instructions = getPonytailInstructions(mode);
          
          try {
            const diff = await $`git diff HEAD`.text();
            if (!diff.trim()) {
              return 'No changes to review. Make some changes first.';
            }
            
            return `${instructions}\n\n## Review the following diff for over-engineering:\n\n\`\`\`diff\n${diff}\n\`\`\`\n\nIdentify:\n1. Unnecessary abstractions\n2. Over-engineered solutions\n3. Code that could be deleted\n4. Simpler alternatives\n\nProvide a delete-list with specific lines/functions to remove.`;
          } catch (e) {
            return `Error getting diff: ${e.message}`;
          }
        },
      }),

      'ponytail-audit': tool({
        description: 'Audit the entire repository for over-engineering patterns',
        args: {},
        async execute(args, context) {
          const mode = readMode();
          const instructions = getPonytailInstructions(mode);
          
          return `${instructions}\n\n## Audit the repository for over-engineering:\n\nWorking directory: ${directory}\n\nScan for:\n1. Unused dependencies\n2. Unnecessary abstractions (interfaces with one implementation, factories for one product)\n3. Over-engineered patterns\n4. Boilerplate that serves no purpose\n5. Code that could be replaced with stdlib/native features\n\nProvide a prioritized delete-list and simplification recommendations.`;
        },
      }),

      'ponytail-debt': tool({
        description: 'List all ponytail: comments (deferred shortcuts) in the codebase',
        args: {},
        async execute(args, context) {
          try {
            const result = await $`grep -r "ponytail:" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.py" --include="*.go" --include="*.rs" .`.text();
            
            if (!result.trim()) {
              return 'No ponytail: comments found. No deferred shortcuts to track.';
            }
            
            return `## Ponytail Debt Ledger\n\n${result}\n\nReview these shortcuts and decide which ones to address.`;
          } catch (e) {
            if (e.exitCode === 1) {
              return 'No ponytail: comments found. No deferred shortcuts to track.';
            }
            return `Error searching for ponytail comments: ${e.message}`;
          }
        },
      }),

      'ponytail-help': tool({
        description: 'Show ponytail commands and usage',
        args: {},
        async execute(args) {
          const mode = readMode();
          return `## Ponytail Commands

Current level: **${mode}**

### Available Commands:
- **ponytail** [lite|full|ultra|off] - Set intensity level or show current
- **ponytail-review** - Review current diff for over-engineering
- **ponytail-audit** - Audit entire repo for over-engineering
- **ponytail-debt** - List all ponytail: comments (deferred shortcuts)
- **ponytail-help** - Show this help

### Intensity Levels:
- **lite** - Build what's asked, name lazier alternative
- **full** - The ladder enforced. Stdlib first. Shortest diff. (default)
- **ultra** - YAGNI extremist. Deletion before addition.
- **off** - Disable ponytail rules

### Usage:
Call these tools directly in your conversation. The rules are always active via AGENTS.md.`;
        },
      }),
    },

    'tool.execute.before': async (input, output) => {
      const mode = readMode();
      if (mode === 'off') return;
      
      const instructions = getPonytailInstructions(mode);
      
      if (output.args && typeof output.args === 'object') {
        if (output.args.prompt && typeof output.args.prompt === 'string') {
          output.args.prompt = `${instructions}\n\n${output.args.prompt}`;
        }
      }
    },
  };
};
