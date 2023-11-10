export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      APP_NAME: string;
      APP_VERSION: string;
      APP_HOST: string;
      PORT: string;
      LOGGING_DIR: string;
      LOGGING_LEVEL: string;
      DB_CLIENT: string;
      DB_HOST: string;
      DB_PORT: number;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      JWT_SECRET: string;
      TOKEN_EXPIRES: string;
      PUBLIC_PATH: string;
      TEMP_DIR: string;
      ROOT_PATH: string;
      TEST_APP_PORT: string;
      TEST_DB_HOST: string;
      TEST_DB_PORT: number;
      TEST_DB_NAME: string;
      TEST_DB_USER: string;
      TEST_DB_PASSWORD: string;
    }
  }
}
