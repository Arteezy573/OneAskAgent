# OneAsk - Your Personal Knowledge Agent

OneAsk is a hackathon project that empowers individual contributors to instantly find answers across their Microsoft workspaces—ADO Wikis, Engineering Hub docs, Teams threads, and chats—using a single AI-powered interface.

**Built with .NET 8 + Microsoft Semantic Kernel Agent Framework**

## 🎯 Key Features

- **Natural Language Q&A**: Ask questions like "What's the latest on Project Bonica?" or "Where's the onboarding doc for EDT?"
- **Multi-source Retrieval**: Pulls relevant info from ADO, Engineering Hub, Teams channels, and vector search
- **Contextual Answers**: Synthesizes responses with citations, timestamps, and author info
- **Conversational Memory**: Maintains context across multiple interactions using ChatHistoryAgentThread
- **Function Plugins**: Extensible plugin system for data source integration
- **Real-time Logging**: Monitor all function calls and AI decision-making
- **Enterprise-Ready**: Built with production deployment and scalability in mind

## 🏗️ Architecture

This project follows the Microsoft Semantic Kernel Agent Framework pattern and includes:

- **ASP.NET Core** Web API with Semantic Kernel
- **ChatCompletionAgent** for conversational AI with built-in conversation management
- **Function Plugins** for extensible data source integration
- **ChatHistoryAgentThread** for conversation memory
- **Azure OpenAI** integration with automatic function calling
- **Function Invocation Filters** for real-time logging and monitoring
- **Plugin Architecture** for adding new data sources

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 or higher
- Azure OpenAI service with GPT-4 deployment (optional for demo mode)

### Installation

1. **Navigate to backend:**
   ```bash
   cd OneAskAgent
   ```

2. **Configure Azure OpenAI (choose one option):**

   **Option A: Environment Variables (Recommended)**
   ```bash
   export AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
   export AZURE_OPENAI_API_KEY=your-api-key
   export AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
   ```

   **Option B: Configuration File**
   ```bash
   cp appsettings.example.json appsettings.json
   # Edit appsettings.json with your credentials
   ```

   **Option C: Demo Mode (No Azure OpenAI needed)**
   ```bash
   AZURE_OPENAI_ENDPOINT=https://demo.openai.azure.com/ AZURE_OPENAI_API_KEY=demo-key AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4 dotnet run
   ```

3. **Build and run the application:**
   ```bash
   dotnet build
   dotnet run
   ```

4. **Access the application:**
   - **API:** http://localhost:5000
   - **Frontend:** Open `index.html` in your browser
   - **Health Check:** http://localhost:5000/api/chat/health

### Quick Start Scripts

Use the provided scripts for easy startup:
- **Windows:** `OneAskAgent\start.bat`
- **Linux/Mac:** `OneAskAgent/start.sh`

## 📱 Usage Examples

### Web Interface
Open `index.html` in your browser and try these example questions:
- "What's the latest on Project Bonica?"
- "Where is the onboarding doc for EDT?"
- "Show me API design standards"
- "What are deployment best practices?"

### API Usage

#### Health Check
```bash
curl http://localhost:5000/api/chat/health
```

#### Ask a Question
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Project Bonica?",
    "userId": "demo-user"
  }'
```

#### Send Chat Message
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the EDT onboarding guide",
    "userId": "demo-user"
  }'
```

## 🗂️ Project Structure

```
Hackathon2025/
├── OneAskAgent/                      # .NET Backend
│   ├── Configuration/
│   │   └── AzureOpenAIConfig.cs      # Azure OpenAI configuration
│   ├── Controllers/
│   │   └── ChatController.cs         # Web API controller
│   ├── Plugins/
│   │   ├── AdoServicePlugin.cs       # Azure DevOps integration
│   │   ├── GraphServicePlugin.cs     # Microsoft Graph/Teams integration
│   │   ├── EngineeringHubServicePlugin.cs # Engineering documentation
│   │   └── VectorSearchServicePlugin.cs # Vector search functionality
│   ├── Services/
│   │   └── FunctionInvocationFilter.cs # Function call logging
│   ├── OneAskAgent.cs               # Main agent class
│   ├── Program.cs                   # Web API startup
│   ├── OneAskAgent.csproj           # Project file
│   ├── appsettings.json             # Configuration file
│   ├── appsettings.example.json     # Configuration template
│   ├── start.bat / start.sh         # Quick start scripts
│   └── .env.example                 # Environment variables template
├── index.html                       # Web frontend interface
├── MOCK_DATA.md                     # Sample data documentation
└── README.md                        # This file
```

## 🔧 API Endpoints

- `POST /api/chat/message` - Send a chat message
- `POST /api/chat/ask` - Ask a natural language question
- `POST /api/chat/clear-history` - Clear conversation history
- `GET /api/chat/health` - Service health check

## 🤖 Available Function Plugins

### ADO Service Plugin
- `search_wiki` - Search Azure DevOps wiki pages
- `search_work_items` - Search work items
- `get_work_item` - Get specific work item details

### Graph Service Plugin
- `search_teams_messages` - Search Teams messages
- `get_user_profile` - Get user profile information
- `search_sharepoint` - Search SharePoint documents

### Engineering Hub Service Plugin
- `search_engineering_docs` - Search technical documentation
- `get_document_by_category` - Get documents by category
- `get_document_by_tags` - Get documents by tags

### Vector Search Service Plugin
- `hybrid_search` - Hybrid vector and keyword search
- `semantic_search` - Semantic similarity search
- `keyword_search` - Traditional keyword search

## 🎯 What Makes This Special

### Semantic Kernel Agent Framework
- **ChatCompletionAgent**: Built-in conversation management
- **Automatic Function Calling**: AI automatically selects and calls appropriate plugins
- **Conversation Memory**: Maintains context across multiple interactions using ChatHistoryAgentThread
- **Function Logging**: Real-time monitoring of all AI decisions and tool usage

### Enterprise-Ready Architecture
- **Type Safety**: C# provides compile-time error checking
- **Performance**: Compiled language with better resource utilization
- **Scalability**: ASP.NET Core designed for high-throughput scenarios
- **Maintainability**: Clear separation of concerns and structured architecture
- **Plugin System**: Kernel plugins with automatic function discovery and invocation

### Rich Mock Data
Even without external APIs configured, the system demonstrates full functionality with realistic mock data including:
- Project Bonica information and status updates
- EDT onboarding guides and processes
- API design standards and best practices
- Deployment procedures and technical documentation

## 🚀 Demo Mode

The application runs perfectly in demo mode without any external dependencies:

```bash
cd OneAskAgent
AZURE_OPENAI_ENDPOINT=https://demo.openai.azure.com/ AZURE_OPENAI_API_KEY=demo-key AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4 dotnet run
```

This demonstrates:
- ✅ Complete plugin system loading
- ✅ API endpoints responding correctly
- ✅ Function call logging and monitoring
- ✅ Structured error handling
- ✅ Frontend integration ready

## 🔧 Configuration Options

### Azure OpenAI Configuration

**Method 1: appsettings.json**
```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-instance.openai.azure.com/",
    "ApiKey": "your-azure-openai-api-key",
    "DeploymentName": "gpt-4",
    "ApiVersion": "2024-06-01"
  }
}
```

**Method 2: Environment Variables**
```bash
export AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
export AZURE_OPENAI_API_KEY=your-api-key
export AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

### Optional: External Data Sources

```bash
# Azure DevOps
ADO_ORGANIZATION=your-org
ADO_PROJECT=your-project
ADO_PAT=your-personal-access-token

# Microsoft Graph
MICROSOFT_APP_ID=your-app-id
MICROSOFT_APP_SECRET=your-app-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

## 👨‍💻 Development

### Adding New Plugins

1. Create a new plugin class in the `OneAskAgent/Plugins/` folder
2. Use `[KernelFunction]` and `[Description]` attributes
3. Register the plugin in `OneAskAgent.CreateKnowledgeAgentAsync()`

Example:
```csharp
public class MyPlugin
{
    [KernelFunction("my_function")]
    [Description("Description of what this function does")]
    public async Task<string> MyFunctionAsync(
        [Description("Parameter description")] string parameter)
    {
        // Implementation
        return "Result";
    }
}
```

### Function Logging

All function calls are automatically logged with:
- Function name and parameters
- Execution time
- Results and errors
- Real-time console output during execution

### Frontend Integration

The included `index.html` demonstrates:
- Real-time chat interface
- Connection status monitoring
- Function call visualization
- Example questions
- Teams-like design

## 🏆 Architecture Benefits

### vs. Traditional RAG Pipelines
- **Conversation Memory**: Unlike simple RAG pipelines, maintains context across interactions
- **Automatic Tool Selection**: AI intelligently chooses which plugins to use based on the query
- **Real-time Monitoring**: See exactly which functions the AI is calling and why
- **Built-in Orchestration**: No manual coordination of multiple data sources needed

### vs. Node.js Implementation
| Feature | Node.js Backend | .NET Backend |
|---------|----------------|--------------|
| Language | JavaScript | C# |
| Framework | Express.js | ASP.NET Core |
| AI Integration | OpenAI SDK | Semantic Kernel |
| Agent Pattern | Custom RAG Pipeline | ChatCompletionAgent |
| Function Calls | Manual implementation | Automatic with SK |
| Conversation Memory | Custom | ChatHistoryAgentThread |
| Plugin System | Manual registration | Kernel plugins |
| Logging | Console logs | Function filters |
| Type Safety | Runtime errors | Compile-time checking |

## 🤝 Contributing

This is a hackathon project! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎉 Hackathon Notes

### Demo Scenarios:
1. **New Employee Onboarding**: "Where do I find the EDT onboarding guide?"
2. **Project Updates**: "What's the current status of Project Bonica?"
3. **Technical Documentation**: "Show me our API design standards"
4. **Process Questions**: "What's our deployment process?"

### Future Enhancements:
- Real-time notifications for new relevant content
- Integration with SharePoint and OneDrive
- Advanced permission-aware search
- Analytics dashboard for knowledge gaps
- Multi-language support
- Voice interface integration
- Mobile app for on-the-go access
- Enhanced conversation memory and context
- Deployment to Azure Container Apps or Azure App Service
- Integration with Azure Active Directory for authentication