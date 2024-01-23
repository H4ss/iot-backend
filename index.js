import 'dotenv/config';
import express from 'express';
import firebaseApp from './firebase-config.js';
import testRoute from './routes/testFirebaseAdmin.js';
import admin from './firebaseAdmin.js';
import userRoute from './routes/usersRoutes.js';

const router = express.Router();
const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

// config
app.use(express.json());

// Testing routes
app.use('/test-firebase', testRoute);

// User routes
app.use('/api/user', userRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});