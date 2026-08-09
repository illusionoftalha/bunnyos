import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'bunnyos_mails';

const INITIAL_MAILS = [
  {
    id: 'mail-welcome-1',
    sender: 'bhondu@bunny.com',
    recipient: 'bareera@bunny.com',
    subject: '🌸 Welcome to Bunny Mail 98!',
    body: 'My dearest Bareera,\n\nWelcome to your official Bunny Mail client! You can send and receive photos, videos, audio voice memos, and secret love notes between bareera@bunny.com and bhondu@bunny.com.\n\nAlways thinking of you,\nBhondu 💖',
    attachments: [],
    created_at: new Date().toISOString()
  }
];

class BunnyMailDBService {
  constructor() {
    this.localCache = this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load local mail storage:', e);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MAILS));
    return INITIAL_MAILS;
  }

  saveToLocalStorage(mails) {
    try {
      this.localCache = mails;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mails));
    } catch (e) {
      console.warn('Failed to save to local mail storage:', e);
    }
  }

  async fetchMails() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('bunny_mails')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          this.saveToLocalStorage(data);
          return data;
        } else {
          console.warn('Supabase fetch mail notice:', error?.message);
        }
      } catch (err) {
        console.warn('Supabase error fetching mails:', err);
      }
    }
    return this.loadFromLocalStorage();
  }

  async sendMail({ sender, recipient, subject, body, attachments = [] }) {
    const newMail = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      recipient,
      subject,
      body,
      attachments,
      created_at: new Date().toISOString()
    };

    // Save locally for instant UI update
    const current = this.loadFromLocalStorage();
    const updated = [newMail, ...current];
    this.saveToLocalStorage(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('bunny_mails')
          .insert([{
            sender: newMail.sender,
            recipient: newMail.recipient,
            subject: newMail.subject,
            body: newMail.body,
            attachments: newMail.attachments,
            created_at: newMail.created_at
          }])
          .select();

        if (!error && data && data[0]) {
          return data[0];
        }
      } catch (err) {
        console.warn('Supabase mail insert exception:', err);
      }
    }

    return newMail;
  }

  async deleteMail(mailId) {
    // Delete from local cache
    const current = this.loadFromLocalStorage();
    const updated = current.filter(m => m.id !== mailId && String(m.id) !== String(mailId));
    this.saveToLocalStorage(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bunny_mails')
          .delete()
          .eq('id', mailId);
      } catch (err) {
        console.warn('Supabase mail delete exception:', err);
      }
    }

    return updated;
  }

  subscribeToMails(onNewMail) {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('public:bunny_mails')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bunny_mails' },
          (payload) => {
            if (payload.new) {
              onNewMail(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Error subscribing to bunny_mails:', err);
      return () => {};
    }
  }
}

export const bunnyMailDB = new BunnyMailDBService();
