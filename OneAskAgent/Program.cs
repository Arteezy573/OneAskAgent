using OneAskAgent.Configuration;
using OneAskAgent;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Azure OpenAI
var azureOpenAIConfig = new AzureOpenAIConfig();
builder.Configuration.GetSection("AzureOpenAI").Bind(azureOpenAIConfig);

// Set from environment variables if not in appsettings
if (string.IsNullOrEmpty(azureOpenAIConfig.Endpoint))
{
    azureOpenAIConfig.Endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT") ?? "";
}
if (string.IsNullOrEmpty(azureOpenAIConfig.ApiKey))
{
    azureOpenAIConfig.ApiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY") ?? "";
}
if (string.IsNullOrEmpty(azureOpenAIConfig.DeploymentName))
{
    azureOpenAIConfig.DeploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME") ?? "gpt-4";
}

// Register OneAskAgent as singleton (pre-initialized)
builder.Services.AddSingleton<OneAskAgent.OneAskAgent>(serviceProvider =>
{
    var logger = serviceProvider.GetRequiredService<ILogger<OneAskAgent.OneAskAgent>>();

    try
    {
        Console.WriteLine("Initializing OneAsk Agent...");
        var agent = OneAskAgent.OneAskAgent.CreateAsync(azureOpenAIConfig).GetAwaiter().GetResult();
        Console.WriteLine("✅ OneAsk Agent initialized successfully!");
        return agent;
    }
    catch (Exception ex)
    {
        logger.LogError($"Failed to initialize OneAsk Agent: {ex.Message}");
        throw;
    }
});

// Add logging
builder.Services.AddLogging();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Add root endpoint
app.MapGet("/", () => new
{
    service = "OneAsk Agent API",
    version = "1.0.0",
    timestamp = DateTime.UtcNow,
    endpoints = new
    {
        chat = "/api/chat/message",
        ask = "/api/chat/ask",
        health = "/api/chat/health",
        clearHistory = "/api/chat/clear-history"
    },
    description = "Personal Knowledge Agent for Microsoft Workspaces"
});

// Initialize agent at startup
try
{
    var agent = app.Services.GetRequiredService<OneAskAgent.OneAskAgent>();
    Console.WriteLine("🚀 OneAsk Agent is ready!");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Failed to initialize OneAsk Agent: {ex.Message}");
    throw;
}

Console.WriteLine("=== OneAsk Agent API ===");
Console.WriteLine($"🌐 Server starting on: http://localhost:5000");
Console.WriteLine($"🔗 API endpoints available at: http://localhost:5000/api/chat");
Console.WriteLine($"💡 Try: POST http://localhost:5000/api/chat/ask with {{\"question\": \"What is Project Bonica?\"}}");

app.Run("http://localhost:5000");