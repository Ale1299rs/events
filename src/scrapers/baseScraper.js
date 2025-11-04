import axios from 'axios';
import * as cheerio from 'cheerio';

export class BaseScraper {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch HTML from URL
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} - Cheerio object
   */
  async fetchPage(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 15000,
      });

      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse date string to ISO format
   * @param {string} dateStr - Date string
   * @returns {string|null} - ISO date string or null
   */
  parseDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Italian month names
      const months = {
        gennaio: 0, febbraio: 1, marzo: 2, aprile: 3,
        maggio: 4, giugno: 5, luglio: 6, agosto: 7,
        settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
      };

      // Try various date formats
      // Format: "15 gennaio 2025"
      const match1 = dateStr.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i);
      if (match1) {
        const [, day, month, year] = match1;
        const date = new Date(parseInt(year), months[month.toLowerCase()], parseInt(day));
        return date.toISOString();
      }

      // Format: "15/01/2025"
      const match2 = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match2) {
        const [, day, month, year] = match2;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toISOString();
      }

      // Try standard Date parsing
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      return null;
    } catch (error) {
      console.error('Error parsing date:', dateStr, error.message);
      return null;
    }
  }

  /**
   * Clean text content
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  /**
   * Extract price information
   * @param {string} text - Text containing price
   * @returns {Object} - Price info
   */
  extractPrice(text) {
    if (!text) return { price: null, price_min: null, price_max: null };

    const lowerText = text.toLowerCase();

    // Check for free
    if (lowerText.includes('gratis') || lowerText.includes('gratuito') || lowerText.includes('free')) {
      return { price: 'Gratis', price_min: 0, price_max: 0 };
    }

    // Extract numeric prices
    const priceMatch = text.match(/€?\s*(\d+(?:,\d+)?)\s*(?:-|–)\s*€?\s*(\d+(?:,\d+)?)/);
    if (priceMatch) {
      const min = parseFloat(priceMatch[1].replace(',', '.'));
      const max = parseFloat(priceMatch[2].replace(',', '.'));
      return {
        price: `€${min} - €${max}`,
        price_min: min,
        price_max: max,
      };
    }

    const singlePrice = text.match(/€?\s*(\d+(?:,\d+)?)/);
    if (singlePrice) {
      const price = parseFloat(singlePrice[1].replace(',', '.'));
      return {
        price: `€${price}`,
        price_min: price,
        price_max: price,
      };
    }

    return { price: text, price_min: null, price_max: null };
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  async scrape() {
    throw new Error('scrape() must be implemented by subclass');
  }
}
