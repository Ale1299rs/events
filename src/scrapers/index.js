import { RomaTodayScraper } from './romaTodayScraper.js';
import { ZeroScraper } from './zeroScraper.js';
import { db } from '../database/supabase.js';
import { GeminiAI } from '../ai/gemini.js';

export class EventScraperService {
  constructor() {
    this.scrapers = [
      new RomaTodayScraper(),
      new ZeroScraper(),
      // Add more scrapers here
    ];
  }

  /**
   * Run all scrapers and save events to database
   * @returns {Promise<Array>} - Array of new events
   */
  async scrapeAndSave() {
    console.log('🚀 Starting event scraping...');
    const allEvents = [];
    const newEvents = [];

    // Run all scrapers
    for (const scraper of this.scrapers) {
      try {
        const events = await scraper.scrape();
        allEvents.push(...events);
      } catch (error) {
        console.error(`Error running scraper ${scraper.name}:`, error.message);
      }
    }

    console.log(`📊 Total events scraped: ${allEvents.length}`);

    // Process and save events
    for (const eventData of allEvents) {
      try {
        // Skip events without title
        if (!eventData.title) continue;

        // Use AI to categorize event
        console.log(`🤖 Categorizing: ${eventData.title}`);
        const { category } = await GeminiAI.categorizeEvent(eventData);

        // Get category ID
        const categoryRecord = await db.getCategoryByName(category);
        if (!categoryRecord) {
          console.warn(`Category not found: ${category}`);
          continue;
        }

        // Generate AI tags
        const tags = await GeminiAI.generateTags(eventData);

        // Prepare event for database
        const event = {
          ...eventData,
          category_id: categoryRecord.id,
          ai_tags: tags,
          is_published: true,
        };

        // Save to database
        const savedEvent = await db.createEvent(event);

        if (savedEvent) {
          newEvents.push(savedEvent);
          console.log(`✅ Saved: ${savedEvent.title}`);
        }
      } catch (error) {
        console.error(`Error processing event:`, error.message);
      }
    }

    console.log(`\n✨ Scraping complete! ${newEvents.length} new events added.`);
    return newEvents;
  }

  /**
   * Run a specific scraper
   * @param {string} scraperName - Name of scraper to run
   * @returns {Promise<Array>} - Scraped events
   */
  async runScraper(scraperName) {
    const scraper = this.scrapers.find(s => s.name.toLowerCase() === scraperName.toLowerCase());

    if (!scraper) {
      throw new Error(`Scraper not found: ${scraperName}`);
    }

    return await scraper.scrape();
  }
}
