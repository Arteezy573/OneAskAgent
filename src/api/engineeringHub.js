const axios = require('axios');

class EngineeringHubService {
  constructor() {
    this.mockData = [
      {
        id: 'eh-1',
        title: 'EDT Onboarding Guide',
        content: 'Welcome to the Engineering Development Team! This comprehensive guide covers initial setup, required tools, development processes, and team workflows. Start by setting up your development environment with Visual Studio Code, Git, and Azure CLI. Join our Teams channels for daily standups and code reviews. Complete the security training and request access to Azure DevOps and our internal wiki.',
        category: 'Onboarding',
        tags: ['EDT', 'onboarding', 'setup', 'new hire', 'getting started'],
        author: 'Engineering Team',
        timestamp: '2024-01-15T10:00:00Z',
        url: 'https://engineeringhub.internal/docs/edt-onboarding'
      },
      {
        id: 'eh-2',
        title: 'Project Bonica - Latest Updates',
        content: 'Project Bonica is our flagship distributed system built on microservices architecture. Recent updates include: 1) API Gateway v2.1 deployment completed, 2) Auth Service migration to Azure AD B2C in progress, 3) Data Processing Pipeline now handles 10M+ events/day, 4) New monitoring dashboard available at bonica-dash.internal. Next sprint focuses on performance optimization and cost reduction. Current status: 85% complete, on track for Q2 release.',
        category: 'Projects',
        tags: ['Bonica', 'architecture', 'microservices', 'updates', 'status'],
        author: 'Project Manager - Bonica',
        timestamp: '2024-02-20T14:30:00Z',
        url: 'https://engineeringhub.internal/projects/bonica-status'
      },
      {
        id: 'eh-3',
        title: 'Deployment Best Practices',
        content: 'Updated deployment guidelines for safe and efficient releases: 1) Use blue-green deployments for zero-downtime, 2) Implement feature flags for gradual rollouts, 3) Automate testing with our CI/CD pipeline in Azure DevOps, 4) Monitor key metrics during deployment, 5) Always have a rollback plan. New requirement: All production deployments must be approved by team leads and include database migration scripts.',
        category: 'DevOps',
        tags: ['deployment', 'CI/CD', 'best-practices', 'production', 'azure'],
        author: 'DevOps Team',
        timestamp: '2024-02-15T09:15:00Z',
        url: 'https://engineeringhub.internal/docs/deployment-guide'
      },
      {
        id: 'eh-4',
        title: 'API Design Standards',
        content: 'REST API design principles and requirements: 1) Use semantic versioning (/api/v1/, /api/v2/), 2) Implement proper HTTP status codes (200, 201, 400, 404, 500), 3) Include comprehensive error messages with error codes, 4) Use OpenAPI 3.0 for documentation, 5) Implement rate limiting and authentication, 6) Follow naming conventions: nouns for resources, kebab-case for endpoints. All APIs must be reviewed and approved before production deployment.',
        category: 'Standards',
        tags: ['API', 'REST', 'standards', 'documentation', 'design'],
        author: 'Architecture Team',
        timestamp: '2024-02-10T16:45:00Z',
        url: 'https://engineeringhub.internal/docs/api-standards'
      },
      {
        id: 'eh-5',
        title: 'FinOps Cost Optimization Guide',
        content: 'Financial Operations best practices for Azure cost management: 1) Use Azure Cost Management to track spending, 2) Implement auto-scaling for compute resources, 3) Use Azure Reserved Instances for predictable workloads, 4) Monitor and optimize storage costs, 5) Tag all resources for proper cost allocation, 6) Schedule non-production resources to shut down after hours. Current focus: reducing monthly cloud spend by 20% while maintaining performance.',
        category: 'FinOps',
        tags: ['finops', 'cost', 'optimization', 'azure', 'budget', 'cloud'],
        author: 'FinOps Team',
        timestamp: '2024-02-18T11:20:00Z',
        url: 'https://engineeringhub.internal/docs/finops-guide'
      },
      {
        id: 'eh-6',
        title: 'Security Guidelines and Compliance',
        content: 'Security requirements for all engineering projects: 1) Enable multi-factor authentication on all accounts, 2) Use Azure Key Vault for secrets management, 3) Implement HTTPS/TLS for all communications, 4) Conduct security reviews before production deployment, 5) Follow GDPR and SOC2 compliance requirements, 6) Report security incidents immediately to security@company.com. New requirement: All applications must pass automated security scanning.',
        category: 'Security',
        tags: ['security', 'compliance', 'azure', 'key vault', 'https', 'gdpr'],
        author: 'Security Team',
        timestamp: '2024-02-12T13:45:00Z',
        url: 'https://engineeringhub.internal/docs/security-guidelines'
      },
      {
        id: 'eh-7',
        title: 'Managed Data Lake - Architecture Overview',
        content: 'The Managed Data Lake is our enterprise-scale data platform built on Azure Data Lake Storage Gen2. Key components include: 1) Data Ingestion Layer using Azure Data Factory for batch and streaming ingestion, 2) Storage Layer with organized zones (Raw, Curated, Analytics), 3) Processing Layer using Azure Synapse Analytics and Databricks, 4) Governance Layer with Azure Purview for data cataloging and lineage, 5) Security Layer with Azure AD integration and data encryption. The platform supports petabyte-scale storage and processes over 50TB of data daily across 200+ data sources.',
        category: 'Data Platform',
        tags: ['data lake', 'azure', 'synapse', 'databricks', 'purview', 'architecture'],
        author: 'Data Platform Team',
        timestamp: '2024-02-25T10:00:00Z',
        url: 'https://engineeringhub.internal/docs/managed-data-lake-architecture'
      },
      {
        id: 'eh-8',
        title: 'Data Lake Onboarding Guide',
        content: 'Step-by-step guide to onboard new data sources to the Managed Data Lake: 1) Submit data onboarding request through ServiceNow, 2) Complete data classification and sensitivity assessment, 3) Define data schema and validation rules, 4) Configure ingestion pipeline in Azure Data Factory, 5) Set up data quality monitoring with Great Expectations, 6) Register dataset in Azure Purview catalog, 7) Create access policies and permissions, 8) Validate end-to-end data flow. Typical onboarding time: 2-3 weeks for standard datasets, 4-6 weeks for complex sources.',
        category: 'Data Platform',
        tags: ['data lake', 'onboarding', 'data factory', 'purview', 'data quality'],
        author: 'Data Engineering Team',
        timestamp: '2024-02-22T14:30:00Z',
        url: 'https://engineeringhub.internal/docs/data-lake-onboarding'
      },
      {
        id: 'eh-9',
        title: 'Data Lake Security and Governance',
        content: 'Comprehensive security framework for the Managed Data Lake: 1) Role-based access control (RBAC) with Azure AD groups, 2) Data encryption at rest and in transit using Azure Key Vault, 3) Network security with private endpoints and VNet integration, 4) Data masking and anonymization for sensitive data, 5) Audit logging and monitoring with Azure Monitor, 6) Data retention policies and automated cleanup, 7) Compliance with GDPR, HIPAA, and SOX requirements. All data access is logged and audited for security compliance.',
        category: 'Data Platform',
        tags: ['data lake', 'security', 'governance', 'compliance', 'encryption', 'audit'],
        author: 'Data Governance Team',
        timestamp: '2024-02-20T09:15:00Z',
        url: 'https://engineeringhub.internal/docs/data-lake-security'
      },
      {
        id: 'eh-10',
        title: 'Data Lake Performance Optimization',
        content: 'Best practices for optimizing Managed Data Lake performance: 1) Partition data by date and frequently queried columns, 2) Use Delta Lake format for better query performance and ACID transactions, 3) Implement data tiering (Hot, Cool, Archive) based on access patterns, 4) Optimize file sizes (128MB-1GB) for best performance, 5) Use column-based formats like Parquet for analytics workloads, 6) Implement caching strategies with Azure Redis Cache, 7) Monitor and tune Synapse SQL pool performance. Recent optimizations have improved query performance by 60% and reduced costs by 35%.',
        category: 'Data Platform',
        tags: ['data lake', 'performance', 'optimization', 'delta lake', 'parquet', 'synapse'],
        author: 'Data Platform Team',
        timestamp: '2024-02-23T16:45:00Z',
        url: 'https://engineeringhub.internal/docs/data-lake-performance'
      },
      {
        id: 'eh-11',
        title: 'Data Lake Monitoring and Alerting',
        content: 'Monitoring strategy for the Managed Data Lake platform: 1) Data pipeline monitoring with Azure Data Factory alerts, 2) Storage utilization tracking with Azure Monitor metrics, 3) Query performance monitoring in Synapse Analytics, 4) Data quality alerts using Great Expectations, 5) Cost monitoring and budget alerts, 6) Security incident detection and response, 7) SLA monitoring for data freshness and availability. Critical alerts are sent to data-ops@company.com with 24/7 on-call rotation. Monthly SLA reports show 99.9% uptime and 95% data freshness compliance.',
        category: 'Data Platform',
        tags: ['data lake', 'monitoring', 'alerting', 'sla', 'data quality', 'azure monitor'],
        author: 'Data Operations Team',
        timestamp: '2024-02-21T11:30:00Z',
        url: 'https://engineeringhub.internal/docs/data-lake-monitoring'
      }
    ];
  }

  async search(query) {
    try {
      const results = this.mockData.filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      return results.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        author: doc.author,
        timestamp: doc.timestamp,
        source: 'Engineering Hub',
        url: doc.url,
        category: doc.category,
        tags: doc.tags
      }));
    } catch (error) {
      console.error('Error searching Engineering Hub:', error);
      throw error;
    }
  }

  async getDocument(id) {
    try {
      const doc = this.mockData.find(d => d.id === id);
      if (!doc) {
        throw new Error(`Document ${id} not found`);
      }
      return doc;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      return this.mockData.filter(doc => 
        doc.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching by category:', error);
      throw error;
    }
  }

  async getByTags(tags) {
    try {
      const tagList = Array.isArray(tags) ? tags : [tags];
      return this.mockData.filter(doc =>
        tagList.some(tag => 
          doc.tags.some(docTag => 
            docTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    } catch (error) {
      console.error('Error fetching by tags:', error);
      throw error;
    }
  }
}

module.exports = EngineeringHubService;