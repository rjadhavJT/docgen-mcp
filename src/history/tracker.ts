import fs from 'fs/promises';
import path from 'path';

export interface HistoryEntry {
  projectId: string;
  template: string;
  sources: any[];
  timestamp: string;
  outputPath?: string;
}

const HISTORY_FILE = path.join(process.cwd(), 'docgen_history.json');

class DocumentHistory {
  private history: HistoryEntry[] = [];
  private loaded = false;
  
  async loadHistory() {
    try {
      const historyContent = await fs.readFile(HISTORY_FILE, 'utf-8');
      this.history = JSON.parse(historyContent);
    } catch (error) {
      // If file doesn't exist, create empty history
      this.history = [];
    }
    
    this.loaded = true;
  }
  
  async saveHistory() {
    try {
      await fs.writeFile(HISTORY_FILE, JSON.stringify(this.history, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }
  
  async saveEntry(entry: HistoryEntry) {
    if (!this.loaded) {
      await this.loadHistory();
    }
    
    this.history.push(entry);
    await this.saveHistory();
  }
  
  async getEntries(projectId: string | null = null, limit: number | null = null) {
    if (!this.loaded) {
      await this.loadHistory();
    }
    
    let entries = this.history;
    
    if (projectId) {
      entries = entries.filter(entry => entry.projectId === projectId);
    }
    
    // Sort by timestamp, newest first
    entries = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (limit && limit > 0) {
      entries = entries.slice(0, limit);
    }
    
    return entries;
  }
}

export const documentHistory = new DocumentHistory();
