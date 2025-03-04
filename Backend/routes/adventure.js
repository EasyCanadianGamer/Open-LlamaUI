const express = require('express');
const { Ollama } = require('ollama');
const router = express.Router();

const ollama = new Ollama();

// In-memory "sessions" for ongoing stories
const sessions = {};
router.get('/', (req, res) => {
    res.send('Hello from the Adventure server!');
  });
  
router.post('/generate', async (req, res) => {

  try {
    const { sessionId, prompt, length } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize session if it doesn't exist
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    // Add user input to session
    sessions[sessionId].push({ role: 'user', content: prompt });

    // Define system instruction for response length
    let lengthInstruction = '';
    if (length === 'short') {
      lengthInstruction = 'Respond with only one paragraph.';
    } else if (length === 'long') {
      lengthInstruction = 'Respond with at least two paragraphs of detailed text.';
    } else if (length === 'none') {
      lengthInstruction = 'Acknowledge but do not continue the story.';
    }

    // Add system message to influence AI output
    sessions[sessionId].push({ role: 'system', content: lengthInstruction });

    // Generate AI response
    const response = await ollama.chat({
      model: 'Godmoded/llama3-lexi-uncensored:latest',
      messages: sessions[sessionId],
      options: {
        max_tokens: length === 'short' ? 100 : length === 'long' ? 300 : 50, // Adjust max tokens dynamically
      },
    });

    const aiResponse = response.message.content;

    // Store AI response in session history
    if (length !== 'none') {
      sessions[sessionId].push({ role: 'assistant', content: aiResponse });
    }

    res.json({ response: aiResponse, sessionId });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
