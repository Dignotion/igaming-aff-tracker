import Firecrawl from '@mendable/firecrawl-js';

export interface ScrapedData {
  name: string;
  rank: number;
  rating?: string;
  bonus_offer?: string;
}

export async function scrapeUrl(url: string, apiKey: string): Promise<ScrapedData[]> {
  const firecrawl = new Firecrawl(apiKey);

  try {
    const result = await firecrawl.scrape(url, {
      extractor: {
        mode: 'llm-extraction',
        json_schema: {
          type: 'object',
          properties: {
            brands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'The name of the brand' },
                  rank: { type: 'number', description: 'The rank of the brand in the list' },
                  rating: { type: 'string', description: 'The rating of the brand' },
                  bonus_offer: { type: 'string', description: 'The bonus offer for the brand' },
                },
                required: ['name', 'rank'],
              },
            },
          },
          required: ['brands'],
        },
      },
    });

    if (result && result.llm_extraction) {
      return result.llm_extraction.brands;
    }

    return [];
  } catch (error) {
    console.error('Error scraping URL:', error);
    return [];
  }
}
