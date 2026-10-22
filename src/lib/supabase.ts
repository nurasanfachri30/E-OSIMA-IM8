import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://spalsekzgoqvvtrcrhdm.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwYWxzZWt6Z29xdnZ0cmNyaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDIzMjMsImV4cCI6MjEwODAxODMyM30.8QrRGdagxjkuAtFkTC7DKkuZ2kzhSQdP6_vKgMuf4FQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if the Supabase tables are ready in the database.
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesReady: boolean;
  details: { [key: string]: boolean };
  error?: string;
}> {
  const details: { [key: string]: boolean } = {
    settings: false,
    classes: false,
    students: false,
    candidates: false,
  };

  try {
    const [settRes, clsRes, stuRes, canRes] = await Promise.allSettled([
      supabase.from('settings').select('id').limit(1),
      supabase.from('classes').select('id').limit(1),
      supabase.from('students').select('id').limit(1),
      supabase.from('candidates').select('id').limit(1),
    ]);

    details.settings = settRes.status === 'fulfilled' && !settRes.value.error;
    details.classes = clsRes.status === 'fulfilled' && !clsRes.value.error;
    details.students = stuRes.status === 'fulfilled' && !stuRes.value.error;
    details.candidates = canRes.status === 'fulfilled' && !canRes.value.error;

    const tablesReady = Object.values(details).every(Boolean);

    return {
      connected: true,
      tablesReady,
      details,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      tablesReady: false,
      details,
      error: errorMsg,
    };
  }
}

/**
 * Helper to upload image to Supabase Storage bucket 'eosis-assets'.
 * Falls back gracefully to base64 data URL if storage bucket is not configured yet.
 */
export async function uploadImageToStorage(
  file: File,
  folder: 'candidates' | 'school' = 'candidates'
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('eosis-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to base64:', uploadError.message);
      return fileToBase64(file);
    }

    const { data } = supabase.storage.from('eosis-assets').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.warn('Storage upload failed, falling back to base64 preview:', err);
    return fileToBase64(file);
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
