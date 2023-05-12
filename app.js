const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/process-bookmarks', express.json(), async (req, res) => {
    const { bookmarks } = req.body;
  
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
  
    try {
      for (let i = 0; i < bookmarks.length; i++) {
        const { summary, category } = await getSummaryAndCategory(bookmarks[i].url);
  
        const processedBookmark = {
          ...bookmarks[i],
          summary: summary,
          category: category,
        };
  
        res.write(JSON.stringify(processedBookmark));
        console.log(`Processed bookmark ${i + 1} of ${bookmarks.length}`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing bookmarks');
    } finally {
      res.end();
    }
  });
  

  async function getSummaryAndCategory(url) {
    try {
      const prompt = `Please provide a one-line summary and a category for the following URL: ${url}`;
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: prompt,
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.8,
      });
  
      // Log the response from OpenAI
      console.log(`OpenAI response for URL "${url}":`, response);
  
      const result = response.choices[0].text.trim();
      const [summary, category] = result.split(/\s*\|\s*/);
      return { summary, category };
    } catch (error) {
      console.error(error);
      return { summary: "Error generating summary", category: "Error generating category" };
    }
  }
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
