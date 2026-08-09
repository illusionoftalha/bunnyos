import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'bunny_messenger_messages';

// Start with clean initial state for Bhondu and Bareera
const INITIAL_MESSAGES = [];

class MessengerDBService {
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
      console.warn('Failed to load local messenger storage:', e);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  }

  saveToLocalStorage(messages) {
    try {
      this.localCache = messages;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save to local messenger storage:', e);
    }
  }

  async fetchMessages() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('bunny_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);

        if (!error && data) {
          this.saveToLocalStorage(data);
          return data;
        } else {
          console.warn('Supabase fetch query notice (table might not exist yet):', error?.message);
        }
      } catch (err) {
        console.warn('Supabase error fetching messages:', err);
      }
    }

    return this.loadFromLocalStorage();
  }

  async sendMessage({ sender, content, type = 'text' }) {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      content,
      type,
      created_at: new Date().toISOString()
    };

    // Save locally first for instant feedback
    const current = this.loadFromLocalStorage();
    const updated = [...current, newMessage];
    this.saveToLocalStorage(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('bunny_messages')
          .insert([{
            sender: newMessage.sender,
            content: newMessage.content,
            type: newMessage.type,
            created_at: newMessage.created_at
          }])
          .select();

        if (error) {
          console.warn('Supabase insert failed, kept in local storage:', error.message);
        } else if (data && data[0]) {
          return data[0];
        }
      } catch (err) {
        console.warn('Supabase message insert exception:', err);
      }
    }

    return newMessage;
  }

  subscribeToMessages(onNewMessage) {
    if (!isSupabaseConfigured || !supabase) {
      // Return dummy unsubscribe function for offline mode
      return () => {};
    }

    try {
      const channel = supabase
        .channel('public:bunny_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bunny_messages' },
          (payload) => {
            if (payload.new) {
              // Update local cache
              const current = this.loadFromLocalStorage();
              if (!current.some(m => m.id === payload.new.id)) {
                this.saveToLocalStorage([...current, payload.new]);
              }
              onNewMessage(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Supabase channel subscription failed:', e);
      return () => {};
    }
  }

  async clearAllMessages() {
    this.saveToLocalStorage([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('bunny_messages').delete().neq('sender', '___NONE___');
        if (error) {
          console.warn('Supabase delete warning (check DELETE policy in RLS):', error.message);
        }
      } catch (err) {
        console.warn('Supabase clear exception:', err);
      }
    }
  }

  getSQLSetupQuery() {
    return `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.bunny_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bunny_messages;

-- Allow anonymous access
ALTER TABLE public.bunny_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.bunny_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.bunny_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.bunny_messages FOR DELETE USING (true);`;
  }
}

export const messengerDB = new MessengerDBService();
