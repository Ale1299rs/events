import { BaseScraper } from './baseScraper.js';

export class ZeroScraper extends BaseScraper {
  constructor() {
    super('Zero.eu', 'https://www.zero.eu');
  }

  async scrape() {
    console.log('🔍 Scraping Zero.eu...');
    const events = [];

    try {
      // Zero.eu Rome events page
      const url = `${this.baseUrl}/it/roma/eventi`;
      const $ = await this.fetchPage(url);

      // Find event listings
      $('.event-item, .event-card, article').each((i, elem) => {
        try {
          const $elem = $(elem);

          const title = this.cleanText(
            $elem.find('h2, h3, .title').first().text()
          );

          if (!title) return;

          const link = $elem.find('a').first().attr('href');
          const url = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : null;

          const image = $elem.find('img').first().attr('src');
          const dateText = this.cleanText($elem.find('.date, time').first().text());
          const location = this.cleanText($elem.find('.location, .venue').first().text());
          const description = this.cleanText($elem.find('.description, p').first().text());

          const event = {
            title,
            description: description || title,
            event_date: this.parseDate(dateText),
            location: location || 'Roma',
            url,
            image_url: image ? (image.startsWith('http') ? image : `${this.baseUrl}${image}`) : null,
            source: 'zero',
            source_id: url ? url.split('/').pop() : `zero-${Date.now()}-${i}`,
            price: null,
            price_min: null,
            price_max: null,
          };

          events.push(event);
        } catch (error) {
          console.error('Error parsing Zero event:', error.message);
        }
      });

      console.log(`✅ Zero.eu: Found ${events.length} events`);
      return events;
    } catch (error) {
      console.error('Error in Zero scraper:', error.message);
      return [];
    }
  }
}
