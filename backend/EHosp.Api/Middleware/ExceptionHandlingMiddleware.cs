using System.Net;
using System.Text.Json;

namespace EHosp.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            // Create a consistent response object
            object response;

            switch (exception)
            {
                case ArgumentException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = new
                    {
                        Message = exception.Message,
                        Detailed = _env.IsDevelopment() ? exception.Message : null,
                        StackTrace = _env.IsDevelopment() ? exception.StackTrace : null
                    };
                    break;
                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response = new
                    {
                        Message = "The requested resource was not found",
                        Detailed = _env.IsDevelopment() ? exception.Message : null,
                        StackTrace = _env.IsDevelopment() ? exception.StackTrace : null
                    };
                    break;
                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response = new
                    {
                        Message = "Access denied",
                        Detailed = _env.IsDevelopment() ? exception.Message : null,
                        StackTrace = _env.IsDevelopment() ? exception.StackTrace : null
                    };
                    break;
                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response = new
                    {
                        Message = "An error occurred while processing your request",
                        Detailed = _env.IsDevelopment() ? exception.Message : null,
                        StackTrace = _env.IsDevelopment() ? exception.StackTrace : null
                    };
                    break;
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(response, options);

            return context.Response.WriteAsync(json);
        }
    }
}