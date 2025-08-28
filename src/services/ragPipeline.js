const MicrosoftGraphService = require('../api/microsoftGraph');
const AzureDevOpsService = require('../api/azureDevOps');
const EngineeringHubService = require('../api/engineeringHub');
const VectorSearchService = require('./vectorSearch');
const { OpenAI } = require('openai');

class RAGPipeline {
  constructor() {
    this.graphService = new MicrosoftGraphService();
    this.adoService = new AzureDevOpsService();
    this.engineeringHubService = new EngineeringHubService();
    this.vectorSearchService = new VectorSearchService();
    
    // Initialize OpenAI client with Azure OpenAI configuration from .env
    this.openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      }
    });
    
    console.log(`RAG Pipeline using Azure OpenAI deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`);
  }

  async initialize() {
    try {
      await this.graphService.initialize();
      console.log('RAG Pipeline initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize RAG Pipeline:', error);
      return false;
    }
  }

  async retrieveRelevantContent(query, userId = null) {
    try {
      const results = [];

      const [teamsResults, adoWikiResults, adoWorkItems, hubResults, vectorResults] = await Promise.allSettled([
        this.searchTeams(query, userId),
        this.adoService.searchWiki(query),
        this.adoService.searchWorkItems(query),
        this.engineeringHubService.search(query),
        this.vectorSearchService.hybridSearch(query, 3)
      ]);

      if (teamsResults.status === 'fulfilled') {
        results.push(...teamsResults.value);
      }

      if (adoWikiResults.status === 'fulfilled') {
        results.push(...adoWikiResults.value);
      }

      if (adoWorkItems.status === 'fulfilled') {
        results.push(...adoWorkItems.value);
      }

      if (hubResults.status === 'fulfilled') {
        results.push(...hubResults.value);
      }

      if (vectorResults.status === 'fulfilled') {
        results.push(...vectorResults.value.map(r => r.document));
      }

      return this.rankAndFilterResults(results, query);
    } catch (error) {
      console.error('Error retrieving content:', error);
      throw error;
    }
  }

  async searchTeams(query, userId) {
    try {
      if (!userId) return [];
      return await this.graphService.searchTeamsMessages(query, userId);
    } catch (error) {
      console.warn('Teams search failed:', error.message);
      return [];
    }
  }

  rankAndFilterResults(results, query) {
    const uniqueResults = this.deduplicateResults(results);
    
    const scored = uniqueResults.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevanceScore(result, query)
    }));

    return scored
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.source}-${result.title}-${result.content.substring(0, 100)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  calculateRelevanceScore(result, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = (result.title || '').toLowerCase();
    const contentLower = (result.content || '').toLowerCase();

    if (titleLower.includes(queryLower)) score += 3;
    if (contentLower.includes(queryLower)) score += 2;
    
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (titleLower.includes(word)) score += 1;
      if (contentLower.includes(word)) score += 0.5;
    });

    const recency = this.getRecencyScore(result.timestamp);
    score += recency;

    const sourceWeight = this.getSourceWeight(result.source);
    score *= sourceWeight;

    return score;
  }

  getRecencyScore(timestamp) {
    if (!timestamp) return 0;
    
    const now = new Date();
    const docDate = new Date(timestamp);
    const daysDiff = (now - docDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 7) return 2;
    if (daysDiff < 30) return 1;
    if (daysDiff < 90) return 0.5;
    return 0;
  }

  getSourceWeight(source) {
    const weights = {
      'Engineering Hub': 1.2,
      'ADO Wiki': 1.1,
      'Teams': 1.0,
      'ADO Work Item': 0.9
    };
    return weights[source] || 1.0;
  }

  async generateAnswer(query, context) {
    try {
      const systemPrompt = `You are OneAsk, a personal knowledge agent that helps users find information across their Microsoft workplace tools (Teams, ADO, Engineering Hub).

Your role is to:
1. Provide accurate, helpful answers based on the provided context
2. Always cite your sources with author, timestamp, and source type
3. Be concise but comprehensive
4. If information is missing or unclear, acknowledge this
5. Suggest follow-up actions when appropriate

Format your response with:
- A direct answer to the question
- Supporting details from the context
- Clear citations in the format: [Source: Author, Date]
- Any relevant links or next steps`;

      const userPrompt = `Query: ${query}

Context from various sources:
${context.map((item, index) => `
${index + 1}. [${item.source}] ${item.title}
   Author: ${item.author || 'Unknown'}
   Date: ${item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Unknown'}
   Content: ${item.content}
   URL: ${item.url || 'N/A'}
`).join('\n')}

Please provide a comprehensive answer based on this context.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return {
        answer: response.choices[0].message.content,
        sources: context,
        confidence: this.calculateConfidence(context, query)
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      throw error;
    }
  }

  calculateConfidence(context, query) {
    if (context.length === 0) return 0;
    
    const avgRelevanceScore = context.reduce((sum, item) => 
      sum + (item.relevanceScore || 0), 0) / context.length;
    
    let confidence = Math.min(avgRelevanceScore / 5, 1);
    
    if (context.length < 2) confidence *= 0.8;
    if (context.length >= 3) confidence *= 1.1;
    
    return Math.min(Math.round(confidence * 100), 100);
  }

  async processQuery(query, userId = null) {
    try {
      const relevantContent = await this.retrieveRelevantContent(query, userId);
      
      if (relevantContent.length === 0) {
        return {
          answer: "I couldn't find any relevant information for your query. You might want to try rephrasing your question or check if you have access to the relevant resources.",
          sources: [],
          confidence: 0
        };
      }

      const result = await this.generateAnswer(query, relevantContent);
      return result;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
}

module.exports = RAGPipeline;