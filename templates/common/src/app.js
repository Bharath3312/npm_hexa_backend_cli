import cors from 'cors';
import express, { Router } from "express";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import userRoute from "./routes/user.route.js";
import { env } from './config/env.js';


const app = express();
const routes = Router();


// ── 1. request logger ────────────────────────────
app.use(requestLogger);

// ── 2. health check ──────────────────────────────
app.use('/health', (_, res) => res.send('Server is Running Healthy...'));


// ── 3. body parser ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin:"*",
    credentials: true,
  }),
);
// ── 4. routes ────────────────────────────────────
routes.use('/user',userRoute)
// routes.use('/admin',adminRoute)
app.use('/api/v1', routes);

app.get('/', (_, res) => res.json({ 
  success: true, 
  message: env.app_name,
  version: '1.0.0'
}));


export default app;
