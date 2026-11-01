import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viewsPath = path.resolve(__dirname, '../views');

export const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort || 465,
  secure: false,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

transporter.use(
  'compile',
  hbs({
    viewEngine: { extName: '.handlebars', partialsDir: viewsPath, defaultLayout: false },
    viewPath: viewsPath,
    extName: '.handlebars',
  }),
);