import { BaseScraper } from './baseScraper.js';

export class RomaTodayScraper extends BaseScraper {
  constructor() {
    super('RomaToday', 'https://www.romatoday.it');
  }

  async scrape() {
    console.log('🔍 Scraping RomaToday...');
    const events = [];

    try {
      // Scrape main events page
      const mainEvents = await this.scrapeEventsPage('/eventi/');
      events.push(...mainEvents);

      // Scrape specific categories
      const categories = [
        '/eventi/musica/',
        '/eventi/spettacoli/',
        '/eventi/mostre/',
        '/eventi/sport/',
      ];

      for (const category of categories) {
        try {
          const categoryEvents = await this.scrapeEventsPage(category);
          events.push(...categoryEvents);
        } catch (error) {
          console.error(`Error scraping ${category}:`, error.message);
        }
      }

      console.log(`✅ RomaToday: Found ${events.length} events`);
      return events;
    } catch (error) {
      console.error('Error in RomaToday scraper:', error.message);
      return [];
    }
  }

  async scrapeEventsPage(path) {
    const url = `${this.baseUrl}${path}`;
    const $ = await this.fetchPage(url);
    const events = [];

    // RomaToday uses article elements for events
    $('.events-list article, .event-card, [data-testid="event-card"]').each((i, elem) => {
      try {
        const $elem = $(elem);

        // Extract title
        const title = this.cleanText(
          $elem.find('h2, h3, .event-title, [data-testid="event-title"]').first().text()
        );

        if (!title) return;

        // Extract link
        const link = $elem.find('a').first().attr('href');
        const url = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : null;

        // Extract image
        const image = $elem.find('img').first().attr('src');

        // Extract date
        const dateText = this.cleanText(
          $elem.find('.event-date, time, .date, [data-testid="event-date"]').first().text()
        );

        // Extract location
        const location = this.cleanText(
          $elem.find('.event-location, .location, [data-testid="event-location"]').first().text()
        );

        // Extract description
        const description = this.cleanText(
          $elem.find('.event-description, .description, p').first().text()
        );

        // Extract price if available
        const priceText = this.cleanText(
          $elem.find('.event-price, .price').first().text()
        );

        const event = {
          title,
          description: description || title,
          event_date: this.parseDate(dateText),
          location: location || 'Roma',
          url,
          image_url: image,
          source: 'romatoday',
          source_id: url ? url.split('/').pop() : `romatoday-${Date.now()}-${i}`,
          ...this.extractPrice(priceText),
        };

        // Only add events with valid dates or recent ones
        if (event.event_date || !event.event_date) {
          events.push(event);
        }
      } catch (error) {
        console.error('Error parsing event element:', error.message);
      }
    });

    return events;
  }

  /**
   * Scrape detailed event page
   * @param {string} url - Event URL
   * @returns {Promise<Object>} - Detailed event data
   */
  async scrapeEventDetail(url) {
    try {
      const $ = await this.fetchPage(url);

      const title = this.cleanText($('h1').first().text());
      const description = this.cleanText($('.event-description, .article-body').first().text());
      const dateText = this.cleanText($('.event-date, time').first().text());
      const location = this.cleanText($('.event-location').first().text());
      const address = this.cleanText($('.event-address').first().text());
      const priceText = this.cleanText($('.event-price').first().text());
      const image = $('meta[property="og:image"]').attr('content') || $('.event-image img').first().attr('src');

      return {
        title,
        description,
        event_date: this.parseDate(dateText),
        location: location || 'Roma',
        address,
        url,
        image_url: image,
        source: 'romatoday',
        source_id: url.split('/').pop(),
        ...this.extractPrice(priceText),
      };
    } catch (error) {
      console.error(`Error scraping event detail ${url}:`, error.message);
      return null;
    }
  }
}
