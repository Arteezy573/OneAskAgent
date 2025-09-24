using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using OneAskAgent.Configuration;
using OneAskAgent.Services;
using OneAskAgent.Plugins;
using Azure.Identity;

namespace OneAskAgent
{
    public class OneAskAgent : IDisposable
    {
        private ChatCompletionAgent _agent = null!;
        private readonly AzureOpenAIConfig _azureOpenAIConfig;
        private ChatHistoryAgentThread _thread = null!;

        private const string SystemInstructions = """
        You are OneAsk, a personal knowledge agent that helps users find information across their Microsoft workplace tools (Teams, Azure DevOps, Engineering Hub, SharePoint).

        Your role is to:
        1. Provide accurate, helpful answers based on available data sources
        2. Always cite your sources with author, timestamp, and source type
        3. Be concise but comprehensive in your responses
        4. If information is missing or unclear, acknowledge this and suggest alternatives
        5. Use appropriate tools based on the nature of the user's question

        Available Tools and When to Use Them:
        1. **ADO Service Plugin**: Use for Azure DevOps work items, wiki pages, and project information
        2. **Graph Service Plugin**: Use for Teams messages, user profiles, and SharePoint documents
        3. **Engineering Hub Service Plugin**: Use for technical documentation, best practices, and engineering standards
        4. **Vector Search Service Plugin**: Use for comprehensive search across all sources with semantic understanding

        Response Format:
        - Provide a direct answer to the question
        - Include supporting details from your searches
        - Always cite sources in the format: [Source: Author, Date, URL]
        - Suggest follow-up actions when appropriate
        - If multiple sources have conflicting information, acknowledge this and provide context

        Search Strategy:
        1. Start with the most relevant tool based on the user's question
        2. Use vector search for broad or complex queries
        3. Search multiple sources when comprehensive information is needed
        4. Prioritize recent and authoritative sources

        Remember: Only access information that users have permission to view. Be helpful, accurate, and transparent about your capabilities and limitations.
        """;

        private OneAskAgent(AzureOpenAIConfig azureOpenAIConfig)
        {
            _azureOpenAIConfig = azureOpenAIConfig;
        }

        public static async Task<OneAskAgent> CreateAsync(AzureOpenAIConfig azureOpenAIConfig)
        {
            var agent = new OneAskAgent(azureOpenAIConfig);
            agent._agent = await agent.CreateKnowledgeAgentAsync();
            agent._thread = new ChatHistoryAgentThread();
            return agent;
        }

        private async Task<ChatCompletionAgent> CreateKnowledgeAgentAsync()
        {
            // Create kernel with plugins
            var builder = Kernel.CreateBuilder();

            // Add Azure OpenAI connector
            if (string.IsNullOrEmpty(_azureOpenAIConfig.ApiKey))
            {
                // Use DefaultAzureCredential when no API key is provided
                var credential = new DefaultAzureCredential();
                builder.AddAzureOpenAIChatCompletion(
                    deploymentName: _azureOpenAIConfig.DeploymentName,
                    endpoint: _azureOpenAIConfig.Endpoint,
                    credential,
                    apiVersion: _azureOpenAIConfig.ApiVersion);
            }
            else
            {
                // Use API key when provided
                builder.AddAzureOpenAIChatCompletion(
                    deploymentName: _azureOpenAIConfig.DeploymentName,
                    endpoint: _azureOpenAIConfig.Endpoint,
                    apiKey: _azureOpenAIConfig.ApiKey,
                    apiVersion: _azureOpenAIConfig.ApiVersion);
            }

            var kernel = builder.Build();

            // Add function invocation filter for logging
            kernel.FunctionInvocationFilters.Add(new FunctionInvocationFilter());

            // Register plugins
            Console.WriteLine("Registering OneAsk plugins...");

            // ADO Service Plugin for Azure DevOps integration
            kernel.ImportPluginFromObject(new AdoServicePlugin(), "AdoService");
            Console.WriteLine("✅ ADO Service Plugin registered");

            // Graph Service Plugin for Microsoft Graph/Teams integration
            kernel.ImportPluginFromObject(new GraphServicePlugin(), "GraphService");
            Console.WriteLine("✅ Graph Service Plugin registered");

            // Engineering Hub Service Plugin for technical documentation
            kernel.ImportPluginFromObject(new EngineeringHubServicePlugin(), "EngineeringHubService");
            Console.WriteLine("✅ Engineering Hub Service Plugin registered");

            // Vector Search Service Plugin for comprehensive search
            kernel.ImportPluginFromObject(new VectorSearchServicePlugin(), "VectorSearchService");
            Console.WriteLine("✅ Vector Search Service Plugin registered");

            Console.WriteLine("All OneAsk plugins registered successfully!");

            // Create the ChatCompletionAgent
            var agent = new ChatCompletionAgent()
            {
                Name = "OneAskAgent",
                Instructions = SystemInstructions,
                Kernel = kernel,
                Arguments = new KernelArguments(new PromptExecutionSettings()
                {
#pragma warning disable SKEXP0001
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(options: new() { RetainArgumentTypes = true })
#pragma warning restore SKEXP0001
                })
            };

            return agent;
        }

        public async Task<string> GenerateAsync(string userPrompt)
        {
            try
            {
                Console.WriteLine($"[USER QUERY] {userPrompt}");

                // Create current user message
                var userMessage = new ChatMessageContent(AuthorRole.User, userPrompt);
                var messages = new List<ChatMessageContent> { userMessage };

                // Get the agent's response using the thread for conversation context
                await foreach (var response in _agent.InvokeAsync(messages, _thread))
                {
                    var result = response.Message.Content ?? "No response generated";
                    Console.WriteLine($"[AGENT RESPONSE] Generated {result.Length} characters");
                    return result;
                }

                return "Error: No response received from agent";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] {ex.Message}");
                return $"Error generating response: {ex.Message}";
            }
        }

        public async Task<string> ProcessQueryAsync(string query, string? userId = null)
        {
            try
            {
                // Enhanced query processing with user context
                var contextualPrompt = !string.IsNullOrEmpty(userId)
                    ? $"User ID: {userId}\n\nQuery: {query}"
                    : query;

                return await GenerateAsync(contextualPrompt);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Processing query failed: {ex.Message}");
                return $"I encountered an error while processing your query: {ex.Message}. Please try again or rephrase your question.";
            }
        }

        public void ClearConversationHistory()
        {
            _thread = new ChatHistoryAgentThread();
            Console.WriteLine("[INFO] Conversation history cleared");
        }

        public void Dispose()
        {
            // Clean up resources if needed
            Console.WriteLine("[INFO] OneAskAgent disposed");
        }
    }
}