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
				return (false, $"Answer options must have {quantityOptions} items.");
			}

			// Kiểm tra ít nhất một đáp án đúng
			if (!options.Any(opt => opt.IsCorrect))
			{
				return (false, "Only one answer option must be marked as correct.");
			}

			// Kiểm tra tính duy nhất của Label và OptionOrder
			var labels = options.Select(opt => opt.Label).ToList();
			if (labels.Distinct().Count() != labels.Count)
			{
				return (false, "Answer option labels must be unique.");
			}

			return (true, string.Empty);
		}

	}
}
