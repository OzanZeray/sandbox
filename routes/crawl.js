import express from 'express';
import FirecrawlApp from '@mendable/firecrawl-js';
import OpenAI from "openai";


import { createClient } from '@supabase/supabase-js'


const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Crawl endpoint is working!' });
});

router.post('/', async (req, res) => {
  try {   
    const { urls } = req.body;
    if (!urls) {
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

    
    const app = new FirecrawlApp({apiKey: process.env.FIRECRAWL_API_KEY});



    const URLS = urls

    const results = {
      crawl: []
    };
    
    // FIRECRAWL API REQUEST
    for (const url of URLS) {
      try {
        // Step 1: Firecrawl API request
        const crawlResponse = await app.crawlUrl(url, {
          limit: 1,
          scrapeOptions: {
            formats: ['html'],
          }
        });
    
        if (!crawlResponse.success) {
          console.error(`Failed to crawl ${url}: ${crawlResponse.error}`);
          continue;
        }
    
        const firecrawlRes = crawlResponse.data[0]?.html || '';
    
        // Step 2: OpenAI API request
        const response = await openAiClienti.responses.create({
          model: "gpt-4.1",
          input: "Summarize this website: " + firecrawlRes
        });
    
        const analysis = response.output_text;
    
        // Save result
        results.crawl.push({
          url: url,
          data: analysis
        });
    
        console.log(`Processed ${url}`);
    
      } catch (err) {
        console.error(`Error processing ${url}:`, err.message);
      }
    }
    console.log("--------------------------------");
    console.log(results);

    // Save result to supabase

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('crawled_data')
      .insert([{ data: results, url: URLS }]);

    if (error) {
      console.error(error);
    }
    
    

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
  res.send('crawled');     /// başarıyla crawl edildi
});

export default router;