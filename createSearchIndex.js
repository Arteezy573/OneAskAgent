const { SearchIndexClient, AzureKeyCredential } = require('@azure/search-documents');

require('dotenv').config();

class SearchIndexManager {
  constructor() {
    this.indexClient = new SearchIndexClient(
      `https://${process.env.SEARCH_SERVICE_NAME}.search.windows.net`,
      new AzureKeyCredential(process.env.SEARCH_API_KEY)
    );
    this.indexName = process.env.SEARCH_INDEX_NAME;
  }

  async createIndex() {
    console.log(`🔧 Creating search index: ${this.indexName}`);

    const indexDefinition = {
      name: this.indexName,
      fields: [
        {
          name: "id",
          type: "Edm.String",
          key: true,
          searchable: false,
          filterable: true,
          retrievable: true
        },
        {
          name: "title",
          type: "Edm.String",
          searchable: true,
          filterable: true,
          retrievable: true,
          analyzer: "standard.lucene"
        },
        {
          name: "content",
          type: "Edm.String",
          searchable: true,
          retrievable: true,
          analyzer: "standard.lucene"
        },
        {
          name: "author",
          type: "Edm.String",
          searchable: true,
          filterable: true,
          facetable: true,
          retrievable: true
        },
        {
          name: "timestamp",
          type: "Edm.DateTimeOffset",
          filterable: true,
          sortable: true,
          facetable: true,
          retrievable: true
        },
        {
          name: "source",
          type: "Edm.String",
          searchable: true,
          filterable: true,
          facetable: true,
          retrievable: true
        },
        {
          name: "url",
          type: "Edm.String",
          searchable: false,
          filterable: false,
          retrievable: true
        },
        {
          name: "category",
          type: "Edm.String",
          searchable: true,
          filterable: true,
          facetable: true,
          retrievable: true
        },
        {
          name: "tags",
          type: "Collection(Edm.String)",
          searchable: true,
          filterable: true,
          facetable: true,
          retrievable: true
        },
        {
          name: "contentVector",
          type: "Collection(Edm.Single)",
          searchable: true,
          retrievable: false,
          vectorSearchDimensions: 1536,
          vectorSearchProfileName: "my-vector-profile"
        }
      ],
      vectorSearch: {
        profiles: [
          {
            name: "my-vector-profile",
            algorithmConfigurationName: "my-hnsw"
          }
        ],
        algorithms: [
          {
            name: "my-hnsw",
            kind: "hnsw",
            hnswParameters: {
              metric: "cosine",
              m: 4,
              efConstruction: 400,
              efSearch: 500
            }
          }
        ]
      },
      corsOptions: {
        allowedOrigins: ["*"],
        maxAgeInSeconds: 300
      }
    };

    try {
      // Check if index already exists
      try {
        const existingIndex = await this.indexClient.getIndex(this.indexName);
        console.log(`📋 Index '${this.indexName}' already exists`);
        return existingIndex;
      } catch (error) {
        if (error.statusCode !== 404) {
          throw error;
        }
        // Index doesn't exist, continue with creation
      }

      // Create the index
      const result = await this.indexClient.createIndex(indexDefinition);
      console.log(`✅ Successfully created index: ${this.indexName}`);
      return result;

    } catch (error) {
      console.error('❌ Error creating search index:', error.message);
      throw error;
    }
  }

  async deleteIndex() {
    try {
      await this.indexClient.deleteIndex(this.indexName);
      console.log(`🗑️ Successfully deleted index: ${this.indexName}`);
    } catch (error) {
      console.error('❌ Error deleting search index:', error.message);
      throw error;
    }
  }

  async listIndexes() {
    try {
      const indexes = await this.indexClient.listIndexes();
      console.log('📋 Available indexes:');
      for await (const index of indexes) {
        console.log(`   • ${index.name}`);
      }
      return indexes;
    } catch (error) {
      console.error('❌ Error listing indexes:', error.message);
      throw error;
    }
  }
}

// Run operations if this script is executed directly
if (require.main === module) {
  const manager = new SearchIndexManager();
  
  async function main() {
    try {
      console.log('🚀 Starting Azure Cognitive Search index management...\n');
      
      // List existing indexes
      await manager.listIndexes();
      console.log();
      
      // Create the index
      await manager.createIndex();
      
      console.log('\n🎉 Index management completed successfully!');
    } catch (error) {
      console.error('💥 Index management failed:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = SearchIndexManager;