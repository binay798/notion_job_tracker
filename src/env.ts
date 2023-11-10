import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

// ENVIRONMENT VARIABLE VALIDATION
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    APP_HOST: Joi.string().required(),
    PORT: Joi.number().required(),
    LOG_DIR: Joi.string().required(),
    LOG_LEVEL: Joi.string().required(),
    DB_CLIENT: Joi.string().required().description('Database client'),
    DB_HOST: Joi.string().required().description('Database hostname'),
    DB_PORT: Joi.number().required().description('Database port'),
    DB_NAME: Joi.string().required().description('Database name'),
    DB_USER: Joi.string().required().description('Database user'),
    DB_PASSWORD: Joi.string().required().description('Database password'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    DEFAULT_PASSWORD: Joi.string().required().description('Default system password'),
    TOKEN_EXPIRES: Joi.string().required(),
    FRONTEND_URL: Joi.string().description('Frontend app url.'),
    // DIRECTORIES
    PUBLIC_PATH: Joi.string().required(),
    TEMPDIR: Joi.string().required(),
    USERPATH: Joi.string().required(),
  })
  .unknown();

const { error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
