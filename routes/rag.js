import express from 'express';
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js'

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'RAG endpoint is working!' });
});

router.post('/', async (req, res) => {
  try {
    const { urls } = req.body;
    console.log("rag trying urls");
    console.log(urls);
    if (!urls) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const { chatmessage } = req.body;
    console.log(chatmessage);
    
    // Check API keys before making requests
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create OpenAI client with current environment variable
    const openAiClienti = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    


    // get supabase data
    const urlsToMatch = urls;  // array of strings
    console.log(urlsToMatch, "urls to match");

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );


    const urlsToMatchjsonified = JSON.stringify(urlsToMatch);
    const { data, error } = await supabase
      .from('crawled_data')
      .select('data, url, created_at')
      .contains('url', urlsToMatchjsonified)  // check if jsonb array overlaps with urlsToMatch
      .order('created_at', { ascending: false })
      .limit(1); // Most recent matching row

    if (error) {
      console.error('Error fetching from supabase:', error.message);
    } else if (!data || data.length === 0) {
      console.log('No match found in supabase');
    } 


    const mostRecentData = data[0].data;
    console.log('Most recent match in supabase:', mostRecentData);
    const mostRecentDataString = JSON.stringify(mostRecentData, null, 2);

    // RAG prompt construction
    const ragPrompt = `Based on the  context ${mostRecentDataString} --------
    , answer the following question: ${chatmessage}`;

    console.log('Sending RAG request to OpenAI');
    
    // OpenAI API request for RAG
    const response = await openAiClienti.responses.create({
      model: "gpt-4.1",
      input: ragPrompt
    });

    console.log('RAG response received');
    const answer = response.output_text;
    console.log(answer)
    res.json({ 
      message: 'RAG query completed',
      answer: answer,
      model: "gpt-4.1"
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'RAG processing failed', details: error.message });
  }
});

export default router; 