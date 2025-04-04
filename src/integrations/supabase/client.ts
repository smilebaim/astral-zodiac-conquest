// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';
import type { Database } from './types';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  SUPABASE_CONFIG.options
);

// Error handling utility
export class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Type-safe database operations
export const db = {
  kingdoms: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('kingdoms')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new SupabaseError('Failed to fetch kingdom', error);
      return data;
    },
    
    async create(kingdom: Database['public']['Tables']['kingdoms']['Insert']) {
      const { data, error } = await supabase
        .from('kingdoms')
        .insert(kingdom)
        .select()
        .single();
      
      if (error) throw new SupabaseError('Failed to create kingdom', error);
      return data;
    },
    
    async update(id: string, updates: Database['public']['Tables']['kingdoms']['Update']) {
      const { data, error } = await supabase
        .from('kingdoms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new SupabaseError('Failed to update kingdom', error);
      return data;
    },
  },
  
  battles: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new SupabaseError('Failed to fetch battle', error);
      return data;
    },
    
    async create(battle: Database['public']['Tables']['battles']['Insert']) {
      const { data, error } = await supabase
        .from('battles')
        .insert(battle)
        .select()
        .single();
      
      if (error) throw new SupabaseError('Failed to create battle', error);
      return data;
    },
  },
  
  councils: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('councils')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new SupabaseError('Failed to fetch council', error);
      return data;
    },
    
    async create(council: Database['public']['Tables']['councils']['Insert']) {
      const { data, error } = await supabase
        .from('councils')
        .insert(council)
        .select()
        .single();
      
      if (error) throw new SupabaseError('Failed to create council', error);
      return data;
    },
  },
};