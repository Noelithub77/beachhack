import { intro, outro, select, confirm, multiselect, spinner } from '@clack/prompts';
import { Supermemory } from 'supermemory';
import * as pc from 'picocolors';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.SUPERMEMORY_API_KEY || '';

interface Memory {
  id: string;
  containerTags?: string[];
  type: string;
  title?: string | null;
  summary?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
}

interface ListResponse {
  memories: Memory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  errors?: Array<{ id: string; error: string }>;
  containerTags?: string[];
}

async function getMemoryCategories(client: any) {
  const s = spinner();
  s.start('Fetching memories...');

  try {
    const allMemories: Memory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: ListResponse = await client.memories.list({ page, limit: 100 });
      allMemories.push(...response.memories);
      hasMore = page < response.pagination.totalPages;
      page++;
    }

    const categories = new Set<string>();
    allMemories.forEach((memory) => {
      memory.containerTags?.forEach((tag: string) => categories.add(tag));
    });

    s.stop(`Found ${allMemories.length} memories with ${categories.size} categories`);
    
    return {
      memories: allMemories,
      categories: Array.from(categories).sort()
    };
  } catch (error) {
    s.stop('Failed to fetch memories');
    throw error;
  }
}

async function deleteAllMemories(client: any) {
  const s = spinner();
  s.start('Fetching all memories...');

  try {
    const allMemories: Memory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: ListResponse = await client.memories.list({ page, limit: 100 });
      allMemories.push(...response.memories);
      hasMore = page < response.pagination.totalPages;
      page++;
    }

    if (allMemories.length === 0) {
      s.stop('No memories found');
      return;
    }

    s.stop(`Found ${allMemories.length} memories`);

    const confirmed = await confirm({
      message: `Are you sure you want to delete ALL ${allMemories.length} memories?`,
      initialValue: false
    });

    if (!confirmed) {
      outro('Operation cancelled');
      return;
    }

    const deleteSpinner = spinner();
    deleteSpinner.start('Deleting memories...');

    let deletedCount = 0;
    let errorCount = 0;

    for (const memory of allMemories) {
      try {
        await client.memories.delete(memory.id);
        deletedCount++;
        deleteSpinner.message(`Deleting memories... (${deletedCount}/${allMemories.length})`);
      } catch (error) {
        errorCount++;
      }
    }

    deleteSpinner.stop(`Successfully deleted ${deletedCount} memories${errorCount > 0 ? ` (${errorCount} errors)` : ''}`);
  } catch (error) {
    s.stop('Failed to delete memories');
    throw error;
  }
}

async function deleteMemoriesByCategory(client: any, categories: string[]) {
  const selectedCategories = await multiselect({
    message: 'Select categories to delete memories from:',
    options: categories.map((cat) => ({ value: cat, label: cat })),
    required: false
  });

  if (!selectedCategories || !Array.isArray(selectedCategories) || selectedCategories.length === 0) {
    outro('No categories selected');
    return;
  }

  const confirmed = await confirm({
    message: `Delete all memories from ${selectedCategories.length} selected categories?`,
    initialValue: false
  });

  if (!confirmed) {
    outro('Operation cancelled');
    return;
  }

  const s = spinner();
  s.start('Fetching memories to delete...');

  try {
    const allMemories: Memory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: ListResponse = await client.memories.list({ page, limit: 100 });
      allMemories.push(...response.memories);
      hasMore = page < response.pagination.totalPages;
      page++;
    }

    const memoriesToDelete = allMemories.filter((memory) =>
      memory.containerTags?.some((tag) => selectedCategories.includes(tag))
    );

    if (memoriesToDelete.length === 0) {
      s.stop('No memories found in selected categories');
      return;
    }

    s.message(`Deleting ${memoriesToDelete.length} memories...`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const memory of memoriesToDelete) {
      try {
        await client.memories.delete(memory.id);
        deletedCount++;
        s.message(`Deleting memories... (${deletedCount}/${memoriesToDelete.length})`);
      } catch (error) {
        errorCount++;
      }
    }

    s.stop(`Successfully deleted ${deletedCount} memories from ${selectedCategories.length} categories${errorCount > 0 ? ` (${errorCount} errors)` : ''}`);
  } catch (error) {
    s.stop('Failed to delete memories');
    throw error;
  }
}

async function showMemoryStats(client: any) {
  const s = spinner();
  s.start('Analyzing memories...');

  try {
    const allMemories: Memory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: ListResponse = await client.memories.list({ page, limit: 100 });
      allMemories.push(...response.memories);
      hasMore = page < response.pagination.totalPages;
      page++;
    }

    const categoryCount = new Map<string, number>();
    const typeCount = new Map<string, number>();

    allMemories.forEach((memory) => {
      memory.containerTags?.forEach((tag: string) => {
        categoryCount.set(tag, (categoryCount.get(tag) || 0) + 1);
      });
      typeCount.set(memory.type, (typeCount.get(memory.type) || 0) + 1);
    });

    s.stop('Analysis complete');

    console.log('\n' + pc.bold('Memory Statistics'));
    console.log(pc.gray('─'.repeat(40)));
    console.log(`${pc.blue('Total Memories:')} ${allMemories.length}`);
    console.log(`${pc.blue('Categories:')} ${categoryCount.size}`);
    console.log(`${pc.blue('Types:')} ${typeCount.size}`);

    if (categoryCount.size > 0) {
      console.log('\n' + pc.bold('Memories by Category:'));
      console.log(pc.gray('─'.repeat(40)));
      const sortedCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      sortedCategories.forEach(([cat, count]) => {
        const percentage = ((count / allMemories.length) * 100).toFixed(1);
        console.log(`  ${pc.cyan(cat.padEnd(20))} ${count.toString().padStart(5)} (${percentage}%)`);
      });
    }

    if (typeCount.size > 0) {
      console.log('\n' + pc.bold('Memories by Type:'));
      console.log(pc.gray('─'.repeat(40)));
      Array.from(typeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          const percentage = ((count / allMemories.length) * 100).toFixed(1);
          console.log(`  ${pc.green(type.padEnd(20))} ${count.toString().padStart(5)} (${percentage}%)`);
        });
    }
  } catch (error) {
    s.stop('Failed to analyze memories');
    throw error;
  }
}

async function main() {
  if (!API_KEY) {
    console.error(pc.red('Error: SUPERMEMORY_API_KEY environment variable is required'));
    console.log(pc.yellow('Set it with: export SUPERMEMORY_API_KEY=your_key_here'));
    process.exit(1);
  }

  intro(pc.cyan('SuperMemory Manager'));

  try {
    const client = new Supermemory({ apiKey: API_KEY });

    const { memories, categories } = await getMemoryCategories(client);

    if (memories.length === 0) {
      outro('No memories found. Your SuperMemory is empty!');
      return;
    }

    const action = await select({
      message: 'What would you like to do?',
      options: [
        { value: 'stats', label: 'View memory statistics' },
        { value: 'delete-all', label: 'Delete all memories', hint: pc.red('Destructive') },
        { value: 'delete-category', label: 'Delete memories by category', hint: pc.yellow('Destructive') },
        { value: 'exit', label: 'Exit' }
      ]
    });

    switch (action) {
      case 'stats':
        await showMemoryStats(client);
        break;
      case 'delete-all':
        await deleteAllMemories(client);
        break;
      case 'delete-category':
        if (categories.length === 0) {
          outro('No categories found');
        } else {
          await deleteMemoriesByCategory(client, categories);
        }
        break;
      case 'exit':
        outro('Goodbye!');
        return;
    }

    outro(pc.green('Done!'));
  } catch (error) {
    console.error(pc.red('Error:'), error);
    process.exit(1);
  }
}

main();
