using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Question
{
    public class QuestionResponseDto
    {
        public int QuestionId { get; set; }

        public int QuestionTypeId { get; set; }
        public string QuestionTypeName { get; set; } = null!;
        public int PartId { get; set; }
        public string PartName { get; set; } = null!;

        public string? Content { get; set; }
        public int Number { get; set; }

        public List<OptionDto> Options { get; set; } = new();
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Solution { get; set; }
        public CommonStatus Status{ get; set; }
    }

    public class OptionDto
    {
        public int OptionId { get; set; }
        public string Content { get; set; } = null!;
        public string Label { get; set; } = null!;
        public bool IsCorrect { get; set; }
    }
}
