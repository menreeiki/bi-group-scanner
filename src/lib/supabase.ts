import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaqidwkitgubemcejtmn.supabase.co'; // Замените на реальный из настроек Supabase
const supabaseAnonKey = 'sb_publishable_yVVOTM8J98ApoRh2QKyy6A_StO72U50';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
