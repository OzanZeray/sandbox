import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import messageRoutes from './routes/message.js';
import crawlRoutes from './routes/crawl.js';  

const app = express();

app.use(cors()); // Enable CORS for all origins by default
app.use(express.json()); // to parse JSON request bodies

// Routes
app.use('/message', messageRoutes);
app.use('/crawl', crawlRoutes);
console.log("Using OpenAI key:", process.env.OPENAI_API_KEY);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
