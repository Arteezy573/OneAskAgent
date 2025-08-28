const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');

class MicrosoftGraphService {
  constructor() {
    this.clientApp = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MICROSOFT_APP_ID,
        clientSecret: process.env.MICROSOFT_APP_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`
      }
    });
    
    this.graphClient = null;
    this.useMockData = process.env.USE_MOCK_TEAMS === 'true';
    
    // Mock Teams messages data
    this.mockTeamsData = [
      {
        id: 'msg-1',
        title: 'Bonica project update from Sarah',
        content: 'Hey team! Just wanted to update everyone on Project Bonica progress. We\'ve successfully implemented the new cost analytics module and it\'s showing great insights. The dashboard now displays real-time spending across all Azure subscriptions. Next week we\'ll be adding the forecasting capabilities.',
        author: 'Sarah Chen',
        timestamp: new Date('2024-02-20T10:30:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-1/msg-1',
        channelName: 'FinOps Project Team'
      },
      {
        id: 'msg-2',
        title: 'EDT onboarding improvements',
        content: 'Mike here - I\'ve been working on streamlining our EDT onboarding process. We now have automated scripts for Azure subscription setup and VS Code configuration. The new process reduces setup time from 3 days to just 4 hours. Documentation is updated in the Engineering Hub.',
        author: 'Mike Johnson',
        timestamp: new Date('2024-02-18T14:15:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-2/msg-2',
        channelName: 'Engineering Development'
      },
      {
        id: 'msg-3',
        title: 'API rate limiting discussion',
        content: 'Team, we need to implement proper rate limiting for our APIs. I\'ve reviewed the standards document and we should use Redis for distributed rate limiting. Current plan: 1000 requests/hour per client, with proper retry-after headers. Thoughts?',
        author: 'Alex Rodriguez',
        timestamp: new Date('2024-02-15T09:45:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-3/msg-3',
        channelName: 'API Architecture'
      },
      {
        id: 'msg-4',
        title: 'FinOps best practices sharing',
        content: 'Sharing some FinOps best practices we\'ve learned: 1) Implement resource tagging early, 2) Use Azure Cost Management budgets, 3) Regular rightsizing reviews, 4) Automate shutdown of dev resources. These practices have saved us 30% on cloud costs.',
        author: 'Lisa Park',
        timestamp: new Date('2024-02-12T16:20:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-4/msg-4',
        channelName: 'Cloud Financial Management'
      },
      {
        id: 'msg-5',
        title: 'Data Lake pipeline performance issues',
        content: 'Team, we\'re seeing some performance issues with our Data Lake ingestion pipelines. The financial data processing pipeline is taking 8 hours instead of the usual 4 hours. Jennifer is investigating bottlenecks in the Synapse SQL pools. We might need to optimize our batch sizes and implement parallel processing. I\'ve created work item #12348 to track this.',
        author: 'Jennifer Liu',
        timestamp: new Date('2024-02-25T08:30:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-5/msg-5',
        channelName: 'Data Platform Engineering'
      },
      {
        id: 'msg-6',
        title: 'Purview data governance rollout update',
        content: 'Quick update on our Azure Purview rollout for the Managed Data Lake. We\'ve successfully configured data classification for 150 out of 200 data sources. The automated scanning is working well and we\'ve identified several PII datasets that need additional security controls. David is working on the approval workflows for data access requests. Target completion is end of March.',
        author: 'David Kim',
        timestamp: new Date('2024-02-23T14:45:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-6/msg-6',
        channelName: 'Data Governance'
      },
      {
        id: 'msg-7',
        title: 'Data Lake monitoring dashboard demo',
        content: 'Exciting news! I\'m ready to demo the new Data Lake monitoring dashboard. It shows real-time metrics for storage utilization (currently 2.5 PB), query performance, and pipeline success rates. The dashboard integrates with Azure Monitor and shows our SLA compliance at 99.2%. Would love to get feedback from the team before we roll it out to stakeholders.',
        author: 'Maria Santos',
        timestamp: new Date('2024-02-21T10:15:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-7/msg-7',
        channelName: 'Data Analytics'
      },
      {
        id: 'msg-8',
        title: 'Data Lake disaster recovery planning',
        content: 'We need to finalize our disaster recovery strategy for the Managed Data Lake. I\'ve been working with the infrastructure team on cross-region replication setup. Our target is RPO of 4 hours and RTO of 24 hours. We\'ll be testing the procedures next month. Key components include geo-redundant storage, automated backups, and documented recovery workflows.',
        author: 'Robert Chen',
        timestamp: new Date('2024-02-19T13:20:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-8/msg-8',
        channelName: 'Infrastructure & Operations'
      },
      {
        id: 'msg-9',
        title: 'Data quality metrics improvement',
        content: 'Great news on data quality! Our latest metrics show significant improvement: completeness is now at 97.2% (up from 94%), accuracy at 98.5%, and timeliness under 3 hours for critical datasets. The Great Expectations framework is working really well for automated validation. We\'ve also reduced data quality incidents by 45% this month.',
        author: 'Emily Zhang',
        timestamp: new Date('2024-02-24T11:00:00Z').toISOString(),
        source: 'Teams',
        url: 'https://teams.microsoft.com/l/message/channel-9/msg-9',
        channelName: 'Data Quality & Operations'
      }
    ];
  }

  async initialize() {
    try {
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default']
      };
      
      // Use acquireTokenByClientCredential instead of acquireTokenSilent
      const response = await this.clientApp.acquireTokenByClientCredential(clientCredentialRequest);
      
      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, response.accessToken);
        }
      });
      
      return true;
    } catch (error) {
      console.warn('Microsoft Graph not available:', error.message);
      return false;
    }
  }

  async searchTeamsMessages(query, userId) {
    if (this.useMockData) {
      console.log('Using mock Teams data');
      return this.mockTeamsData.filter(message =>
        message.title.toLowerCase().includes(query.toLowerCase()) ||
        message.content.toLowerCase().includes(query.toLowerCase()) ||
        message.author.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (!this.graphClient) {
      throw new Error('Graph client not initialized');
    }

    try {
      const response = await this.graphClient
        .api('/search/query')
        .post({
          requests: [{
            entityTypes: ['message'],
            query: {
              queryString: query
            },
            from: 0,
            size: 25
          }]
        });

      return this.formatTeamsResults(response.value[0].hitsContainers[0].hits);
    } catch (error) {
      console.error('Error searching Teams messages:', error);
      throw error;
    }
  }

  async getTeamsChannels(teamId) {
    try {
      const channels = await this.graphClient
        .api(`/teams/${teamId}/channels`)
        .get();
      
      return channels.value;
    } catch (error) {
      console.error('Error fetching Teams channels:', error);
      throw error;
    }
  }

  async getChannelMessages(teamId, channelId) {
    try {
      const messages = await this.graphClient
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .expand('replies')
        .get();
      
      return this.formatMessages(messages.value);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      throw error;
    }
  }

  formatTeamsResults(hits) {
    return hits.map(hit => ({
      id: hit.hitId,
      title: hit.resource.subject || 'Teams Message',
      content: hit.resource.body?.content || hit.summary,
      author: hit.resource.from?.user?.displayName,
      timestamp: hit.resource.createdDateTime,
      source: 'Teams',
      url: hit.resource.webUrl
    }));
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      id: msg.id,
      content: msg.body?.content,
      author: msg.from?.user?.displayName,
      timestamp: msg.createdDateTime,
      replies: msg.replies?.map(reply => ({
        content: reply.body?.content,
        author: reply.from?.user?.displayName,
        timestamp: reply.createdDateTime
      })) || []
    }));
  }
}

module.exports = MicrosoftGraphService;