import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Data persistence will be limited.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Supabase Service - Handles all database operations
 */
export const supabaseService = {
  // Rifas (Sorteios)
  async createRifa(rifaData) {
    const { data, error } = await supabase
      .from('rifas')
      .insert([rifaData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async getRifa(id) {
    const { data, error } = await supabase
      .from('rifas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async listRifas(limit = 100, offset = 0) {
    const { data, error, count } = await supabase
      .from('rifas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async updateRifa(id, updates) {
    const { data, error } = await supabase
      .from('rifas')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async deleteRifa(id) {
    const { error } = await supabase
      .from('rifas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Numeros (Numbers in Rifas)
  async createNumero(numeroData) {
    const { data, error } = await supabase
      .from('numeros_rifa')
      .insert([numeroData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async getNumero(id) {
    const { data, error } = await supabase
      .from('numeros_rifa')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async listNumerosByRifa(rifaId, limit = 500, offset = 0) {
    const { data, error, count } = await supabase
      .from('numeros_rifa')
      .select('*', { count: 'exact' })
      .eq('rifa_id', rifaId)
      .order('numero', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async updateNumero(id, updates) {
    const { data, error } = await supabase
      .from('numeros_rifa')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async deleteNumero(id) {
    const { error } = await supabase
      .from('numeros_rifa')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteNumerosByRifa(rifaId) {
    const { error } = await supabase
      .from('numeros_rifa')
      .delete()
      .eq('rifa_id', rifaId);
    
    if (error) throw error;
  },

  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async getUser(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  // Participantes (Participants)
  async createParticipante(participanteData) {
    const { data, error } = await supabase
      .from('participantes')
      .insert([participanteData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async listParticipantesByRifa(rifaId, limit = 100, offset = 0) {
    const { data, error, count } = await supabase
      .from('participantes')
      .select('*', { count: 'exact' })
      .eq('rifa_id', rifaId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async updateParticipante(id, updates) {
    const { data, error } = await supabase
      .from('participantes')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async deleteParticipante(id) {
    const { error } = await supabase
      .from('participantes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Transacoes (Transactions)
  async createTransacao(transacaoData) {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacaoData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async listTransacoesByRifa(rifaId, limit = 100, offset = 0) {
    const { data, error, count } = await supabase
      .from('transacoes')
      .select('*', { count: 'exact' })
      .eq('rifa_id', rifaId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Upload de arquivos
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl.publicUrl;
  },

  // Auth
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

export default supabaseService;
