import { D1Database } from '@cloudflare/workers-types';
import { ScrapedData } from './scraper';

export async function storeRankings(db: D1Database, listUrl: string, data: ScrapedData[]) {
  const siteUrl = new URL(listUrl).origin;

  // Get or create site
  let site = await db.prepare('SELECT id FROM sites WHERE url = ?').bind(siteUrl).first<{ id: number }>();
  if (!site) {
    site = await db.prepare('INSERT INTO sites (name, url) VALUES (?, ?) RETURNING id').bind(siteUrl, siteUrl).first<{ id: number }>();
    if (!site) {
      throw new Error('Could not create site');
    }
  }
  const siteId = site.id;

  // Get or create list
  let list = await db.prepare('SELECT id FROM lists WHERE url = ?').bind(listUrl).first<{ id: number }>();
  if (!list) {
    list = await db.prepare('INSERT INTO lists (site_id, name, url) VALUES (?, ?, ?) RETURNING id').bind(siteId, listUrl, listUrl).first<{ id: number }>();
    if (!list) {
      throw new Error('Could not create list');
    }
  }
  const listId = list.id;

  for (const item of data) {
    // Get or create brand
    let brand = await db.prepare('SELECT id FROM brands WHERE name = ?').bind(item.name).first<{ id: number }>();
    if (!brand) {
      brand = await db.prepare('INSERT INTO brands (name) VALUES (?) RETURNING id').bind(item.name).first<{ id: number }>();
      if (!brand) {
        throw new Error('Could not create brand');
      }
    }
    const brandId = brand.id;

    // Insert ranking
    await db.prepare(
        'INSERT INTO rankings (list_id, brand_id, rank, rating, bonus_offer) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(listId, brandId, item.rank, item.rating, item.bonus_offer)
      .run();
  }
}
