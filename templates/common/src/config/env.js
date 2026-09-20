import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });
const required = ['PORT', 'MONGO_URI', 'REDIS_URL'];
// for (const key of required) {
//   if (!process.env[key]) {
//     throw new Error(`Missing required env var: ${key}`);
//   }
// }

export const env = {
  port: process.env.PORT,

  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri: process.env.MONGO_URI,

  authSecret : process.env.AUTH_SECRET,
  baseUrl : process.env.BASE_URL,
  
  smtpHost : process.env.MAILHOST,
  smtpPort : process.env.MAILPORT || 465,
  smtpUser : process.env.MAIL,
  smtpPass : process.env.PASS,
  support_mail : process.env.SUPPORTMAIL,
  mail_footer : process.env.MAIL_FOOTER,
  from_mail : process.env.FROM_MAIL,

  app_name : process.env.APP_NAME,
  image_url : process.env.IMAGEURL,

  redisUrl : process.env.REDIS_URL,
  redisHost : process.env.REDIS_URI,
  redisPort : process.env.REDIS_PORT,
  redisPassword : process.env.REDIS_PASSWORD,

  bullBoardUser : process.env.BULL_BOARD_USER,
  bullBoardPassword :process.env.BULL_BOARD_PASS,

  logRetentionDays : process.env.LOG_RETENTION_DAYS,


  bucket_endpoint : process.env.BUCKET_ENDPOINT,
  bucket_region : process.env.BUCKET_REGION,
  bucket_accessId : process.env.BUCKET_ACCESSID,
  bucket_secretKey : process.env.BUCKET_SECRETKEY,
  bucket_name : process.env.BUCKET_NAME
};
