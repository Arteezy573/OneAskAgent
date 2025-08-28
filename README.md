# OneAsk - Your Personal Knowledge Agent

OneAsk is a hackathon project that empowers individual contributors to instantly find answers across their Microsoft workspaces—ADO Wikis, Engineering Hub docs, Teams threads, and chats—using a single AI-powered interface.

## 🎯 Key Features

- **Natural Language Q&A**: Ask questions like "What's the latest on Project Bonica?" or "Where's the onboarding doc for EDT?"
- **Multi-source Retrieval**: Pulls relevant info from ADO, Engineering Hub, Teams channels, and chats
- **Contextual Answers**: Synthesizes responses with citations, timestamps, and author info
- **Privacy-Aware**: Only accesses content the user has permission to view
- **Multiple Interfaces**: Web app, embeddable widget, and Teams bot

## 🏗️ Architecture

- **Azure OpenAI** for language understanding and generation
- **Microsoft Graph API** for Teams data access
- **ADO REST API** for Wiki and work item access
- **Engineering Hub** connector with mock data
- **RAG pipeline** with Azure Cognitive Search for vector search

## 🚀 Quick Start

### Prerequisites

1. Node.js 18+ installed
2. Azure OpenAI service with GPT-4 deployment
3. Microsoft App registration for Graph API access
4. Azure DevOps Personal Access Token
5. Azure Cognitive Search service (optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd Hackathon2025
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Set up your .env file:**
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

   # Microsoft Graph API
   MICROSOFT_APP_ID=your-app-id
   MICROSOFT_APP_SECRET=your-app-secret
   MICROSOFT_TENANT_ID=your-tenant-id

   # Azure DevOps
   ADO_ORGANIZATION=your-ado-org
   ADO_PROJECT=your-project
   ADO_PAT=your-personal-access-token

   # Teams Bot (optional)
   TEAMS_APP_ID=your-teams-app-id
   TEAMS_APP_PASSWORD=your-teams-app-password
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Web interface: http://localhost:3000
   - Widget demo: http://localhost:3000/widget
   - API health: http://localhost:3000/health

## 📱 Usage Examples

### Web Interface
Visit http://localhost:3000 and try these example questions:
- "What's the latest on Project Bonica?"
- "Where is the onboarding doc for EDT?"
- "Show me API design standards"
- "What are deployment best practices?"

### API Usage
```bash
# Ask a question
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Project Bonica?", "userId": "demo-user"}'

# Search across sources
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "onboarding", "userId": "demo-user"}'
```

### Teams Bot
1. Register your bot in Azure Bot Service
2. Configure the messaging endpoint to point to `/api/messages`
3. Add the bot to your Teams environment
4. @mention the bot or send direct messages

## 🗂️ Project Structure

```
src/
├── api/                    # External API integrations
│   ├── azureDevOps.js     # ADO Wiki and work items
│   ├── engineeringHub.js  # Mock engineering docs
│   └── microsoftGraph.js  # Teams/Graph API
├── bot/                   # Teams bot implementation
│   ├── index.js          # Bot adapter setup
│   └── teamsBot.js       # Bot conversation logic
├── public/               # Web UI files
│   ├── index.html        # Main web interface
│   └── widget.html       # Embeddable widget
├── routes/               # Express routes
│   ├── api.js           # API endpoints
│   └── web.js           # Web routes
├── services/             # Core business logic
│   ├── ragPipeline.js   # Main RAG orchestration
│   └── vectorSearch.js  # Azure Search integration
└── index.js             # Express server setup
```

## 🔧 API Endpoints

- `POST /api/ask` - Ask a natural language question
- `POST /api/search` - Search across all sources
- `GET /api/sources` - List available data sources
- `GET /api/health` - Service health check
- `POST /api/messages` - Teams bot webhook

## 🤝 Contributing

This is a hackathon project! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎉 Hackathon Notes

This project was built for [Hackathon Name] with the goal of demonstrating how AI can help knowledge workers quickly find information across their digital workspace. 

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
- Mobile app for on-the-go access