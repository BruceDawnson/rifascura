import { supabase } from '@/lib/supabaseClient';

// ==================== RIFA OPERATIONS ====================

export const rifaService = {
  // Get all rifas
  async getAllRifas() {
    const { data, error } = await supabase
      .from('Rifa')
      .select('*')
      .order('created_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get rifa by ID
  async getRifaById(id) {
    const { data, error } = await supabase
      .from('Rifa')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get rifa by slug (for public page)
  async getRifaBySlug(slug) {
    const { data, error } = await supabase
      .from('Rifa')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new rifa
  async createRifa(rifaData) {
    const { data, error } = await supabase
      .from('Rifa')
      .insert([rifaData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update rifa
  async updateRifa(id, updates) {
    const { data, error } = await supabase
      .from('Rifa')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete rifa
  async deleteRifa(id) {
    const { error } = await supabase
      .from('Rifa')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get rifas by status
  async getRifasByStatus(status) {
    const { data, error } = await supabase
      .from('Rifa')
      .select('*')
      .eq('status', status)
      .order('created_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// ==================== NUMERO RIFA OPERATIONS ====================

export const numeroRifaService = {
  // Get all numeros for a rifa
  async getNumerosByRifaId(rifaId) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .select('*')
      .eq('rifa_id', rifaId)
      .order('numero', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get numero by ID
  async getNumeroById(id) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create numero
  async createNumero(numeroData) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .insert([numeroData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create multiple numeros
  async createMultipleNumeros(numerosData) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .insert(numerosData)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update numero
  async updateNumero(id, updates) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete numero
  async deleteNumero(id) {
    const { error } = await supabase
      .from('NumeroRifa')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get vendidos count
  async getVendidosCount(rifaId) {
    const { count, error } = await supabase
      .from('NumeroRifa')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifaId)
      .eq('vendido', true);
    
    if (error) throw error;
    return count || 0;
  },

  // Get pagos count
  async getPagosCount(rifaId) {
    const { count, error } = await supabase
      .from('NumeroRifa')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifaId)
      .eq('pago', true);
    
    if (error) throw error;
    return count || 0;
  },

  // Get total arrecadado
  async getTotalArrecadado(rifaId) {
    const { data, error } = await supabase
      .from('NumeroRifa')
      .select('valor_pago')
      .eq('rifa_id', rifaId)
      .eq('pago', true);
    
    if (error) throw error;
    
    return data.reduce((sum, item) => sum + (parseFloat(item.valor_pago) || 0), 0);
  }
};

// ==================== USER OPERATIONS ====================

export const userService = {
  // Get all users
  async getAllUsers() {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('created_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user by email
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  },

  // Create user
  async createUser(userData) {
    const { data, error } = await supabase
      .from('User')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
