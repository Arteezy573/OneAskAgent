using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;
using System.Text;

namespace OneAskAgent.Plugins
{
    public class AdoServicePlugin
    {
        private readonly HttpClient _httpClient;
        private readonly string _organization;
        private readonly string _project;
        private readonly string _pat;

        public AdoServicePlugin()
        {
            _httpClient = new HttpClient();
            _organization = Environment.GetEnvironmentVariable("ADO_ORGANIZATION") ?? "msazure";
            _project = Environment.GetEnvironmentVariable("ADO_PROJECT") ?? "D365";
            _pat = Environment.GetEnvironmentVariable("ADO_PAT") ?? "";

            if (!string.IsNullOrEmpty(_pat))
            {
                var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($":{_pat}"));
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);
            }
        }

        [KernelFunction("search_wiki")]
        [Description("Search Azure DevOps wiki pages for documentation and knowledge")]
        public async Task<string> SearchWikiAsync(
            [Description("Search query for wiki content")] string query)
        {
            try
            {
                // Mock data for demo purposes
                var mockWikiData = new[]
                {
                    new
                    {
                        id = "wiki-1",
                        title = "FinOps Cost Optimization Strategy",
                        content = "Our comprehensive FinOps strategy focuses on three key pillars: Visibility, Optimization, and Governance. We implement automated cost monitoring with Azure Cost Management, establish resource tagging standards, and deploy rightsizing recommendations across all workloads.",
                        path = "/FinOps/Cost-Optimization-Strategy",
                        url = "https://msazure.visualstudio.com/D365/_wiki/wikis/FNO-Wiki/123/Cost-Optimization-Strategy",
                        timestamp = "2024-01-15T00:00:00Z"
                    },
                    new
                    {
                        id = "wiki-2",
                        title = "Project Bonica Architecture Overview",
                        content = "Project Bonica is our next-generation financial analytics platform built on Azure. The architecture consists of: Data Lake for raw financial data, Synapse Analytics for processing, Power BI for visualization, and API Gateway for external integrations. The system processes over 10TB of financial data daily.",
                        path = "/Projects/Bonica/Architecture",
                        url = "https://msazure.visualstudio.com/D365/_wiki/wikis/FNO-Wiki/456/Bonica-Architecture",
                        timestamp = "2024-02-20T00:00:00Z"
                    },
                    new
                    {
                        id = "wiki-3",
                        title = "API Development Standards",
                        content = "All APIs must follow REST principles, implement OAuth 2.0 authentication, include comprehensive OpenAPI documentation, and support versioning through headers. Rate limiting is enforced at 1000 requests per hour per client. All endpoints must return standardized error responses.",
                        path = "/Engineering/API-Standards",
                        url = "https://msazure.visualstudio.com/D365/_wiki/wikis/FNO-Wiki/789/API-Standards",
                        timestamp = "2024-01-30T00:00:00Z"
                    }
                };

                var results = mockWikiData
                    .Where(w => w.title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                               w.content.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error searching wiki: {ex.Message}";
            }
        }

        [KernelFunction("search_work_items")]
        [Description("Search Azure DevOps work items for tasks, bugs, and features")]
        public async Task<string> SearchWorkItemsAsync(
            [Description("Search query for work items")] string query)
        {
            try
            {
                // Mock data for demo purposes
                var mockWorkItems = new[]
                {
                    new
                    {
                        id = 12345,
                        title = "Implement Bonica cost analytics dashboard",
                        content = "Create a comprehensive dashboard showing cost trends, budget vs actual spending, and resource utilization metrics for Project Bonica. Include drill-down capabilities by subscription, resource group, and time period.",
                        state = "Active",
                        author = "Sarah Chen",
                        timestamp = "2024-02-15T00:00:00Z",
                        url = "https://msazure.visualstudio.com/D365/_workitems/edit/12345"
                    },
                    new
                    {
                        id = 12346,
                        title = "EDT onboarding automation",
                        content = "Automate the EDT (Engineering Development Team) onboarding process including Azure subscription setup, access permissions, development environment configuration, and documentation access. Reduce onboarding time from 3 days to 4 hours.",
                        state = "New",
                        author = "Mike Johnson",
                        timestamp = "2024-02-18T00:00:00Z",
                        url = "https://msazure.visualstudio.com/D365/_workitems/edit/12346"
                    },
                    new
                    {
                        id = 12347,
                        title = "API rate limiting implementation",
                        content = "Implement proper rate limiting for all public APIs according to the new API standards. Use Redis for distributed rate limiting across multiple instances. Include proper error messages and retry-after headers.",
                        state = "In Progress",
                        author = "Alex Rodriguez",
                        timestamp = "2024-02-10T00:00:00Z",
                        url = "https://msazure.visualstudio.com/D365/_workitems/edit/12347"
                    }
                };

                var results = mockWorkItems
                    .Where(wi => wi.title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                                wi.content.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error searching work items: {ex.Message}";
            }
        }

        [KernelFunction("get_work_item")]
        [Description("Get details of a specific work item by ID")]
        public async Task<string> GetWorkItemAsync(
            [Description("Work item ID")] int workItemId)
        {
            try
            {
                // Mock implementation
                var workItem = new
                {
                    id = workItemId,
                    title = $"Work Item {workItemId}",
                    description = "This is a sample work item description",
                    state = "Active",
                    assignedTo = "John Doe",
                    createdDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    url = $"https://msazure.visualstudio.com/D365/_workitems/edit/{workItemId}"
                };

                return JsonSerializer.Serialize(workItem, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error getting work item: {ex.Message}";
            }
        }
    }
}