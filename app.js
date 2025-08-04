import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';


import messageRoutes from './routes/message.js';
import crawlRoutes from './routes/crawl.js';  
import ragRoutes from './routes/rag.js';  

const app = express();

app.use(cors()); // Enable CORS for all origins by default
app.use(express.json()); // to parse JSON request bodies

// Routes
app.use('/message', messageRoutes);
app.use('/crawl', crawlRoutes);
app.use('/rag', ragRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
