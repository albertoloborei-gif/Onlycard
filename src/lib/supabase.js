import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://clnanmrmcedlsxvjlily.supabase.co'

const supabaseAnonKey = 'sb_publishable__oMuzHDivEpEaRVG0tKlGQ_N4Dsp3mv'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
