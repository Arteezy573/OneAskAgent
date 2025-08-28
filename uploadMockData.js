const VectorSearchService = require('./src/services/vectorSearch');
const EngineeringHubService = require('./src/api/engineeringHub');
const MicrosoftGraphService = require('./src/api/microsoftGraph');
const AzureDevOpsService = require('./src/api/azureDevOps');

require('dotenv').config();

class MockDataUploader {
  constructor() {
    this.vectorSearch = new VectorSearchService();
    this.engineeringHub = new EngineeringHubService();
    this.msGraph = new MicrosoftGraphService();
    this.azureDevOps = new AzureDevOpsService();
  }

  async uploadEngineeringHubData() {
    console.log('📚 Uploading Engineering Hub documents...');
    
    try {
      const documents = this.engineeringHub.mockData.map(doc => ({
        id: `eh_${doc.id}`,
        title: doc.title,
        content: doc.content,
        author: doc.author,
        timestamp: doc.timestamp,
        source: 'Engineering Hub',
        url: doc.url,
        category: doc.category || '',
        tags: doc.tags || []
      }));

      const result = await this.vectorSearch.indexDocuments(documents);
      console.log(`✅ Uploaded ${documents.length} Engineering Hub documents`);
      return result;
    } catch (error) {
      console.error('❌ Error uploading Engineering Hub data:', error.message);
      throw error;
    }
  }

  async uploadMicrosoftGraphData() {
    console.log('💬 Uploading Microsoft Graph (Teams) documents...');
    
    try {
      const documents = this.msGraph.mockTeamsData.map(doc => ({
        id: `teams_${doc.id}`,
        title: doc.title,
        content: doc.content,
        author: doc.author,
        timestamp: doc.timestamp,
        source: 'Teams',
        url: doc.url,
        category: doc.channelName || 'Teams Message',
        tags: ['teams', 'message', 'collaboration']
      }));

      const result = await this.vectorSearch.indexDocuments(documents);
      console.log(`✅ Uploaded ${documents.length} Teams messages`);
      return result;
    } catch (error) {
      console.error('❌ Error uploading Microsoft Graph data:', error.message);
      throw error;
    }
  }

  async uploadAzureDevOpsData() {
    console.log('🔧 Uploading Azure DevOps documents...');
    
    try {
      // Upload Wiki pages
      const wikiDocuments = this.azureDevOps.mockWikiData.map(doc => ({
        id: `ado_wiki_${doc.id}`,
        title: doc.title,
        content: doc.content,
        author: 'Azure DevOps Wiki',
        timestamp: doc.timestamp,
        source: 'ADO Wiki',
        url: doc.url,
        category: 'Wiki',
        tags: ['wiki', 'documentation', 'azure-devops']
      }));

      // Upload Work Items
      const workItemDocuments = this.azureDevOps.mockWorkItems.map(doc => ({
        id: `ado_wi_${doc.id}`,
        title: doc.title,
        content: doc.content,
        author: doc.author,
        timestamp: doc.timestamp,
        source: 'ADO Work Item',
        url: doc.url,
        category: 'Work Item',
        tags: ['work-item', 'task', 'azure-devops', doc.state.toLowerCase()]
      }));

      const allDocuments = [...wikiDocuments, ...workItemDocuments];
      const result = await this.vectorSearch.indexDocuments(allDocuments);
      
      console.log(`✅ Uploaded ${wikiDocuments.length} Wiki pages and ${workItemDocuments.length} Work Items`);
      return result;
    } catch (error) {
      console.error('❌ Error uploading Azure DevOps data:', error.message);
      throw error;
    }
  }

  async uploadAllMockData() {
    console.log('🚀 Starting mock data upload to Azure Cognitive Search...\n');

    try {
      // Upload all data sources
      await this.uploadEngineeringHubData();
      await this.uploadMicrosoftGraphData();
      await this.uploadAzureDevOpsData();

      console.log('\n🎉 Successfully uploaded all mock data to Azure Cognitive Search!');
      
      // Calculate total documents
      const totalDocs = this.engineeringHub.mockData.length + 
                       this.msGraph.mockTeamsData.length + 
                       this.azureDevOps.mockWikiData.length + 
                       this.azureDevOps.mockWorkItems.length;
      
      console.log(`📊 Total documents indexed: ${totalDocs}`);
      console.log('\n📋 Data sources uploaded:');
      console.log(`   • Engineering Hub: ${this.engineeringHub.mockData.length} documents`);
      console.log(`   • Teams Messages: ${this.msGraph.mockTeamsData.length} documents`);
      console.log(`   • ADO Wiki Pages: ${this.azureDevOps.mockWikiData.length} documents`);
      console.log(`   • ADO Work Items: ${this.azureDevOps.mockWorkItems.length} documents`);

    } catch (error) {
      console.error('💥 Failed to upload mock data:', error.message);
      process.exit(1);
    }
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  const uploader = new MockDataUploader();
  uploader.uploadAllMockData();
}

module.exports = MockDataUploader;