import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://clnanmrmcedlsxvjlily.supabase.co'

const supabaseAnonKey = 'COLE_AQUI_SUA_CHAVE_PUBLICAVEL_COMPLETA'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
