const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
const { OpenAI } = require('openai');

class VectorSearchService {
  constructor() {
    this.searchClient = new SearchClient(
      `https://${process.env.SEARCH_SERVICE_NAME}.search.windows.net`,
      process.env.SEARCH_INDEX_NAME,
      new AzureKeyCredential(process.env.SEARCH_API_KEY)
    );
    this.skipHybridSearch = process.env.USE_HYBRID_SEARCH === 'false';

    // Main OpenAI client for chat completions
    this.openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      }
    });

    // Separate client for embeddings if embedding deployment is configured
    this.embeddingClient = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME ? new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      }
    }) : null;
    
    console.log(`Vector Search using embedding deployment: ${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'None configured'}`);
  }

  async generateEmbedding(text) {
    try {
      // Check if embedding client is available
      if (!this.embeddingClient) {
        console.warn('Embedding deployment not configured, skipping embeddings');
        return null;
      }
      
      const response = await this.embeddingClient.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      console.log(`Generated embedding for text: ${text}`);
      return response.data[0].embedding;
    } catch (error) {
      console.warn('Embeddings not available, skipping vector search:', error.message);
      return null;
    }
  }

  async indexDocument(document) {
    try {
      const embedding = await this.generateEmbedding(document.content);
      
      const searchDocument = {
        id: document.id,
        title: document.title,
        content: document.content,
        author: document.author,
        timestamp: document.timestamp,
        source: document.source,
        url: document.url,
        category: document.category || '',
        tags: document.tags || []
      };

      // Only include contentVector if embedding was generated
      if (embedding) {
        searchDocument.contentVector = embedding;
      }

      const result = await this.searchClient.uploadDocuments([searchDocument]);
      return result;
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  async indexDocuments(documents) {
    try {
      const indexedDocs = [];
      
      for (const doc of documents) {
        const embedding = await this.generateEmbedding(doc.content);
        const searchDoc = {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          author: doc.author,
          timestamp: doc.timestamp,
          source: doc.source,
          url: doc.url,
          category: doc.category || '',
          tags: doc.tags || []
        };

        // Only include contentVector if embedding was generated
        if (embedding) {
          searchDoc.contentVector = embedding;
        }

        indexedDocs.push(searchDoc);
      }

      const result = await this.searchClient.uploadDocuments(indexedDocs);
      return result;
    } catch (error) {
      console.error('Error indexing documents:', error);
      throw error;
    }
  }

  async vectorSearch(query, k = 5) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      if (!queryEmbedding) {
        console.warn('Vector search unavailable, returning empty results');
        return [];
      }
      
      const searchOptions = {
        searchFields: ['content', 'title'],
        select: ['id', 'title', 'content', 'author', 'timestamp', 'source', 'url', 'category', 'tags'],
        vectorQueries: [{
          vector: queryEmbedding,
          kNearestNeighborsCount: k,
          fields: 'contentVector'
        }],
        top: k
      };

      console.log(`Vector Search using embedding deployment: ${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'None configured'}`);
      const searchResults = await this.searchClient.search('*', searchOptions);
      console.log(`Vector Search results: ${JSON.stringify(searchResults)}`);

      const results = [];
      for await (const result of searchResults.results) {
        results.push({
          score: result.score,
          document: result.document
        });
      }

      return results;
    } catch (error) {
      console.warn('Vector search failed, returning empty results:', error.message);
      return [];
    }
  }

  async hybridSearch(query, k = 5) {
    if (this.skipHybridSearch) {
      console.log('Skipping hybrid search as per configuration');
      return [];
    }
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      let searchOptions;
      if (!queryEmbedding) {
        console.warn('Hybrid search falling back to text-only search');
        // Fall back to text-only search when embeddings are not available
        searchOptions = {
          searchText: query,
          searchFields: ['content', 'title'],
          select: ['id', 'title', 'content', 'author', 'timestamp', 'source', 'url', 'category', 'tags'],
          top: k
        };
      } else {
        // Use hybrid search with both text and vector queries
        console.log(`Hybrid Search using embedding deployment: ${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || 'None configured'}`);
        searchOptions = {
          searchText: query,
          searchFields: ['content', 'title'],
          select: ['id', 'title', 'content', 'author', 'timestamp', 'source', 'url', 'category', 'tags'],
          vectorQueries: [{
            vector: queryEmbedding,
            kNearestNeighborsCount: k,
            fields: 'contentVector'
          }],
          top: k
        };
      }

      const searchResults = await this.searchClient.search(query, searchOptions);
      const results = [];
      for await (const result of searchResults.results) {
        console.log(`Hybrid Search result: ${result.document.title} (Score: ${result.score})`);
        results.push({
          score: result.score,
          document: result.document
        });
      }

      return results;
    } catch (error) {
      console.warn('Hybrid search failed, returning empty results:', error.message);
      return [];
    }
  }

  async deleteDocument(id) {
    try {
      const result = await this.searchClient.deleteDocuments([{ id }]);
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

module.exports = VectorSearchService;