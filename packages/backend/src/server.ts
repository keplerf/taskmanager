import { env, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';
import app from './app.js';
import { migrateUsersToDefaultOrganization } from './services/auth.service.js';

validateEnv();

const server = app.listen(env.PORT, async () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  // Auto-migrate existing users to default organization
  try {
    const result = await migrateUsersToDefaultOrganization();
    if (result.migratedCount > 0) {
      logger.info(`Migrated ${result.migratedCount} user(s) to default organization`);
    }
  } catch (error) {
    logger.error('Failed to migrate users to default organization:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
