using Microsoft.SemanticKernel;
using System.Diagnostics;

namespace OneAskAgent.Services
{
    public class FunctionInvocationFilter : IFunctionInvocationFilter
    {
        public async Task OnFunctionInvocationAsync(FunctionInvocationContext context, Func<FunctionInvocationContext, Task> next)
        {
            var stopwatch = Stopwatch.StartNew();
            var functionName = $"{context.Function.PluginName}.{context.Function.Name}";

            Console.WriteLine($"[FUNCTION CALL] Invoking: {functionName}");

            if (context.Arguments.Count > 0)
            {
                var args = string.Join(", ", context.Arguments.Select(kvp => $"{kvp.Key}: {kvp.Value?.ToString()?.Substring(0, Math.Min(100, kvp.Value.ToString()?.Length ?? 0))}..."));
                Console.WriteLine($"[FUNCTION ARGS] Arguments: {args}");
            }

            try
            {
                await next(context);

                stopwatch.Stop();
                Console.WriteLine($"[FUNCTION RESULT] Completed: {functionName} in {stopwatch.ElapsedMilliseconds}ms");

                if (context.Result != null)
                {
                    var resultStr = context.Result.ToString();
                    var truncatedResult = resultStr?.Length > 200 ? resultStr.Substring(0, 200) + "..." : resultStr;
                    Console.WriteLine($"[FUNCTION OUTPUT] Result: {truncatedResult}");
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                Console.WriteLine($"[FUNCTION ERROR] Failed: {functionName} in {stopwatch.ElapsedMilliseconds}ms - {ex.Message}");
                throw;
            }
        }
    }
}