import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Authentication middleware verifying Supabase JWT bearer token
 * Attaches authenticated user object to req.user or halts with 401 Unauthorized
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = data.user;
    return next();
  } catch (err) {
    console.error('Auth middleware verification error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export default requireAuth;
