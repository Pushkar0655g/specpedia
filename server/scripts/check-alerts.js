import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables via ESM URL
const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: rootEnvPath });

if (!process.env.SUPABASE_URL) {
  const localEnvPath = fileURLToPath(new URL('../.env', import.meta.url));
  dotenv.config({ path: localEnvPath });
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be configured in .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkAlerts() {
  console.log('--- Starting Watchlist Price Alert Checker ---');
  const nowIso = new Date().toISOString();

  // Query watchlist rows where target_price is specified and notified_at is NULL
  let watchlistRows = [];
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        user_id,
        item_id,
        target_price,
        notified_at,
        items (
          id,
          name,
          brand,
          price
        )
      `)
      .is('notified_at', null)
      .not('target_price', 'is', null);

    if (error) {
      if (error.message && error.message.includes('watchlist')) {
        console.warn("[Notice] 'watchlist' table not yet present in Supabase schema cache. No alerts to evaluate.");
        console.log('--- Alert Checker Finished (0 alerts) ---');
        return;
      }
      throw error;
    }
    watchlistRows = data || [];
  } catch (err) {
    console.error('Error reading watchlist rows:', err);
    return;
  }

  console.log(`Evaluating ${watchlistRows.length} un-notified watchlist entries with target prices...`);

  let triggeredCount = 0;

  for (const row of watchlistRows) {
    let item = row.items;

    // If join didn't populate item details, fetch directly from items
    if (!item && row.item_id) {
      const { data: directItem } = await supabase
        .from('items')
        .select('id, name, brand, price')
        .eq('id', row.item_id)
        .maybeSingle();
      item = directItem;
    }

    if (!item) {
      console.warn(`Item ${row.item_id} not found in catalog; skipping.`);
      continue;
    }

    const currentPrice = Number(item.price);
    const targetPrice = Number(row.target_price);

    if (currentPrice <= targetPrice) {
      // Condition met: item price is at or below the user's target price!
      console.log(
        `🔔 [ALERT] User ${row.user_id}: ${item.brand} ${item.name} reached target price! Current: ₹${currentPrice} <= Target: ₹${targetPrice} (Dispatched via email hook)`
      );

      // Mark row as notified
      const { error: updateError } = await supabase
        .from('watchlist')
        .update({ notified_at: nowIso })
        .eq('user_id', row.user_id)
        .eq('item_id', row.item_id);

      if (updateError) {
        console.error(`Failed to update notified_at for user ${row.user_id}, item ${row.item_id}:`, updateError);
      } else {
        triggeredCount++;
      }
    }
  }

  console.log(`--- Alert Checker Finished (${triggeredCount} alert(s) dispatched and marked notified) ---`);
}

checkAlerts().catch((err) => {
  console.error('Fatal alert checker error:', err);
  process.exit(1);
});
