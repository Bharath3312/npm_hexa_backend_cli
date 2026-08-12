import express, { Router } from "express";
import { toNodeHandler } from 'better-auth/node';
import { createAuth } from "./config/auth.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import adminRoute from "./routes/admin.routes.js";


const app = express();
const auth = createAuth();
const routes = Router();


// ── 1. request logger ────────────────────────────
app.use(requestLogger);

// ── 2. health check ──────────────────────────────
app.use('/health', (_, res) => res.send('Server is Running Healthy...'));

// ── 3. better auth ───────────────────────────────
app.all('/api/auth/*splat', toNodeHandler(auth));

// ── 4. body parser ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 5. routes ────────────────────────────────────
routes.use('/admin',adminRoute)
// routes.use('/user',userRout);
// routes.use('/admin',adminRoute)
app.use('/api/v1', routes);

app.get('/', (_, res) => res.json({ 
  success: true, 
  message: 'Copy Trading Bot API',
  version: '1.0.0'
}));








export default app;


// Real account
// -------------------
// apikey - zxkAOwXuKrkortZeCZ
// secret - dgr7huWardKEPujDHKA73GqT22DVozj5RTrx


// testnet account
// ------------------------
// apikey - zrjI2cFbv1LrUgFYM1
// secret - ehJu52tJKBfDipHPEmIW5oiyW5iVuIaeS8JK