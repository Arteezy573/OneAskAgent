using Microsoft.AspNetCore.Mvc;
using OneAskAgent.Configuration;
using System.Text.Json;

namespace OneAskAgent.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly OneAskAgent _oneAskAgent;
        private readonly ILogger<ChatController> _logger;

        public ChatController(OneAskAgent oneAskAgent, ILogger<ChatController> logger)
        {
            _oneAskAgent = oneAskAgent;
            _logger = logger;
        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
        {
            try
            {
                _logger.LogInformation($"Received chat message: {request.Message}");

                if (string.IsNullOrEmpty(request.Message))
                {
                    return BadRequest("Message cannot be empty");
                }

                var response = await _oneAskAgent.ProcessQueryAsync(request.Message, request.UserId);

                return Ok(new ChatMessageResponse
                {
                    Response = response,
                    Timestamp = DateTime.UtcNow,
                    Status = "success"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error processing chat message: {ex.Message}");
                return StatusCode(500, new ChatMessageResponse
                {
                    Response = "I'm sorry, I encountered an error while processing your request. Please try again.",
                    Timestamp = DateTime.UtcNow,
                    Status = "error",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] AskQuestionRequest request)
        {
            try
            {
                _logger.LogInformation($"Received question: {request.Question}");

                if (string.IsNullOrEmpty(request.Question))
                {
                    return BadRequest("Question cannot be empty");
                }

                var response = await _oneAskAgent.ProcessQueryAsync(request.Question, request.UserId);

                return Ok(new AskQuestionResponse
                {
                    Answer = response,
                    Question = request.Question,
                    Timestamp = DateTime.UtcNow,
                    UserId = request.UserId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error processing question: {ex.Message}");
                return StatusCode(500, new AskQuestionResponse
                {
                    Answer = "I'm sorry, I encountered an error while processing your question. Please try again.",
                    Question = request.Question,
                    Timestamp = DateTime.UtcNow,
                    UserId = request.UserId,
                    Error = ex.Message
                });
            }
        }

        [HttpPost("clear-history")]
        public IActionResult ClearHistory()
        {
            try
            {
                _oneAskAgent.ClearConversationHistory();
                return Ok(new { message = "Conversation history cleared successfully", timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error clearing history: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                service = "OneAsk Agent",
                version = "1.0.0",
                timestamp = DateTime.UtcNow,
                features = new[]
                {
                    "Azure DevOps Integration",
                    "Microsoft Graph Integration",
                    "Engineering Hub Search",
                    "Vector Search",
                    "Conversational AI"
                }
            });
        }
    }

    // Request/Response models
    public class ChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; }
    }

    public class ChatMessageResponse
    {
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Error { get; set; }
    }

    public class AskQuestionRequest
    {
        public string Question { get; set; } = string.Empty;
        public string? UserId { get; set; }
    }

    public class AskQuestionResponse
    {
        public string Answer { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? UserId { get; set; }
        public string? Error { get; set; }
    }
}