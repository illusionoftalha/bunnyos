import { getSupabaseClient } from './supabaseClient';

const DB_NAME = 'BunnyPoetryDB';
const DB_VERSION = 1;
const STORE_NAME = 'poems';

// Public folder poem files
const PUBLIC_POEM_FILES = [
  { id: 'bhonduu', title: 'Bhonduu', file: '/Bhonduu.txt' },
  { id: 'eyes_depth', title: "Eyes That Don't Know Their Own Depth", file: "/Eyes_That_Don't_Know_Their_Own_Depth.txt" },
  { id: 'no_one_stayed', title: 'No One Stayed', file: '/No_One_Stayed.txt' },
  { id: 'roots_ruins', title: 'Roots and Ruins', file: '/Roots_and_Ruins.txt' }
];

class PoetryDBService {
  constructor() {
    this.db = null;
  }

  // Open IndexedDB Connection
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Fetch poems directly from Supabase Cloud Table
  async fetchSupabasePoems() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured in .env or settings');
    }

    const { data, error } = await client
      .from('poems')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return [];

    const mapped = data.map(item => ({
      id: String(item.id),
      title: item.title,
      content: item.content,
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString()
    }));

    // Cache to local IndexedDB & LocalStorage
    for (const p of mapped) {
      await this.saveLocalOnly(p);
    }

    return mapped;
  }

  // Fetch poems from public folder text files
  async fetchPublicFolderPoems() {
    const loaded = [];
    for (const item of PUBLIC_POEM_FILES) {
      try {
        const res = await fetch(item.file);
        if (res.ok) {
          const text = await res.text();
          loaded.push({
            id: item.id,
            title: item.title,
            content: text.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn(`Could not load ${item.file}:`, e);
      }
    }
    return loaded;
  }

  // Get all poems (Always loads & merges 4 public poems from /public/)
  async getAllPoems() {
    // 1. Fetch Public Folder Poems
    const publicPoems = await this.fetchPublicFolderPoems();

    // Auto-save public poems locally & to Supabase
    const client = getSupabaseClient();
    for (const p of publicPoems) {
      await this.saveLocalOnly(p);
      if (client) {
        try {
          await client.from('poems').upsert({
            id: p.id,
            title: p.title,
            content: p.content,
            updated_at: p.updatedAt
          });
        } catch (e) {
          // Ignore upsert warning
        }
      }
    }

    // 2. Try Supabase fetch
    if (client) {
      try {
        const cloudPoems = await this.fetchSupabasePoems();
        if (cloudPoems && cloudPoems.length > 0) {
          return cloudPoems;
        }
      } catch (e) {
        console.warn('Supabase fetch error, using local/public DB:', e);
      }
    }

    // 3. Query Local IndexedDB
    try {
      await this.init();
      const localPoems = await new Promise((resolve, reject) => {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      if (localPoems && localPoems.length > 0) {
        // Filter out old legacy dummy poems ('1' and '2') if public poems are loaded
        const filtered = localPoems.filter(p => p.id !== '1' && p.id !== '2');
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return filtered.length > 0 ? filtered : publicPoems;
      }
    } catch (err) {
      console.warn('IndexedDB error:', err);
    }

    return publicPoems;
  }

  // Save to local IndexedDB only
  async saveLocalOnly(record) {
    try {
      await this.init();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record);
      this.backupToLocalStorage();
    } catch (e) {
      // Ignore local cache error
    }
  }

  // Save or Update a poem (Syncs to Supabase + Local DB)
  async savePoem(poem) {
    const record = {
      ...poem,
      updatedAt: new Date().toISOString(),
      createdAt: poem.createdAt || new Date().toISOString()
    };

    // 1. Save Locally
    await this.saveLocalOnly(record);

    // 2. Sync to Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client
          .from('poems')
          .upsert({
            id: record.id,
            title: record.title,
            content: record.content,
            updated_at: record.updatedAt
          });

        if (error) {
          console.warn('Supabase upsert error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase save exception:', e);
      }
    }

    return record;
  }

  // Delete a poem by ID
  async deletePoem(id) {
    // 1. Delete Locally
    try {
      await this.init();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      this.backupToLocalStorage();
    } catch (e) {
      const saved = localStorage.getItem('bunny_poetry_vault');
      if (saved) {
        let list = JSON.parse(saved).filter(p => p.id !== id);
        localStorage.setItem('bunny_poetry_vault', JSON.stringify(list));
      }
    }

    // 2. Delete from Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('poems')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }

    return true;
  }

  // Backup to LocalStorage
  async backupToLocalStorage() {
    try {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        localStorage.setItem('bunny_poetry_vault', JSON.stringify(req.result));
      };
    } catch (e) {
      // Ignore
    }
  }
}

export const poetryDB = new PoetryDBService();
