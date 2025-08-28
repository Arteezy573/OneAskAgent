const { TeamsActivityHandler, MessageFactory } = require('botbuilder');
const RAGPipeline = require('../services/ragPipeline');

class TeamsBot extends TeamsActivityHandler {
    constructor() {
        super();
        this.ragPipeline = new RAGPipeline();
        this.isInitialized = false;

        this.onMessage(async (context, next) => {
            await this.handleMessage(context);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const welcomeText = `👋 Hi! I'm OneAsk, your personal knowledge agent. I can help you find information across your Microsoft workspace including Teams messages, Azure DevOps wikis, and Engineering Hub documentation.

Try asking me something like:
• "What's the latest on Project Bonica?"
• "Where is the onboarding doc for EDT?"
• "Show me API design standards"

Just @mention me or send me a direct message!`;

            for (let member of context.activity.membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const welcomeMessage = MessageFactory.text(welcomeText);
                    await context.sendActivity(welcomeMessage);
                }
            }
            await next();
        });

        this.initialize();
    }

    async initialize() {
        try {
            this.isInitialized = await this.ragPipeline.initialize();
            console.log('Teams bot initialized:', this.isInitialized);
        } catch (error) {
            console.error('Failed to initialize Teams bot:', error);
        }
    }

    async handleMessage(context) {
        try {
            const userMessage = context.activity.text?.trim();
            
            if (!userMessage) return;

            // Handle help commands
            if (userMessage.toLowerCase().includes('help') || userMessage === '?') {
                await this.sendHelpMessage(context);
                return;
            }

            // Handle health check
            if (userMessage.toLowerCase().includes('health') || userMessage.toLowerCase().includes('status')) {
                await this.sendHealthMessage(context);
                return;
            }

            // Show typing indicator
            await context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 1000 }
            ]);

            if (!this.isInitialized) {
                const errorMessage = MessageFactory.text("⚠️ I'm still starting up. Please try again in a moment.");
                await context.sendActivity(errorMessage);
                return;
            }

            // Extract user ID for personalization
            const userId = context.activity.from?.aadObjectId || context.activity.from?.id || 'unknown';

            // Process the query
            const result = await this.ragPipeline.processQuery(userMessage, userId);

            if (result.sources && result.sources.length > 0) {
                await this.sendAnswerWithSources(context, result);
            } else {
                await this.sendNoResultsMessage(context, userMessage);
            }

        } catch (error) {
            console.error('Error handling message:', error);
            const errorMessage = MessageFactory.text("❌ Sorry, I encountered an error processing your request. Please try again.");
            await context.sendActivity(errorMessage);
        }
    }

    async sendAnswerWithSources(context, result) {
        // Main answer
        const answerText = `${result.answer}

**Confidence:** ${result.confidence}%`;

        await context.sendActivity(MessageFactory.text(answerText));

        // Sources as adaptive card or simple text
        if (result.sources.length > 0) {
            let sourcesText = "**📚 Sources:**\n";
            result.sources.forEach((source, index) => {
                const date = source.timestamp ? new Date(source.timestamp).toLocaleDateString() : 'Unknown date';
                const author = source.author || 'Unknown author';
                sourcesText += `${index + 1}. **${source.title}** (${source.source})\n`;
                sourcesText += `   📝 ${author} • ${date}\n`;
                if (source.url) {
                    sourcesText += `   🔗 [View Source](${source.url})\n`;
                }
                sourcesText += "\n";
            });

            await context.sendActivity(MessageFactory.text(sourcesText));
        }
    }

    async sendNoResultsMessage(context, query) {
        const noResultsText = `🔍 I couldn't find any relevant information for "${query}".

Here are some tips:
• Try rephrasing your question
• Use keywords from your documentation
• Check if you have access to the relevant resources
• Ask about specific projects, tools, or processes

Type "help" to see example questions I can answer.`;

        await context.sendActivity(MessageFactory.text(noResultsText));
    }

    async sendHelpMessage(context) {
        const helpText = `🤖 **OneAsk Help**

I can search across your Microsoft workspace to find information from:
• 💬 Teams messages and channels
• 📚 Azure DevOps Wiki pages  
• 📋 ADO work items and tasks
• 📖 Engineering Hub documentation

**Example questions:**
• "What's the latest on Project Bonica?"
• "Where is the onboarding guide for EDT?"
• "Show me deployment best practices"
• "Find API design standards"
• "What are the current sprint goals?"

**Commands:**
• "help" - Show this message
• "status" - Check my health status

Just @mention me in any channel or send me a direct message!`;

        await context.sendActivity(MessageFactory.text(helpText));
    }

    async sendHealthMessage(context) {
        const healthText = `🔧 **OneAsk Status**

✅ Bot: Running
${this.isInitialized ? '✅' : '❌'} RAG Pipeline: ${this.isInitialized ? 'Ready' : 'Starting up...'}
✅ Search Services: Connected
✅ API Endpoints: Available

Last updated: ${new Date().toLocaleString()}`;

        await context.sendActivity(MessageFactory.text(healthText));
    }
}

module.exports = TeamsBot;