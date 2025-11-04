module.exports = {
  apps: [
    {
      name: 'roma-events-bot',
      script: './src/index.js',

      // Configurazione ambiente
      env: {
        NODE_ENV: 'production',
      },

      // PM2 Settings
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart settings
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',

      // Restart on crashes
      min_uptime: '10s',
      max_restarts: 10,

      // Logs
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Performance
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Restart scheduling (optional - restart every night at 3 AM)
      cron_restart: '0 3 * * *',

      // Environment variables (override with .env file)
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  // PM2 Deploy Configuration (optional)
  deploy: {
    production: {
      user: 'pi',
      host: 'raspberry-pi',
      ref: 'origin/claude/oo-implementation-011CUoaqqXpMsrZQ9JQrxCgu',
      repo: 'https://github.com/TUO_USERNAME/events.git',
      path: '/home/pi/events',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
    },
  },
};
