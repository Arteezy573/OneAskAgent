using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;

namespace OneAskAgent.Plugins
{
    public class GraphServicePlugin
    {
        private readonly HttpClient _httpClient;

        public GraphServicePlugin()
        {
            _httpClient = new HttpClient();
        }

        [KernelFunction("search_teams_messages")]
        [Description("Search Microsoft Teams messages for user conversations and discussions")]
        public async Task<string> SearchTeamsMessagesAsync(
            [Description("Search query for Teams messages")] string query,
            [Description("User ID for permission-aware search")] string userId = "")
        {
            try
            {
                // Mock data for demo purposes
                var mockTeamsMessages = new[]
                {
                    new
                    {
                        id = "msg-1",
                        content = "Hey team, has anyone seen the latest updates on Project Bonica? I need to understand the current architecture before our client meeting.",
                        author = "Alice Johnson",
                        timestamp = "2024-02-20T14:30:00Z",
                        teamName = "Engineering Team",
                        channelName = "Project Bonica",
                        url = "https://teams.microsoft.com/l/message/..."
                    },
                    new
                    {
                        id = "msg-2",
                        content = "The EDT onboarding guide has been updated with new security requirements. All new hires must complete the Azure security training before getting access to development resources.",
                        author = "Bob Smith",
                        timestamp = "2024-02-18T10:15:00Z",
                        teamName = "HR & Onboarding",
                        channelName = "New Hire Process",
                        url = "https://teams.microsoft.com/l/message/..."
                    },
                    new
                    {
                        id = "msg-3",
                        content = "Quick reminder: our API design standards meeting is scheduled for tomorrow at 2 PM. We'll be discussing the new rate limiting requirements and authentication changes.",
                        author = "Charlie Brown",
                        timestamp = "2024-02-15T16:45:00Z",
                        teamName = "Architecture Team",
                        channelName = "General",
                        url = "https://teams.microsoft.com/l/message/..."
                    }
                };

                var results = mockTeamsMessages
                    .Where(msg => msg.content.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error searching Teams messages: {ex.Message}";
            }
        }

        [KernelFunction("get_user_profile")]
        [Description("Get Microsoft Graph user profile information")]
        public async Task<string> GetUserProfileAsync(
            [Description("User ID or email address")] string userId)
        {
            try
            {
                // Mock user profile
                var userProfile = new
                {
                    id = userId,
                    displayName = "John Doe",
                    mail = $"{userId}@company.com",
                    jobTitle = "Software Engineer",
                    department = "Engineering",
                    officeLocation = "Building 1, Floor 3"
                };

                return JsonSerializer.Serialize(userProfile, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error getting user profile: {ex.Message}";
            }
        }

        [KernelFunction("search_sharepoint")]
        [Description("Search SharePoint documents and files")]
        public async Task<string> SearchSharePointAsync(
            [Description("Search query for SharePoint content")] string query,
            [Description("User ID for permission-aware search")] string userId = "")
        {
            try
            {
                // Mock SharePoint data
                var mockSharePointData = new[]
                {
                    new
                    {
                        id = "sp-1",
                        title = "Q1 Financial Report - Project Bonica",
                        content = "Comprehensive financial analysis showing 15% cost reduction through optimization initiatives...",
                        author = "Finance Team",
                        timestamp = "2024-02-22T00:00:00Z",
                        url = "https://company.sharepoint.com/sites/finance/documents/q1-report.docx",
                        siteUrl = "https://company.sharepoint.com/sites/finance"
                    },
                    new
                    {
                        id = "sp-2",
                        title = "EDT Team Guidelines and Best Practices",
                        content = "Updated guidelines for the Engineering Development Team including coding standards, review processes, and deployment procedures...",
                        author = "Engineering Leadership",
                        timestamp = "2024-02-20T00:00:00Z",
                        url = "https://company.sharepoint.com/sites/engineering/documents/edt-guidelines.pdf",
                        siteUrl = "https://company.sharepoint.com/sites/engineering"
                    }
                };

                var results = mockSharePointData
                    .Where(doc => doc.title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                                 doc.content.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                return JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Error searching SharePoint: {ex.Message}";
            }
        }
    }
}