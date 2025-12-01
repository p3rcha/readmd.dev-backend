/// <reference path="./types/express.d.ts" />
import dotenv from 'dotenv';
import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';

dotenv.config();

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

