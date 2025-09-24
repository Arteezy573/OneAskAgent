using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;

namespace OneAskAgent.Plugins
{
    public class EngineeringHubServicePlugin
    {
        [KernelFunction("search_engineering_docs")]
        [Description("Search Engineering Hub documentation for technical guides, best practices, and standards")]
        public async Task<string> SearchEngineeringDocsAsync(
            [Description("Search query for engineering documentation")] string query)
        {
            try
            {
                // Mock Engineering Hub data
                var mockEngineeringDocs = new[]
                {
                    new
                    {
                        id = "eh-1",
                        title = "EDT Onboarding Guide",
                        content = "Welcome to the Engineering Development Team! This comprehensive guide covers initial setup, required tools, development processes, and team workflows. Start by setting up your development environment with Visual Studio Code, Git, and Azure CLI. Join our Teams channels for daily standups and code reviews. Complete the security training and request access to Azure DevOps and our internal wiki.",
                        category = "Onboarding",
                        tags = new[] { "EDT", "onboarding", "setup", "new hire", "getting started" },
                        author = "Engineering Team",
                        timestamp = "2024-01-15T10:00:00Z",
                        url = "https://engineeringhub.internal/docs/edt-onboarding"
                    },
                    new
                    {
                        id = "eh-2",
                        title = "Project Bonica - Latest Updates",
                        content = "Project Bonica is our flagship distributed system built on microservices architecture. Recent updates include: 1) API Gateway v2.1 deployment completed, 2) Auth Service migration to Azure AD B2C in progress, 3) Data Processing Pipeline now handles 10M+ events/day, 4) New monitoring dashboard available at bonica-dash.internal. Next sprint focuses on performance optimization and cost reduction. Current status: 85% complete, on track for Q2 release.",
                        category = "Projects",
                        tags = new[] { "Bonica", "architecture", "microservices", "updates", "status" },
                        author = "Project Manager - Bonica",
                        timestamp = "2024-02-20T14:30:00Z",
                        url = "https://engineeringhub.internal/projects/bonica-status"
                    },
                    new
                    {
                        id = "eh-3",
                        title = "Deployment Best Practices",
                        content = "Updated deployment guidelines for safe and efficient releases: 1) Use blue-green deployments for zero-downtime, 2) Implement feature flags for gradual rollouts, 3) Automate testing with our CI/CD pipeline in Azure DevOps, 4) Monitor key metrics during deployment, 5) Always have a rollback plan. New requirement: All production deployments must be approved by team leads and include database migration scripts.",
                        category = "DevOps",
                        tags = new[] { "deployment", "CI/CD", "best-practices", "production", "azure" },
                        author = "DevOps Team",
                        timestamp = "2024-02-15T09:15:00Z",
                        url = "https://engineeringhub.internal/docs/deployment-guide"
                    },
                    new
                    {
                        id = "eh-4",
                        title = "API Design Standards",
                        content = "REST API design principles and requirements: 1) Use semantic versioning (/api/v1/, /api/v2/), 2) Implement proper HTTP status codes (200, 201, 400, 404, 500), 3) Include comprehensive error messages with error codes, 4) Use OpenAPI 3.0 for documentation, 5) Implement rate limiting and authentication, 6) Follow naming conventions: nouns for resources, kebab-case for endpoints. All APIs must be reviewed and approved before production deployment.",
                        category = "Standards",
                        tags = new[] { "API", "REST", "standards", "documentation", "design" },
                        author = "Architecture Team",
                        timestamp = "2024-02-10T16:45:00Z",
                        url = "https://engineeringhub.internal/docs/api-standards"
                    },
                    new
                    {
                        id = "eh-7",
                        title = "Managed Data Lake - Architecture Overview",
                        content = "The Managed Data Lake is our enterprise-scale data platform built on Azure Data Lake Storage Gen2. Key components include: 1) Data Ingestion Layer using Azure Data Factory for batch and streaming ingestion, 2) Storage Layer with organized zones (Raw, Curated, Analytics), 3) Processing Layer using Azure Synapse Analytics and Databricks, 4) Governance Layer with Azure Purview for data cataloging and lineage, 5) Security Layer with Azure AD integration and data encryption. The platform supports petabyte-scale storage and processes over 50TB of data daily across 200+ data sources.",
                        category = "Data Platform",
                        tags = new[] { "data lake", "azure", "synapse", "databricks", "purview", "architecture" },
                        author = "Data Platform Team",
                        timestamp = "2024-02-25T10:00:00Z",
                        url = "https://engineeringhub.internal/docs/managed-data-lake-architecture"
                    }
                };

                var results = mockEngineeringDocs
                    .Where(doc => doc.title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                                 doc.content.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                                 doc.tags.Any(tag => tag.Contains(query, StringComparison.OrdinalIgnoreCase)))
                    .ToList();

                return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error searching engineering documentation: {ex.Message}";
            }
        }

        [KernelFunction("get_document_by_category")]
        [Description("Get Engineering Hub documents by category")]
        public async Task<string> GetDocumentsByCategoryAsync(
            [Description("Document category (e.g., Onboarding, Projects, DevOps, Standards, Data Platform)")] string category)
        {
            try
            {
                // Mock implementation - filter by category
                var allDocs = await SearchEngineeringDocsAsync("");
                var docs = JsonSerializer.Deserialize<dynamic[]>(allDocs);

                var filteredDocs = docs?.Where(doc =>
                    doc.GetProperty("category").GetString()?.Equals(category, StringComparison.OrdinalIgnoreCase) == true).ToArray();

                return JsonSerializer.Serialize(filteredDocs, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error getting documents by category: {ex.Message}";
            }
        }

        [KernelFunction("get_document_by_tags")]
        [Description("Get Engineering Hub documents by tags")]
        public async Task<string> GetDocumentsByTagsAsync(
            [Description("Comma-separated tags to search for")] string tags)
        {
            try
            {
                var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                 .Select(t => t.Trim())
                                 .ToArray();

                var searchResults = await SearchEngineeringDocsAsync(string.Join(" ", tagList));
                return searchResults;
            }
            catch (Exception ex)
            {
                return $"Error getting documents by tags: {ex.Message}";
            }
        }
    }
}