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
      SITE_VISIT_DIR: string;
      QUOTE_DIR: string;
      JOBS_PATH: string;
      QUOTES_PATH: string;
      USER_PATH: string;
      JOB_QUOTE_DIR: string;
      SIGN_OFF_PATH: string;
      INVOICE_PATH: string;
      FILES_PATH: string;
      COMPANY_PATH: string;
      PURCHASE_ORDER_PDF_PATH: string;
      PYTHONDIR: string;
      PDF_PATH: string;
      FORM_DATA_TYPE_FILE_PATH: string;
      TEMP_DIR: string;
      ROOT_PATH: string;
      VEHICLE_PATH: string;
      OWNER_PATH: string;
      PRELIMINARY_PDF_PATH: string;
      TEST_APP_PORT: string;
      TEST_DB_HOST: string;
      TEST_DB_PORT: number;
      TEST_DB_NAME: string;
      TEST_DB_USER: string;
      TEST_DB_PASSWORD: string;
      DEFAULT_SIGNUP_PASS: string;
      S3_REGION: string;
      S3_BUCKET_NAME: string;
      S3_USER_ACCESS_KEY_ID: string;
      S3_USER_SECRET_ACCESS_KEY: string;
      S3_IMAGE_URL: string;
      ANDROID_APK: string;
    }
  }
}
