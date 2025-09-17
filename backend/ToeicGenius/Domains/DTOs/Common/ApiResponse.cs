namespace ToeicGenius.Domains.DTOs.Common
{
	public class ApiResponse<T>
	{
		public int StatusCode { get; set; } = 200;
		public string Message { get; set; } = string.Empty;

		//  Data (dữ liệu trả về, có thể null)
		public T? Data { get; set; }
		public bool Success => StatusCode >= 200 && StatusCode < 300;

		public ApiResponse() { }

		public ApiResponse(int statusCode, string message, T? data = default)
		{
			StatusCode = statusCode;
			Message = message;
			Data = data;
		}

		// Success 
		public static ApiResponse<T> SuccessResponse(T data, string message = "Success", int statusCode = 200)
		{
			return new ApiResponse<T>
			{
				StatusCode = statusCode,
				Message = message,
				Data = data
			};
		}

		// Error 
		public static ApiResponse<T> ErrorResponse(string message, int statusCode = 400, T? data = default)
		{
			return new ApiResponse<T>
			{
				StatusCode = statusCode,
				Message = message,
				Data = data
			};
		}

		// Not Found
		public static ApiResponse<T> NotFoundResponse(string message = "Resource not found")
		{
			return ErrorResponse(message, 404);
		}

		// Forbidden
		public static ApiResponse<T> ForbiddenResponse(string message = "Access denied")
		{
			return ErrorResponse(message, 403);
		}

		// Unauthorized
		public static ApiResponse<T> UnauthorizedResponse(string message = "Unauthorized")
		{
			return ErrorResponse(message, 401);
		}

		// Server Error
		public static ApiResponse<T> ServerErrorResponse(string message = "Internal server error")
		{
			return ErrorResponse(message, 500);
		}


	}
}
