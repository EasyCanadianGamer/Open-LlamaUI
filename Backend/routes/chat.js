const express = require('express');
const { Ollama } = require('ollama'); // Ensure Ollama client is properly installed
const router = express.Router();

// Initialize Ollama client
const ollama = new Ollama();

router.get('/', (req, res) => {
    res.send('Hello from the Chat server!');
  });
  const cleanResponse = (text) => {
    return text.replace(/<START>/g, "").replace(/{{char}}/g, "").trim();
  };
  
  router.post('/', async (req, res) => {  
    const { message, character } = req.body;
  
    if (!message || !character) {
      return res.status(400).json({ error: 'Message and character data are required' });
    }
  
    const systemPrompt = `
  ### Character Profile ###
  - **Name:** ${character.name}
  - **Personality:** ${character.personality || "A neutral AI with no specific traits."}
  - **Scenario:** ${character.scenario || "You are chatting with a user."}
  - **Speaking Style:** ${character.talkativeness > 0.7 ? "Talkative and expressive" : "Concise and to the point"}
  - **Creator Notes:** ${character.creator_comment || "No special instructions"}
  
  ### Chat Instructions ###
  - Stay in character at all times.
  - Respond naturally based on the provided personality and scenario.
  - Use the provided example dialogues to match expected responses.
  `;
  
    let chatHistory = [{ role: 'system', content: systemPrompt }];
  
    if (character.mes_example) {
      chatHistory.push({ role: 'assistant', content: character.mes_example });
    }
  
    if (!message.trim() && character.first_mes) {
      chatHistory.push({ role: 'assistant', content: character.first_mes });
    } else {
      chatHistory.push({ role: 'user', content: message });
    }
  
    try {
      const response = await ollama.chat({
        model: 'Godmoded/llama3-lexi-uncensored:latest',
        messages: chatHistory,
      });
  
      res.json({ text: cleanResponse(response.message?.content || 'No response') });
    } catch (error) {
      console.error('Error calling AI model:', error);
      res.status(500).json({ error: 'Failed to get AI response', details: error.message });
    }
  });
  
module.exports = router;
