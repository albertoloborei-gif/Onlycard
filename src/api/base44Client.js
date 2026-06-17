import { supabase } from "@/lib/supabase";

const createEntity = (table) => ({
  async filter() {
    const { data, error } = await supabase
      .from(table)
      .select("*");

    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  }
});

export const base44 = {
  entities: {
    BusinessInfo: createEntity("businessinfo"),
    CardUser: createEntity("carduser"),
    Company: createEntity("company"),
    Category: createEntity("category"),
    Payment: createEntity("payment"),
    CardRenewal: createEntity("cardrenewal"),
  },

  integrations: {
    Core: {
      UploadFile: async () => ({
        file_url: ""
      })
    }
  }
};

export default base44;
