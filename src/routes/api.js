const express = require('express');
const RAGPipeline = require('../services/ragPipeline');

const router = express.Router();
const ragPipeline = new RAGPipeline();

let isInitialized = false;

const initializeRAG = async () => {
  if (!isInitialized) {
    isInitialized = await ragPipeline.initialize();
  }
  return isInitialized;
};

router.post('/ask', async (req, res) => {
  try {
    const { question, userId } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    await initializeRAG();

    const result = await ragPipeline.processQuery(question, userId);

    res.json({
      question,
      answer: result.answer,
      sources: result.sources.map(source => ({
        title: source.title,
        source: source.source,
        author: source.author,
        timestamp: source.timestamp,
        url: source.url
      })),
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({
      error: 'Failed to process your question. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query, source, userId } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    await initializeRAG();

    const results = await ragPipeline.retrieveRelevantContent(query, userId);
    
    let filteredResults = results;
    if (source) {
      filteredResults = results.filter(r => r.source.toLowerCase().includes(source.toLowerCase()));
    }

    res.json({
      query,
      results: filteredResults.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
        source: result.source,
        author: result.author,
        timestamp: result.timestamp,
        url: result.url,
        relevanceScore: result.relevanceScore
      })),
      totalResults: filteredResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      error: 'Failed to perform search. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/sources', (req, res) => {
  res.json({
    availableSources: [
      {
        name: 'Teams',
        description: 'Microsoft Teams messages and channels',
        requiresAuth: true
      },
      {
        name: 'ADO Wiki',
        description: 'Azure DevOps Wiki pages and documentation',
        requiresAuth: false
      },
      {
        name: 'ADO Work Item',
        description: 'Azure DevOps work items and tasks',
        requiresAuth: false
      },
      {
        name: 'Engineering Hub',
        description: 'Internal engineering documentation and guides',
        requiresAuth: false
      }
    ]
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    ragInitialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for Teams Bot functionality (development only)
router.post('/test-bot', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    await initializeRAG();

    // Simulate Teams bot processing
    const result = await ragPipeline.processQuery(message, 'test-user');

    // Format response like Teams bot would
    let botResponse = `${result.answer}\n\n**Confidence:** ${result.confidence}%`;
    
    if (result.sources && result.sources.length > 0) {
      botResponse += "\n\n**📚 Sources:**\n";
      result.sources.forEach((source, index) => {
        const date = source.timestamp ? new Date(source.timestamp).toLocaleDateString() : 'Unknown date';
        const author = source.author || 'Unknown author';
        botResponse += `${index + 1}. **${source.title}** (${source.source})\n`;
        botResponse += `   📝 ${author} • ${date}\n`;
        if (source.url) {
          botResponse += `   🔗 [View Source](${source.url})\n`;
        }
        botResponse += "\n";
      });
    }

    res.json({
      message: message,
      botResponse: botResponse,
      confidence: result.confidence,
      sources: result.sources.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing bot:', error);
    res.status(500).json({
      error: 'Failed to process bot message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;