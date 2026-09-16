import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env via dotenv with path new URL('../../.env', import.meta.url) as specified
const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: rootEnvPath });

// Fallback to server/.env if root .env was not populated
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

/**
 * Generate 12 weekly price history points for an item.
 * Implements a random walk of ±8% ending at the current price.
 */
function generatePriceHistory(itemId, currentPrice) {
  const now = new Date();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const points = [];

  // Point 12 (now) ends exactly at current price
  let walkPrice = Number(currentPrice);
  points.push({
    item_id: itemId,
    price: Math.round(walkPrice * 100) / 100,
    recorded_at: now.toISOString(),
  });

  // Step backwards 11 weeks
  for (let w = 1; w < 12; w++) {
    const recordedAt = new Date(now.getTime() - w * ONE_WEEK_MS);
    // Random walk delta between -8% (-0.08) and +8% (+0.08)
    const delta = (Math.random() * 0.16) - 0.08;
    // Walk price backwards
    walkPrice = walkPrice / (1 + delta);
    // Keep reasonable minimum price boundary
    walkPrice = Math.max(walkPrice, currentPrice * 0.5);

    points.push({
      item_id: itemId,
      price: Math.round(walkPrice * 100) / 100,
      recorded_at: recordedAt.toISOString(),
    });
  }

  // Return chronological order (earliest to latest)
  return points.reverse();
}

async function seed() {
  console.log('--- Starting Spec Codex Catalog Seeding ---');
  const dataUrl = new URL('./data/mobiles.json', import.meta.url);
  const rawData = fs.readFileSync(fileURLToPath(dataUrl), 'utf8');
  const mobiles = JSON.parse(rawData);

  console.log(`Loaded ${mobiles.length} verified real mobile models from mobiles.json`);

  // Step 1: Delete all items with category_id = 1
  console.log('Purging existing items where category_id = 1...');
  const { error: deleteError } = await supabase
    .from('items')
    .delete()
    .eq('category_id', 1);

  if (deleteError) {
    console.error('Failed to delete category_id=1 items:', deleteError);
    process.exit(1);
  }
  console.log('Successfully cleared category_id = 1 items.');

  // Step 2: Upsert mobiles.json in batches of 25 on conflict slug
  const BATCH_SIZE = 25;
  const totalBatches = Math.ceil(mobiles.length / BATCH_SIZE);
  const insertedItems = [];

  for (let i = 0; i < mobiles.length; i += BATCH_SIZE) {
    const batch = mobiles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    let { data: upsertData, error: upsertError } = await supabase
      .from('items')
      .upsert(batch, { onConflict: 'slug' })
      .select('id, name, price');

    if (upsertError) {
      // If slug/status/currency columns are not yet in the Supabase schema cache
      if (
        upsertError.message &&
        (upsertError.message.includes('slug') ||
          upsertError.message.includes('status') ||
          upsertError.message.includes('currency') ||
          upsertError.message.includes('last_verified_at'))
      ) {
        if (batchNum === 1) {
          console.warn(
            `[Notice] Columns from migration 003 are not yet in schema cache. Falling back to active schema columns.`
          );
        }
        const fallbackBatch = batch.map(
          ({ slug, currency, status, source_url, last_verified_at, ...rest }) => rest
        );
        const { data: insertData, error: insertError } = await supabase
          .from('items')
          .insert(fallbackBatch)
          .select('id, name, price');

        if (insertError) {
          console.error(`Error inserting batch ${batchNum}:`, insertError);
          process.exit(1);
        }
        if (insertData) insertedItems.push(...insertData);
      } else {
        console.error(`Error upserting batch ${batchNum}:`, upsertError);
        process.exit(1);
      }
    } else if (upsertData) {
      insertedItems.push(...upsertData);
    }

    console.log(`Upserted batch ${batchNum}/${totalBatches} (${batch.length} items)`);
  }

  console.log(`✅ Upserted ${insertedItems.length} items with category_id = 1.`);

  // Step 3: Generate 12 weekly price_history points per item (random walk ±8% ending at current price)
  console.log('Generating 12 weekly price history points per item...');

  // If insertedItems didn't return IDs (e.g. Supabase anon key select restrictions), query them back
  let targetItems = insertedItems;
  if (!targetItems || targetItems.length === 0) {
    const { data: reselectData } = await supabase
      .from('items')
      .select('id, name, price')
      .eq('category_id', 1);
    targetItems = reselectData || [];
  }

  const allHistoryPoints = [];
  for (const item of targetItems) {
    const points = generatePriceHistory(item.id, item.price);
    allHistoryPoints.push(...points);
  }

  console.log(`Generated ${allHistoryPoints.length} total price history records (${targetItems.length} items x 12 points)`);

  // Insert price history points in chunks of 100
  const HISTORY_BATCH_SIZE = 100;
  let historyInsertedCount = 0;
  let historyTableAvailable = true;

  for (let j = 0; j < allHistoryPoints.length; j += HISTORY_BATCH_SIZE) {
    const historyBatch = allHistoryPoints.slice(j, j + HISTORY_BATCH_SIZE);
    const { error: histError } = await supabase
      .from('price_history')
      .insert(historyBatch);

    if (histError) {
      if (histError.message && histError.message.includes('price_history')) {
        console.warn(
          `[Notice] 'price_history' table not yet present in Supabase schema cache. Please run server/migrations/003_purge_and_history.sql in Supabase SQL editor.`
        );
        historyTableAvailable = false;
        break;
      } else {
        console.error('Error inserting price history batch:', histError);
        break;
      }
    } else {
      historyInsertedCount += historyBatch.length;
    }
  }

  if (historyTableAvailable) {
    console.log(`✅ Successfully seeded ${historyInsertedCount} price history points across all catalog items.`);
  }

  console.log('🏁 Catalog seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
