const axios = require('axios');

class AzureDevOpsService {
  constructor() {
    // Use the correct URL format for msazure organization
    this.baseUrl = `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/${process.env.ADO_PROJECT}`;
    this.headers = {
      'Authorization': `Basic ${Buffer.from(`:${process.env.ADO_PAT}`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
    this.useMockData = process.env.USE_MOCK_ADO === 'true';
    
    // Mock data
    this.mockWikiData = [
      {
        id: 'wiki-1',
        title: 'FinOps Cost Optimization Strategy',
        content: 'Our comprehensive FinOps strategy focuses on three key pillars: Visibility, Optimization, and Governance. We implement automated cost monitoring with Azure Cost Management, establish resource tagging standards, and deploy rightsizing recommendations across all workloads.',
        path: '/FinOps/Cost-Optimization-Strategy',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/123/Cost-Optimization-Strategy',
        source: 'ADO Wiki',
        timestamp: new Date('2024-01-15').toISOString()
      },
      {
        id: 'wiki-2', 
        title: 'Project Bonica Architecture Overview',
        content: 'Project Bonica is our next-generation financial analytics platform built on Azure. The architecture consists of: Data Lake for raw financial data, Synapse Analytics for processing, Power BI for visualization, and API Gateway for external integrations. The system processes over 10TB of financial data daily.',
        path: '/Projects/Bonica/Architecture',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/456/Bonica-Architecture',
        source: 'ADO Wiki',
        timestamp: new Date('2024-02-20').toISOString()
      },
      {
        id: 'wiki-3',
        title: 'API Development Standards',
        content: 'All APIs must follow REST principles, implement OAuth 2.0 authentication, include comprehensive OpenAPI documentation, and support versioning through headers. Rate limiting is enforced at 1000 requests per hour per client. All endpoints must return standardized error responses.',
        path: '/Engineering/API-Standards',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/789/API-Standards', 
        source: 'ADO Wiki',
        timestamp: new Date('2024-01-30').toISOString()
      },
      {
        id: 'wiki-4',
        title: 'Managed Data Lake - Technical Implementation',
        content: 'Technical implementation details for the Managed Data Lake: Azure Data Lake Storage Gen2 with hierarchical namespace enabled, Azure Data Factory pipelines for data ingestion with 200+ active pipelines, Azure Synapse Analytics dedicated SQL pools for data warehousing, Databricks clusters for advanced analytics and ML workloads, Azure Purview for data governance and catalog management, Azure Key Vault for secrets and connection strings management, Azure Monitor and Log Analytics for comprehensive monitoring. Current storage: 2.5 PB with 99.9% availability SLA.',
        path: '/DataPlatform/Managed-Data-Lake/Implementation',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/1001/Managed-Data-Lake-Implementation',
        source: 'ADO Wiki', 
        timestamp: new Date('2024-02-24').toISOString()
      },
      {
        id: 'wiki-5',
        title: 'Data Lake Migration Strategy',
        content: 'Migration strategy for moving legacy data warehouses to Managed Data Lake: Phase 1 - Assessment and planning (2 weeks), Phase 2 - Infrastructure setup and security configuration (3 weeks), Phase 3 - Data migration using Azure Database Migration Service (6 weeks), Phase 4 - Application and reporting migration (4 weeks), Phase 5 - Validation and go-live (2 weeks). Total timeline: 17 weeks. Critical success factors: data quality validation, performance testing, user training, and rollback procedures. Migration tools include Azure Data Factory, Azure Database Migration Service, and custom PowerShell scripts.',
        path: '/DataPlatform/Migration/Strategy',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/1002/Data-Lake-Migration-Strategy',
        source: 'ADO Wiki',
        timestamp: new Date('2024-02-20').toISOString()
      },
      {
        id: 'wiki-6', 
        title: 'Data Quality Framework',
        content: 'Comprehensive data quality framework for the Managed Data Lake: Data profiling using Azure Data Factory data flows, automated data validation with Great Expectations framework, data lineage tracking through Azure Purview, anomaly detection with Azure Machine Learning, data quality dashboards in Power BI, automated error handling and notification system. Quality metrics include completeness (>95%), accuracy (>98%), consistency (>99%), and timeliness (<4 hours for critical data). Monthly data quality reports are generated automatically and shared with stakeholders.',
        path: '/DataPlatform/Quality/Framework',
        url: 'https://msazure.visualstudio.com/FINOPS/_wiki/wikis/FNO-Wiki/1003/Data-Quality-Framework',
        source: 'ADO Wiki',
        timestamp: new Date('2024-02-18').toISOString()
      }
    ];

    this.mockWorkItems = [
      {
        id: 12345,
        title: 'Implement Bonica cost analytics dashboard',
        content: 'Create a comprehensive dashboard showing cost trends, budget vs actual spending, and resource utilization metrics for Project Bonica. Include drill-down capabilities by subscription, resource group, and time period.',
        state: 'Active',
        author: 'Sarah Chen',
        timestamp: new Date('2024-02-15').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12345'
      },
      {
        id: 12346,
        title: 'EDT onboarding automation',
        content: 'Automate the EDT (Engineering Development Team) onboarding process including Azure subscription setup, access permissions, development environment configuration, and documentation access. Reduce onboarding time from 3 days to 4 hours.',
        state: 'New',
        author: 'Mike Johnson',
        timestamp: new Date('2024-02-18').toISOString(),
        source: 'ADO Work Item', 
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12346'
      },
      {
        id: 12347,
        title: 'API rate limiting implementation',
        content: 'Implement proper rate limiting for all public APIs according to the new API standards. Use Redis for distributed rate limiting across multiple instances. Include proper error messages and retry-after headers.',
        state: 'In Progress',
        author: 'Alex Rodriguez',
        timestamp: new Date('2024-02-10').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12347'
      },
      {
        id: 12348,
        title: 'Data Lake ingestion pipeline optimization',
        content: 'Optimize data ingestion pipelines in Azure Data Factory to improve throughput by 40%. Focus on parallel processing, batch size optimization, and error handling improvements. Current bottleneck is in the financial data processing pipeline which handles 5TB daily. Need to implement incremental data loading and optimize Synapse SQL pool queries.',
        state: 'Active',
        author: 'Jennifer Liu',
        timestamp: new Date('2024-02-25').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12348'
      },
      {
        id: 12349,
        title: 'Implement data governance policies in Purview',
        content: 'Configure Azure Purview with comprehensive data governance policies for the Managed Data Lake. Set up data classification, sensitivity labels, and automated scanning for 200+ data sources. Implement approval workflows for data access requests and configure data lineage tracking. Target completion: end of March to meet compliance requirements.',
        state: 'New',
        author: 'David Kim',
        timestamp: new Date('2024-02-23').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12349'
      },
      {
        id: 12350,
        title: 'Data Lake performance monitoring dashboard',
        content: 'Create comprehensive monitoring dashboard for Managed Data Lake performance metrics using Power BI. Include key metrics: storage utilization, query performance, pipeline success rates, data quality scores, and cost analytics. Integrate with Azure Monitor and Azure Data Factory metrics. Dashboard should support drill-down capabilities and automated alerting for SLA violations.',
        state: 'In Progress',
        author: 'Maria Santos',
        timestamp: new Date('2024-02-21').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12350'
      },
      {
        id: 12351,
        title: 'Data Lake disaster recovery implementation',
        content: 'Implement comprehensive disaster recovery solution for Managed Data Lake with cross-region replication. Set up automated backups, geo-redundant storage configuration, and recovery procedures. Target RPO: 4 hours, RTO: 24 hours. Include testing procedures and documentation for disaster recovery scenarios. Integrate with existing business continuity plans.',
        state: 'New',
        author: 'Robert Chen',
        timestamp: new Date('2024-02-19').toISOString(),
        source: 'ADO Work Item',
        url: 'https://msazure.visualstudio.com/FINOPS/_workitems/edit/12351'
      }
    ];
  }

  async searchWiki(query) {
    if (this.useMockData) {
      console.log('Using mock ADO Wiki data');
      return this.mockWikiData.filter(wiki => 
        wiki.title.toLowerCase().includes(query.toLowerCase()) ||
        wiki.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      // Use Azure DevOps Search API for wiki content (working URL format)
      const searchResponse = await axios.post(`https://almsearch.dev.azure.com/${process.env.ADO_ORGANIZATION}/_apis/search/wikisearchresults`, {
        searchText: query,
        '$top': 10,
        includeFacets: true,
        filters: {
          Project: [process.env.ADO_PROJECT]
        }
      }, {
        headers: this.headers,
        params: {
          'api-version': '7.1-preview.1'
        }
      });

      const searchResults = searchResponse.data.results || [];
      console.log(`✅ ADO Wiki Search API found ${searchResults.length} results`);
      
      return this.formatSearchResults(searchResults, 'wiki');
    } catch (error) {
      console.warn('ADO Search API not available, falling back to local search:', error.message);
      // Fallback to the original implementation if Search API is not available
      return this.searchWikiFallback(query);
    }
  }

  async searchWikiPages(wikiId, query) {
    try {
      const response = await axios.get(`${this.baseUrl}/_apis/wiki/wikis/${wikiId}/pages`, {
        headers: this.headers,
        params: {
          'api-version': '7.0',
          'recursionLevel': 'full'
        }
      });

      const pages = response.data.value || [];
      const matchingPages = [];

      for (const page of pages) {
        if (page.path.toLowerCase().includes(query.toLowerCase())) {
          const content = await this.getWikiPageContent(wikiId, page.id);
          matchingPages.push({
            id: page.id,
            title: page.path.split('/').pop(),
            content: content,
            path: page.path,
            url: page.remoteUrl,
            source: 'ADO Wiki',
            timestamp: page.gitVersionDescriptor?.versionDate
          });
        }
      }

      return matchingPages;
    } catch (error) {
      console.error('Error searching wiki pages:', error);
      return [];
    }
  }

  async getWikiPageContent(wikiId, pageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/_apis/wiki/wikis/${wikiId}/pages/${pageId}`, {
        headers: this.headers,
        params: {
          'api-version': '7.0',
          'includeContent': true
        }
      });

      return response.data.content || '';
    } catch (error) {
      console.error('Error fetching wiki page content:', error);
      return '';
    }
  }

  async searchWikiFallback(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/_apis/wiki/wikis`, {
        headers: this.headers,
        params: {
          'api-version': '7.0'
        }
      });

      const wikis = response.data.value;
      const results = [];

      for (const wiki of wikis) {
        const pages = await this.searchWikiPages(wiki.id, query);
        results.push(...pages);
      }

      return results;
    } catch (error) {
      console.error('Error in wiki fallback search:', error.message);
      return [];
    }
  }

  async getWikiPageContentById(wikiId, contentId) {
    try {
      const response = await axios.get(`${this.baseUrl}/_apis/wiki/wikis/${wikiId}/pages/${contentId}`, {
        headers: this.headers,
        params: {
          'api-version': '7.0',
          'includeContent': true
        }
      });

      return response.data.content || '';
    } catch (error) {
      console.error('Error fetching wiki page content by ID:', error.message);
      return '';
    }
  }

  async searchWorkItems(query) {
    if (this.useMockData) {
      console.log('Using mock ADO Work Items data');
      return this.mockWorkItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      // Use Azure DevOps Search API for work items (working URL format)
      const searchResponse = await axios.post(`https://almsearch.dev.azure.com/${process.env.ADO_ORGANIZATION}/_apis/search/workitemsearchresults`, {
        searchText: query,
        '$top': 10,
        includeFacets: true,
        filters: {
          Project: [process.env.ADO_PROJECT]
        }
      }, {
        headers: this.headers,
        params: {
          'api-version': '7.1-preview.1'
        }
      });

      const searchResults = searchResponse.data.results || [];
      console.log(`✅ ADO Work Items Search API found ${searchResults.length} results`);
      
      return this.formatSearchResults(searchResults, 'workitem');
    } catch (error) {
      console.warn('ADO Search API not available for work items, falling back to WIQL:', error.message);
      // Fallback to WIQL if Search API is not available
      return this.searchWorkItemsFallback(query);
    }
  }

  async searchWorkItemsFallback(query) {
    try {
      const wiql = `
        SELECT [System.Id], [System.Title], [System.Description], [System.State], [System.CreatedDate]
        FROM workitems
        WHERE [System.Title] CONTAINS WORDS '${query}'
        OR [System.Description] CONTAINS WORDS '${query}'
        ORDER BY [System.CreatedDate] DESC
      `;

      const response = await axios.post(`${this.baseUrl}/_apis/wit/wiql`, {
        query: wiql
      }, {
        headers: this.headers,
        params: {
          'api-version': '7.0'
        }
      });

      const workItemIds = response.data.workItems.map(wi => wi.id);
      
      if (workItemIds.length === 0) return [];

      const detailsResponse = await axios.get(`${this.baseUrl}/_apis/wit/workitems`, {
        headers: this.headers,
        params: {
          'ids': workItemIds.join(','),
          'api-version': '7.0',
          '$expand': 'fields'
        }
      });

      return detailsResponse.data.value.map(wi => ({
        id: wi.id,
        title: wi.fields['System.Title'],
        content: wi.fields['System.Description'] || '',
        state: wi.fields['System.State'],
        author: wi.fields['System.CreatedBy']?.displayName,
        timestamp: wi.fields['System.CreatedDate'],
        source: 'ADO Work Item',
        url: wi.url.replace('_apis/wit/workItems', '_workitems/edit')
      }));
    } catch (error) {
      console.error('Error in work items fallback search:', error.message);
      return [];
    }
  }

  // Diagnostic method to test ADO Search API availability
  async diagnoseSearchAPI() {
    console.log('🔍 Diagnosing ADO Search API...');
    
    // Test 1: Check organization access
    try {
      const orgResponse = await axios.get(
        `https://dev.azure.com/${process.env.ADO_ORGANIZATION}/_apis/projects`,
        {
          headers: this.headers,
          params: { 'api-version': '7.1' }
        }
      );
      console.log('✅ Organization access OK - Projects found:', orgResponse.data.count);
    } catch (error) {
      console.log('❌ Organization access failed:', error.response?.status, error.message);
      return { organizationAccess: false };
    }

    // Test 2: Check different search API endpoints and versions
    const searchTests = [
      // Wiki Search variations
      {
        name: 'Wiki Search API (7.1-preview.1)',
        method: 'POST',
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/wikisearchresults`,
        version: '7.1-preview.1',
        payload: { searchText: 'test', '$top': 1 }
      },
      {
        name: 'Wiki Search API (7.0-preview.1)', 
        method: 'POST',
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/wikisearchresults`,
        version: '7.0-preview.1',
        payload: { searchText: 'test', '$top': 1 }
      },
      {
        name: 'Wiki Search API (6.0-preview.1)',
        method: 'POST', 
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/wikisearchresults`,
        version: '6.0-preview.1',
        payload: { searchText: 'test', '$top': 1 }
      },
      // Alternative search endpoints
      {
        name: 'Code Search API',
        method: 'POST',
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/codesearchresults`,
        version: '7.1-preview.1', 
        payload: { searchText: 'test', '$top': 1 }
      },
      {
        name: 'Work Item Search API',
        method: 'POST',
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/workitemsearchresults`,
        version: '7.1-preview.1',
        payload: { searchText: 'test', '$top': 1 }
      },
      // Generic search endpoint
      {
        name: 'Generic Search Endpoint',
        method: 'GET',
        url: `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search`,
        version: '7.1-preview.1'
      }
    ];

    const results = {};
    
    for (const test of searchTests) {
      try {
        let response;
        if (test.method === 'POST') {
          response = await axios.post(test.url, test.payload, {
            headers: this.headers,
            params: { 'api-version': test.version }
          });
        } else {
          response = await axios.get(test.url, {
            headers: this.headers,
            params: { 'api-version': test.version }
          });
        }
        console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
        results[test.name] = { success: true, status: response.status };
      } catch (error) {
        console.log(`❌ ${test.name}: FAILED (${error.response?.status || error.code})`);
        results[test.name] = { 
          success: false, 
          status: error.response?.status || error.code,
          message: error.response?.data?.message || error.message
        };
      }
    }

    // Test 3: Check search service availability
    try {
      const searchServiceResponse = await axios.get(
        `https://${process.env.ADO_ORGANIZATION}.visualstudio.com/_apis/search/searchservices`,
        {
          headers: this.headers,
          params: { 'api-version': '7.1-preview.1' }
        }
      );
      console.log('✅ Search services available:', searchServiceResponse.data);
      results.searchServices = { success: true, data: searchServiceResponse.data };
    } catch (error) {
      console.log('❌ Search services check failed:', error.response?.status, error.message);
      results.searchServices = { success: false, status: error.response?.status };
    }

    return results;
  }

  // Alternative search implementation using different ADO APIs
  async searchWikiAlternative(query) {
    console.log('🔍 Trying alternative wiki search approaches...');
    
    // Approach 1: Try Azure DevOps Services search (different URL format)
    try {
      const response = await axios.post(
        `https://almsearch.dev.azure.com/${process.env.ADO_ORGANIZATION}/_apis/search/wikisearchresults`,
        {
          searchText: query,
          '$top': 10,
          includeFacets: true,
          filters: {
            Project: [process.env.ADO_PROJECT]
          }
        },
        {
          headers: this.headers,
          params: { 'api-version': '7.1-preview.1' }
        }
      );
      console.log('✅ Alternative search URL worked!');
      return this.formatSearchResults(response.data.results, 'wiki');
    } catch (error) {
      console.log('❌ Alternative search URL failed:', error.response?.status);
    }

    // Approach 2: Use WIQL for wiki-like content in work items
    try {
      const wiqlQuery = `
        SELECT [System.Id], [System.Title], [System.Description], [System.Tags]
        FROM workitems 
        WHERE [System.WorkItemType] IN ('Epic', 'Feature', 'User Story')
        AND ([System.Title] CONTAINS WORDS '${query}' OR [System.Description] CONTAINS WORDS '${query}')
        ORDER BY [System.ChangedDate] DESC
      `;
      
      const wiqlResponse = await axios.post(`${this.baseUrl}/_apis/wit/wiql`, {
        query: wiqlQuery
      }, {
        headers: this.headers,
        params: { 'api-version': '7.1' }
      });
      
      if (wiqlResponse.data.workItems.length > 0) {
        const workItemIds = wiqlResponse.data.workItems.map(wi => wi.id);
        const detailsResponse = await axios.get(`${this.baseUrl}/_apis/wit/workitems`, {
          headers: this.headers,
          params: {
            'ids': workItemIds.join(','),
            'api-version': '7.1',
            '$expand': 'fields'
          }
        });
        
        console.log('✅ WIQL-based search found', detailsResponse.data.value.length, 'items');
        return detailsResponse.data.value.map(wi => ({
          id: wi.id,
          title: wi.fields['System.Title'],
          content: wi.fields['System.Description'] || '',
          source: 'ADO Work Item (Wiki Content)',
          author: wi.fields['System.CreatedBy']?.displayName,
          timestamp: wi.fields['System.ChangedDate'],
          url: wi.url.replace('_apis/wit/workItems', '_workitems/edit'),
          tags: wi.fields['System.Tags'] ? wi.fields['System.Tags'].split(';') : []
        }));
      }
    } catch (error) {
      console.log('❌ WIQL approach failed:', error.response?.status);
    }

    return [];
  }

  formatSearchResults(results, type) {
    if (!results || !Array.isArray(results)) return [];
    
    return results.map(result => {
      if (type === 'wiki') {
        return {
          id: result.wiki?.id || result.id,
          title: result.fileName || result.wiki?.name || result.title,
          content: result.matches?.content?.[0]?.text || result.content || '',
          source: 'ADO Wiki',
          author: result.wiki?.modifiedBy?.displayName || result.author,
          timestamp: result.wiki?.modifiedDate || result.timestamp,
          url: result.wiki?.url || result.url,
          relevanceScore: result.relevance,
          path: result.path
        };
      } else {
        // Work item format
        return {
          id: result.workItem?.id || result.id,
          title: result.workItem?.fields?.['System.Title'] || result.title,
          content: result.workItem?.fields?.['System.Description'] || result.matches?.content?.[0]?.text || result.content || '',
          state: result.workItem?.fields?.['System.State'] || result.state,
          source: 'ADO Work Item',
          author: result.workItem?.fields?.['System.CreatedBy']?.displayName || result.author,
          timestamp: result.workItem?.fields?.['System.CreatedDate'] || result.timestamp,
          url: result.workItem?.url ? result.workItem.url.replace('_apis/wit/workItems', '_workitems/edit') : result.url,
          relevanceScore: result.relevance
        };
      }
    });
  }
}

module.exports = AzureDevOpsService;