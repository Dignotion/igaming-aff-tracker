import { isAuthorized } from './auth';
import { scrapeUrl } from './scraper';
import { storeRankings } from './database';
import { renderHtml } from './renderHtml';

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const selectedBrand = url.searchParams.get('brand');

    const listsStmt = env.DB.prepare('SELECT * FROM lists');
    const { results: lists } = await listsStmt.all();

    const rankingsStmt = env.DB.prepare(`
      WITH LatestScrape AS (
        SELECT list_id, MAX(scraped_at) as max_scraped_at
        FROM rankings
        GROUP BY list_id
      ),
      PreviousScrape AS (
        SELECT list_id, MAX(scraped_at) as max_scraped_at
        FROM rankings
        WHERE scraped_at < (SELECT MAX(scraped_at) FROM rankings)
        GROUP BY list_id
      )
      SELECT
        r.list_id,
        r.brand_id,
        b.name as brand_name,
        r.rank,
        r.rating,
        r.bonus_offer,
        r.scraped_at,
        pr.rank as prev_rank,
        pr.rank - r.rank as rank_change
      FROM rankings r
      JOIN brands b ON r.brand_id = b.id
      JOIN LatestScrape ls ON r.list_id = ls.list_id AND r.scraped_at = ls.max_scraped_at
      LEFT JOIN rankings pr ON r.list_id = pr.list_id AND r.brand_id = pr.brand_id
      LEFT JOIN PreviousScrape ps ON pr.list_id = ps.list_id AND pr.scraped_at = ps.max_scraped_at
    `);
    const { results: rankings } = await rankingsStmt.all();

    let historicalData = [];
    const brandIdToQuery = selectedBrand || rankings[0]?.brand_id;
    if (brandIdToQuery) {
      const historicalDataStmt = env.DB.prepare('SELECT * FROM rankings WHERE brand_id = ? ORDER BY scraped_at DESC').bind(brandIdToQuery);
      const { results } = await historicalDataStmt.all();
      historicalData = results;
    }

    return new Response(renderHtml({ lists, rankings, historicalData, selectedBrand: brandIdToQuery }), {
      headers: {
        'content-type': 'text/html',
      },
    });
  },

  async scheduled(controller, env, ctx) {
    const urlToScrape = 'https://playright.co.uk/betting/page/sports/';
    const scrapedData = await scrapeUrl(urlToScrape, env.FIRECRAWL_API_KEY);

    if (scrapedData.length > 0) {
      await storeRankings(env.DB, urlToScrape, scrapedData);
    }
  },
} satisfies ExportedHandler<Env>;
