import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Kingdom = Database['public']['Tables']['kingdoms']['Row'];
type Battle = Database['public']['Tables']['battles']['Row'];
type Council = Database['public']['Tables']['councils']['Row'];

export function useKingdom(id: string) {
  return useQuery({
    queryKey: ['kingdom', id],
    queryFn: () => db.kingdoms.getById(id),
  });
}

export function useCreateKingdom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kingdom: Database['public']['Tables']['kingdoms']['Insert']) =>
      db.kingdoms.create(kingdom),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kingdom', data.id] });
    },
  });
}

export function useUpdateKingdom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database['public']['Tables']['kingdoms']['Update'];
    }) => db.kingdoms.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kingdom', data.id] });
    },
  });
}

export function useBattle(id: string) {
  return useQuery({
    queryKey: ['battle', id],
    queryFn: () => db.battles.getById(id),
  });
}

export function useCreateBattle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battle: Database['public']['Tables']['battles']['Insert']) =>
      db.battles.create(battle),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['battle', data.id] });
    },
  });
}

export function useCouncil(id: string) {
  return useQuery({
    queryKey: ['council', id],
    queryFn: () => db.councils.getById(id),
  });
}

export function useCreateCouncil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (council: Database['public']['Tables']['councils']['Insert']) =>
      db.councils.create(council),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['council', data.id] });
    },
  });
}

// Real-time subscriptions
export function useKingdomSubscription(id: string, callback: (kingdom: Kingdom) => void) {
  return useQuery({
    queryKey: ['kingdom-subscription', id],
    queryFn: () => {
      const subscription = supabase
        .channel(`kingdom-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kingdoms',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            callback(payload.new as Kingdom);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    },
  });
} 