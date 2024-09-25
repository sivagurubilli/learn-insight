dotenv.config({ path: sourceDotConfig() });

//MAIN_SERVER_CONFIGURATIONS
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { sourceDotConfig } from './utils/env/getEnvFilePath.js';
import { databaseConnection } from './config/index.js';
import { getWinstonMiddleware } from './middlewares/winstonMiddleware.js';
import { getLoggerWithLabel } from './utils/logger/logger.js';
import routes from './src/routes/index.js';

const app = express();
const logger = getLoggerWithLabel('SERVER');
app.use(getWinstonMiddleware);
app.use(cors());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

app.use(
  express.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 5000000,
  }),
);
app.use(
  express.json({ limit: '500mb', extended: true, parameterLimit: 5000000 }),
);

// HEALTH_CHECK_ROUTES
app.get('/', async (req, res) => {
  logger.info('Successfully server working');
  res.send(
    `WELCOME TO LEARNINSIGHT BACKEND ${process.env.ENVIRONMENT} APPLICATION`,
  );
});

//MERGING_ALL_ROUTES
app.use('/api', routes);

//INITIATING_SERVER_AND_DATABASE
app.listen(process.env.EXPRESS_PORT, async function () {
  logger.info(`PORT NUMBER: ${process.env.EXPRESS_PORT}`);
  logger.info(`ENVIRONMENT: ${process.env.ENVIRONMENT}`);
  logger.info(`SERVER STATUS: SUCCESS`);

  const dbLogger = getLoggerWithLabel('DATABASE');
  await databaseConnection()
    .then(async () => {
      dbLogger.info(`MONGO DB STATUS: SUCCESS`);
    })
    .catch((e) => {
      dbLogger.error('Unable to connect to MONGO-DB.Try again');
    });
});

export default app;
