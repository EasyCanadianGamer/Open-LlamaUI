const express = require('express');
const { Ollama } = require('ollama');
const router = express.Router();

// Initialize Ollama client
const ollama = new Ollama();

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant.";

router.get('/', (req, res) => {
    res.send('Hello from the playground server!');
  });
router.post('/', async (req, res) => {

  const { prompt, systemPrompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Use provided systemPrompt or fall back to the default one
    const selectedSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

    // Send request to the model with both system and user prompts
    const response = await ollama.generate({
      model: 'Godmoded/llama3-lexi-uncensored:latest',
      system: selectedSystemPrompt,
      prompt,
    });

    // Return the response from the model
    res.json(response);
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ error: 'Failed to communicate with the model' });
  }
});

module.exports = router;
