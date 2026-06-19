import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE URL:', 'https://clnanmrmcedlsxvjlily.supabase.co')
console.log('SUPABASE KEY:', 'sb_publishable__oMuzHDivEpEaRVG0tKlGQ_N4Dsp3mv')

const supabaseUrl = 'https://clnanmrmcedlsxvjlily.supabase.co'
const supabaseAnonKey = 'sb_publishable__oMuzHDivEpEaRVG0tKlGQ_N4Dsp3mv'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
