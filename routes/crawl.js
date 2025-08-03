import express from 'express';
import FirecrawlApp from '@mendable/firecrawl-js';
import OpenAI from "openai";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Crawl endpoint is working!' });
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check API keys before making requests
    if (!process.env.FIRECRAWL_API_KEY) {
      return res.status(500).json({ error: 'Firecrawl API key not configured' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create OpenAI client with current environment variable
    const openAiClienti = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // FIRECRAWL API REQUEST
    const app = new FirecrawlApp({apiKey: process.env.FIRECRAWL_API_KEY});
    const crawlResponse = await app.crawlUrl(message, {
      limit: 1,
      scrapeOptions: {
        formats: ['markdown', 'html'],
      }
    });
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }
    
    const firecrawlRes = crawlResponse.data[0]?.html || '';
    console.log(firecrawlRes);

    // Step 2: OpenAI API request
    const response = await openAiClienti.responses.create({
      model: "gpt-4.1",
      input: "Summarize this website: " + firecrawlRes
    });

    console.log(response.output_text);
    const analysis = response.output_text;

    res.json({ 
      message: 'Analysis completed',
      url: message,
      analysis: analysis
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
});

export default router;