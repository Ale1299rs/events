import cron from 'node-cron';
import { EventBot } from './bot/index.js';
import { EventScraperService } from './scrapers/index.js';
import { NotificationService } from './notifications/notificationService.js';
import { config } from './config.js';

class RomaEventsApp {
  constructor() {
    this.bot = null;
    this.scraperService = null;
    this.notificationService = null;
    this.jobs = [];
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('🚀 Initializing Roma Events Bot...\n');

    try {
      // Initialize bot
      console.log('🤖 Starting Telegram bot...');
      this.bot = new EventBot();
      this.bot.start();

      // Initialize services
      this.scraperService = new EventScraperService();
      this.notificationService = new NotificationService(this.bot);

      console.log('✅ Bot initialized successfully!\n');

      // Setup scheduled jobs
      this.setupScheduledJobs();

      // Run initial scraping
      if (config.app.nodeEnv === 'production') {
        console.log('🔍 Running initial event scraping...');
        await this.runScraping();
      }

      console.log('\n✨ Application is running!\n');
      console.log('📋 Scheduled jobs:');
      console.log(`   - Event scraping: Every ${config.app.scrapeInterval} minutes`);
      console.log('   - Daily digest: Every day at 09:00\n');

    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      process.exit(1);
    }
  }

  /**
   * Setup scheduled jobs
   */
  setupScheduledJobs() {
    // Scrape events periodically
    const scrapeSchedule = `*/${config.app.scrapeInterval} * * * *`;
    console.log(`⏰ Scheduling event scraping: ${scrapeSchedule}`);

    const scrapeJob = cron.schedule(scrapeSchedule, async () => {
      console.log('\n⏰ Scheduled scraping triggered');
      await this.runScraping();
    });

    this.jobs.push(scrapeJob);

    // Send daily digests at 9 AM
    const digestJob = cron.schedule('0 9 * * *', async () => {
      console.log('\n⏰ Sending daily digests');
      await this.notificationService.sendDailyDigests();
    });

    this.jobs.push(digestJob);
  }

  /**
   * Run event scraping and send notifications
   */
  async runScraping() {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('🔍 SCRAPING EVENTS');
      console.log('='.repeat(60));

      const newEvents = await this.scraperService.scrapeAndSave();

      if (newEvents.length > 0) {
        console.log(`\n📢 Notifying users about ${newEvents.length} new events...`);
        await this.notificationService.notifyNewEvents(newEvents);
      } else {
        console.log('\nℹ️ No new events found');
      }

      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('❌ Error during scraping:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('\n🛑 Shutting down application...');

    // Stop all cron jobs
    this.jobs.forEach(job => job.stop());

    // Stop bot
    if (this.bot) {
      await this.bot.stop();
    }

    console.log('✅ Application stopped');
    process.exit(0);
  }
}

// Create and start application
const app = new RomaEventsApp();

// Handle graceful shutdown
process.on('SIGINT', () => app.shutdown());
process.on('SIGTERM', () => app.shutdown());

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  app.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the application
app.initialize();
