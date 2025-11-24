using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Shared.Validators
{
	public static class OptionValidator
	{
		public static (bool IsValid, string ErrorMessage) IsValid(List<Option> options, int quantityOptions)
		{
			// Kiểm tra số lượng đáp án
			if (options.Count != quantityOptions)
			{
				return (false, $"Số lượng đáp án phải đúng bằng {quantityOptions}.");
			}

			// Kiểm tra ít nhất một đáp án đúng
			if (!options.Any(opt => opt.IsCorrect) || options.Where(opt => opt.IsCorrect == true).Count() != 1)
			{
				return (false, "Cần có duy nhất một đáp án đúng.");
			}
			
			// Kiểm tra tính duy nhất của Label và OptionOrder
			var labels = options.Select(opt => opt.Label).ToList();
			if (labels.Distinct().Count() != labels.Count)
			{
				return (false, "Các nhãn (label) của đáp án phải là duy nhất, không được trùng nhau.");
			}

			return (true, string.Empty);
		}
	}
}
