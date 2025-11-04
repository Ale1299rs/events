import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export class GeminiAI {
  /**
   * Categorize an event using AI
   * @param {Object} event - Event data
   * @returns {Promise<Object>} - Category name and confidence
   */
  static async categorizeEvent(event) {
    try {
      const prompt = `Analizza questo evento a Roma e determina la categoria più appropriata.

Evento:
Titolo: ${event.title}
Descrizione: ${event.description || 'N/A'}
Location: ${event.location || 'N/A'}

Categorie disponibili:
- music (Musica & Concerti)
- art (Arte & Mostre)
- sports (Sport)
- food (Food & Wine)
- nightlife (Nightlife)
- family (Famiglia & Bambini)
- theater (Teatro & Spettacoli)
- culture (Cultura & Conferenze)
- cinema (Cinema)
- markets (Mercati & Fiere)

Rispondi SOLO con il nome della categoria in inglese (es: "music", "art", "sports", etc.).
Se non sei sicuro, scegli la categoria più vicina.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim().toLowerCase();

      // Validate category
      const validCategories = [
        'music', 'art', 'sports', 'food', 'nightlife',
        'family', 'theater', 'culture', 'cinema', 'markets'
      ];

      if (validCategories.includes(category)) {
        return { category, confidence: 'high' };
      }

      // Default fallback
      return { category: 'culture', confidence: 'low' };
    } catch (error) {
      console.error('Error categorizing event:', error.message);
      return { category: 'culture', confidence: 'low' };
    }
  }

  /**
   * Generate tags for an event
   * @param {Object} event - Event data
   * @returns {Promise<Array>} - Array of tags
   */
  static async generateTags(event) {
    try {
      const prompt = `Analizza questo evento e genera 3-5 tag/parole chiave rilevanti in italiano.

Evento:
Titolo: ${event.title}
Descrizione: ${event.description || 'N/A'}

Rispondi SOLO con i tag separati da virgola (es: "jazz, musica dal vivo, concerto").`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tagsText = response.text().trim();

      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
    } catch (error) {
      console.error('Error generating tags:', error.message);
      return [];
    }
  }

  /**
   * Generate personalized event recommendations
   * @param {Array} events - Array of events
   * @param {Array} userCategories - User's subscribed categories
   * @returns {Promise<Array>} - Sorted events by relevance
   */
  static async recommendEvents(events, userCategories) {
    try {
      // Simple scoring: prioritize subscribed categories
      const scoredEvents = events.map(event => {
        let score = 0;

        // Check if event category matches user preferences
        if (userCategories.some(cat => cat.id === event.category_id)) {
          score += 10;
        }

        // Boost recent events
        const daysUntilEvent = Math.ceil(
          (new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEvent <= 3) score += 5;
        else if (daysUntilEvent <= 7) score += 3;

        // Boost free events
        if (event.price && event.price.toLowerCase().includes('gratis')) {
          score += 2;
        }

        return { ...event, score };
      });

      return scoredEvents.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error recommending events:', error.message);
      return events;
    }
  }

  /**
   * Enhance event description with AI
   * @param {Object} event - Event data
   * @returns {Promise<string>} - Enhanced description
   */
  static async enhanceDescription(event) {
    try {
      const prompt = `Migliora questa descrizione di evento rendendola più accattivante e concisa (max 150 parole).
Mantieni tutte le informazioni importanti.

Titolo: ${event.title}
Descrizione originale: ${event.description || 'Nessuna descrizione disponibile'}

Rispondi SOLO con la descrizione migliorata in italiano.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error enhancing description:', error.message);
      return event.description;
    }
  }

  /**
   * Extract structured data from event text
   * @param {string} text - Raw event text
   * @returns {Promise<Object>} - Structured event data
   */
  static async extractEventData(text) {
    try {
      const prompt = `Estrai le informazioni strutturate da questo testo di evento:

${text}

Rispondi in formato JSON con questi campi:
{
  "title": "titolo evento",
  "date": "data in formato ISO o null",
  "location": "luogo",
  "price": "prezzo o 'Gratis'",
  "description": "breve descrizione"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();

      // Try to parse JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.error('Error extracting event data:', error.message);
      return null;
    }
  }
}
