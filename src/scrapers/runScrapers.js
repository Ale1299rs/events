import { EventScraperService } from './index.js';

async function main() {
  const scraperService = new EventScraperService();

  try {
    await scraperService.scrapeAndSave();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
