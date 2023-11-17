import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

// ENVIRONMENT VARIABLE VALIDATION
const envVarsSchema = Joi.object<NodeJS.ProcessEnv>()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    APP_HOST: Joi.string().required(),
    PORT: Joi.number().required(),
    LOGGING_DIR: Joi.string().required(),
    LOGGING_LEVEL: Joi.string().required(),
    DB_CLIENT: Joi.string().required().description('Database client'),
    DB_HOST: Joi.string().required().description('Database hostname'),
    DB_PORT: Joi.number().required().description('Database port'),
    DB_NAME: Joi.string().required().description('Database name'),
    DB_USER: Joi.string().required().description('Database user'),
    DB_PASSWORD: Joi.string().required().description('Database password'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    TOKEN_EXPIRES: Joi.string().required(),
    // DIRECTORIES
    ROOT_PATH: Joi.string().required(),
    PUBLIC_PATH: Joi.string().required(),
    TEMP_DIR: Joi.string().required(),
  })
  .unknown();

const { error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
