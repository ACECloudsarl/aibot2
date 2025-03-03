// services/GenerationsService.js
import { supabase } from '@/lib/supabase';

class GenerationsService {
  async getUserGenerations(userId) {
    try {
      console.log(`Fetching generations for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching generations:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} generations`);
      return { generations: data || [], error: null };
    } catch (error) {
      console.error('Error in getUserGenerations:', error);
      return { generations: [], error };
    }
  }
  
  async getChatGenerations(chatId) {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { generations: data || [], error: null };
    } catch (error) {
      console.error('Error fetching chat generations:', error);
      return { generations: [], error };
    }
  }
  
  async getGeneration(id) {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return { generation: data, error: null };
    } catch (error) {
      console.error('Error fetching generation:', error);
      return { generation: null, error };
    }
  }
  
  async deleteGeneration(id) {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting generation:', error);
      return { error };
    }
  }
  
  async createGeneration(userId, chatId, prompt, url, model, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: userId,
          chat_id: chatId,
          prompt,
          url,
          model,
          width: metadata.width || 1024,
          height: metadata.height || 768,
          metadata: metadata
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { generation: data, error: null };
    } catch (error) {
      console.error('Error creating generation:', error);
      return { generation: null, error };
    }
  }
}

export const generationsService = new GenerationsService();
export default generationsService;