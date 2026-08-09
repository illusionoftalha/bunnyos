import { getSupabaseClient } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'bunny_captured_pictures';

class PicturesDBService {
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
      console.warn('Failed to load local pictures storage:', e);
    }
    return [];
  }

  saveToLocalStorage(photos) {
    try {
      this.localCache = photos;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.warn('Failed to save to local pictures storage:', e);
    }
  }

  async fetchPhotos() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('bunny_pictures')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            title: item.title,
            src: item.src,
            date: item.date,
            filter: item.filter,
            isUserCaptured: item.is_user_captured !== false
          }));
          this.saveToLocalStorage(formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase fetch photos notice:', err);
      }
    }

    return this.loadFromLocalStorage();
  }

  async savePhoto(photo) {
    // 1. Update local cache immediately
    const existing = this.loadFromLocalStorage();
    const updated = [photo, ...existing.filter(p => p.id !== photo.id)];
    this.saveToLocalStorage(updated);

    // 2. Sync to Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      try {
        const dbPayload = {
          id: photo.id,
          name: photo.name,
          title: photo.title,
          src: photo.src,
          date: photo.date || new Date().toLocaleDateString(),
          filter: photo.filter || 'digicam',
          is_user_captured: photo.isUserCaptured !== false
        };

        const { error } = await client
          .from('bunny_pictures')
          .upsert([dbPayload], { onConflict: 'id' });

        if (error) {
          console.warn('Supabase photo upsert notice:', error.message);
        }
      } catch (e) {
        console.warn('Supabase photo save exception:', e);
      }
    }

    return photo;
  }

  async deletePhoto(photoId) {
    // 1. Update local cache
    const existing = this.loadFromLocalStorage();
    const filtered = existing.filter(p => p.id !== photoId && p.name !== photoId);
    this.saveToLocalStorage(filtered);

    // 2. Sync deletion to Supabase DB entirely
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client
          .from('bunny_pictures')
          .delete()
          .or(`id.eq.${photoId},name.eq.${photoId}`);

        if (error) {
          console.warn('Supabase photo delete error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase photo delete exception:', e);
      }
    }
  }

  subscribeToPhotos(onUpdate) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const channel = client
        .channel('bunny_pictures_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bunny_pictures' },
          async () => {
            const latest = await this.fetchPhotos();
            if (onUpdate) onUpdate(latest);
          }
        )
        .subscribe();

      return channel;
    } catch (e) {
      console.warn('Supabase photos subscription notice:', e);
      return null;
    }
  }

  unsubscribeFromPhotos(channel) {
    const client = getSupabaseClient();
    if (client && channel) {
      try {
        client.removeChannel(channel);
      } catch (e) {
        console.warn('Error unsubscribing from photos channel:', e);
      }
    }
  }
}

export const picturesDBService = new PicturesDBService();
