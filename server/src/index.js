import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemsRouter from './routes/items.js';
import aiRouter from './routes/ai.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CRITICAL: This allows your frontend to talk to your backend
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies from the frontend

app.get('/', (req, res) => {
  res.send('SpecPedia Backend is running! 🚀');
});

app.use('/api/items', itemsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/ai', chatRouter); // Mounting the chat route

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});