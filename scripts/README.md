# SuperMemory Manager CLI

A beautiful CLI tool to manage your SuperMemories with options to delete all memories or delete by category.

## Setup

1. Set your SuperMemory API key as an environment variable:
   ```bash
   export SUPERMEMORY_API_KEY=your_api_key_here
   ```

2. Run the memory manager:
   ```bash
   pnpm memories
   ```

## Features

- **View Memory Statistics**: See total memories, categories, and breakdown by type
- **Delete All Memories**: Remove all memories with confirmation
- **Delete by Category**: Select specific categories to delete memories from
- **Beautiful CLI Interface**: Uses @clack/prompts for a modern, interactive experience

## Usage

Run the script and follow the interactive prompts:

```bash
pnpm memories
```

You'll see options like:
1. View memory statistics
2. Delete all memories (destructive)
3. Delete memories by category (destructive)
4. Exit

## Safety Features

- Confirmation prompts before any destructive action
- Clear warning indicators for destructive operations
- Progress spinners for long-running operations
- Color-coded output for easy readability
