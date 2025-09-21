using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ToeicGenius.Domains.DTOs.Common;

namespace ToeicGenius.Filters
{
	public class ValidateModelAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			if (!context.ModelState.IsValid)
			{
				// gom lỗi thành dictionary { fieldName: [errors...] }
				var errors = context.ModelState
					.Where(x => x.Value!.Errors.Count > 0)
					.ToDictionary(
						kvp => kvp.Key,
						kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
					);

				var response = ApiResponse<object>.ErrorResponse(
					data: errors,
					message: "Validation failed",
					statusCode: 400
				);

				context.Result = new BadRequestObjectResult(response);
			}
		}
	}
}
