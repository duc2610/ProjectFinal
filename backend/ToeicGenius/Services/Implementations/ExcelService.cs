using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations;

public class ExcelService : IExcelService
{
    private readonly IFileService _fileService;

    public ExcelService(IFileService fileService)
    {
        _fileService = fileService;
        // Set EPPlus license context
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public async Task<Result<CreateTestManualDto>> ParseExcelToTestAsync(IFormFile excelFile)
    {
        try
        {
            // Validate file
            if (excelFile == null || excelFile.Length == 0)
                return Result<CreateTestManualDto>.Failure("Excel file is required");

            if (!excelFile.FileName.EndsWith(".xlsx") && !excelFile.FileName.EndsWith(".xls"))
                return Result<CreateTestManualDto>.Failure("File must be Excel format (.xlsx or .xls)");

            using var stream = new MemoryStream();
            await excelFile.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);

            // Validate required sheets
            var requiredSheets = new[] { "TestInfo", "Part1", "Part2", "Part3", "Part4", "Part5", "Part6", "Part7" };
            foreach (var sheetName in requiredSheets)
            {
                if (package.Workbook.Worksheets[sheetName] == null)
                    return Result<CreateTestManualDto>.Failure($"Missing required sheet: {sheetName}");
            }

            // Parse Test Info
            var testInfoSheet = package.Workbook.Worksheets["TestInfo"];
            var testDto = new CreateTestManualDto
            {
                Title = testInfoSheet.Cells["B2"].Text,
                Description = testInfoSheet.Cells["B3"].Text,
                AudioUrl = null, // Will be set by controller after uploading audio file
                TestType = TestType.Simulator,
                TestSkill = TestSkill.LR,
                Parts = new List<PartDto>()
            };

            // Validate test info
            if (string.IsNullOrWhiteSpace(testDto.Title))
                return Result<CreateTestManualDto>.Failure("Test title is required (Cell B2 in TestInfo sheet)");

            // Parse Part 1 (6 questions with images, 4 options)
            var part1Result = await ParsePart1(package.Workbook.Worksheets["Part1"]);
            if (!part1Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part1Result.ErrorMessage!);
            testDto.Parts.Add(part1Result.Data);

            // Parse Part 2 (25 questions, 3 options)
            var part2Result = ParsePart2(package.Workbook.Worksheets["Part2"]);
            if (!part2Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part2Result.ErrorMessage!);
            testDto.Parts.Add(part2Result.Data);

            // Parse Part 3 (13 groups, each with 3 questions)
            var part3Result = ParsePart3(package.Workbook.Worksheets["Part3"]);
            if (!part3Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part3Result.ErrorMessage!);
            testDto.Parts.Add(part3Result.Data);

            // Parse Part 4 (10 groups, each with 3 questions)
            var part4Result = ParsePart4(package.Workbook.Worksheets["Part4"]);
            if (!part4Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part4Result.ErrorMessage!);
            testDto.Parts.Add(part4Result.Data);

            // Parse Part 5 (30 questions, 4 options)
            var part5Result = ParsePart5(package.Workbook.Worksheets["Part5"]);
            if (!part5Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part5Result.ErrorMessage!);
            testDto.Parts.Add(part5Result.Data);

            // Parse Part 6 (4 groups, each with 4 questions)
            var part6Result = ParsePart6(package.Workbook.Worksheets["Part6"]);
            if (!part6Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part6Result.ErrorMessage!);
            testDto.Parts.Add(part6Result.Data);

            // Parse Part 7 (12 groups with varying questions)
            var part7Result = ParsePart7(package.Workbook.Worksheets["Part7"]);
            if (!part7Result.IsSuccess)
                return Result<CreateTestManualDto>.Failure(part7Result.ErrorMessage!);
            testDto.Parts.Add(part7Result.Data);

            // Validate total questions
            int totalQuestions = testDto.Parts.Sum(p =>
                (p.Questions?.Count ?? 0) +
                (p.Groups?.Sum(g => g.Questions.Count) ?? 0));

            if (totalQuestions != 200)
                return Result<CreateTestManualDto>.Failure($"Total questions must be 200, found {totalQuestions}");

            return Result<CreateTestManualDto>.Success(testDto);
        }
        catch (Exception ex)
        {
            return Result<CreateTestManualDto>.Failure($"Error parsing Excel file: {ex.Message}");
        }
    }

    private async Task<Result<PartDto>> ParsePart1(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3; // Data starts at row 3

            for (int i = 0; i < 6; i++)
            {
                int row = startRow + i;

                // Extract and upload embedded image from Column C
                var imageUrl = await ExtractAndUploadImageAsync(worksheet, row, 3);

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B
                    ImageUrl = imageUrl, // Uploaded cloud URL
                    Explanation = worksheet.Cells[row, 8].Text, // Column H
                    Options = new List<OptionRequestDto>
                    {
                        new() { Label = "A", Content = worksheet.Cells[row, 4].Text, IsCorrect = worksheet.Cells[row, 4].Text == worksheet.Cells[row, 9].Text },
                        new() { Label = "B", Content = worksheet.Cells[row, 5].Text, IsCorrect = worksheet.Cells[row, 5].Text == worksheet.Cells[row, 9].Text },
                        new() { Label = "C", Content = worksheet.Cells[row, 6].Text, IsCorrect = worksheet.Cells[row, 6].Text == worksheet.Cells[row, 9].Text },
                        new() { Label = "D", Content = worksheet.Cells[row, 7].Text, IsCorrect = worksheet.Cells[row, 7].Text == worksheet.Cells[row, 9].Text }
                    }
                };

                // Validate
                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 1 - Question {i + 1}: Content is required (Row {row}, Column B)");

                if (string.IsNullOrWhiteSpace(question.ImageUrl))
                    return Result<PartDto>.Failure($"Part 1 - Question {i + 1}: Image is required (Row {row}, Column C). Please embed an image in this cell.");

                if (!question.Options.Any(o => o.IsCorrect))
                    return Result<PartDto>.Failure($"Part 1 - Question {i + 1}: Must have exactly one correct answer (Row {row})");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 1,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 1: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart2(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            for (int i = 0; i < 25; i++)
            {
                int row = startRow + i;

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text,
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 6].Text,
                    Options = new List<OptionRequestDto>
                    {
                        new() { Label = "A", Content = worksheet.Cells[row, 3].Text, IsCorrect = worksheet.Cells[row, 3].Text == worksheet.Cells[row, 7].Text },
                        new() { Label = "B", Content = worksheet.Cells[row, 4].Text, IsCorrect = worksheet.Cells[row, 4].Text == worksheet.Cells[row, 7].Text },
                        new() { Label = "C", Content = worksheet.Cells[row, 5].Text, IsCorrect = worksheet.Cells[row, 5].Text == worksheet.Cells[row, 7].Text }
                    }
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 2 - Question {i + 1}: Content is required (Row {row}, Column B)");

                if (!question.Options.Any(o => o.IsCorrect))
                    return Result<PartDto>.Failure($"Part 2 - Question {i + 1}: Must have exactly one correct answer (Row {row})");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 2,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 2: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart3(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int startRow = 3;

            for (int g = 0; g < 13; g++)
            {
                int groupStartRow = startRow + (g * 4); // Each group takes 4 rows (1 passage + 3 questions)

                var group = new QuestionGroupDto
                {
                    Passage = worksheet.Cells[groupStartRow, 2].Text,
                    ImageUrl = worksheet.Cells[groupStartRow, 3].Text,
                    Questions = new List<QuestionDto>()
                };

                if (string.IsNullOrWhiteSpace(group.Passage))
                    return Result<PartDto>.Failure($"Part 3 - Group {g + 1}: Passage is required (Row {groupStartRow}, Column B)");

                // Parse 3 questions for this group
                for (int q = 0; q < 3; q++)
                {
                    int qRow = groupStartRow + q + 1;

                    var question = new QuestionDto
                    {
                        Content = worksheet.Cells[qRow, 4].Text,
                        ImageUrl = worksheet.Cells[qRow, 5].Text,
                        Explanation = worksheet.Cells[qRow, 10].Text,
                        Options = new List<OptionRequestDto>
                        {
                            new() { Label = "A", Content = worksheet.Cells[qRow, 6].Text, IsCorrect = worksheet.Cells[qRow, 6].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "B", Content = worksheet.Cells[qRow, 7].Text, IsCorrect = worksheet.Cells[qRow, 7].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "C", Content = worksheet.Cells[qRow, 8].Text, IsCorrect = worksheet.Cells[qRow, 8].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "D", Content = worksheet.Cells[qRow, 9].Text, IsCorrect = worksheet.Cells[qRow, 9].Text == worksheet.Cells[qRow, 11].Text }
                        }
                    };

                    if (string.IsNullOrWhiteSpace(question.Content))
                        return Result<PartDto>.Failure($"Part 3 - Group {g + 1}, Question {q + 1}: Content is required (Row {qRow}, Column D)");

                    if (!question.Options.Any(o => o.IsCorrect))
                        return Result<PartDto>.Failure($"Part 3 - Group {g + 1}, Question {q + 1}: Must have exactly one correct answer (Row {qRow})");

                    group.Questions.Add(question);
                }

                groups.Add(group);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 3,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 3: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart4(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int startRow = 3;

            for (int g = 0; g < 10; g++)
            {
                int groupStartRow = startRow + (g * 4);

                var group = new QuestionGroupDto
                {
                    Passage = worksheet.Cells[groupStartRow, 2].Text,
                    ImageUrl = worksheet.Cells[groupStartRow, 3].Text,
                    Questions = new List<QuestionDto>()
                };

                if (string.IsNullOrWhiteSpace(group.Passage))
                    return Result<PartDto>.Failure($"Part 4 - Group {g + 1}: Passage is required (Row {groupStartRow}, Column B)");

                for (int q = 0; q < 3; q++)
                {
                    int qRow = groupStartRow + q + 1;

                    var question = new QuestionDto
                    {
                        Content = worksheet.Cells[qRow, 4].Text,
                        ImageUrl = worksheet.Cells[qRow, 5].Text,
                        Explanation = worksheet.Cells[qRow, 10].Text,
                        Options = new List<OptionRequestDto>
                        {
                            new() { Label = "A", Content = worksheet.Cells[qRow, 6].Text, IsCorrect = worksheet.Cells[qRow, 6].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "B", Content = worksheet.Cells[qRow, 7].Text, IsCorrect = worksheet.Cells[qRow, 7].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "C", Content = worksheet.Cells[qRow, 8].Text, IsCorrect = worksheet.Cells[qRow, 8].Text == worksheet.Cells[qRow, 11].Text },
                            new() { Label = "D", Content = worksheet.Cells[qRow, 9].Text, IsCorrect = worksheet.Cells[qRow, 9].Text == worksheet.Cells[qRow, 11].Text }
                        }
                    };

                    if (string.IsNullOrWhiteSpace(question.Content))
                        return Result<PartDto>.Failure($"Part 4 - Group {g + 1}, Question {q + 1}: Content is required (Row {qRow}, Column D)");

                    if (!question.Options.Any(o => o.IsCorrect))
                        return Result<PartDto>.Failure($"Part 4 - Group {g + 1}, Question {q + 1}: Must have exactly one correct answer (Row {qRow})");

                    group.Questions.Add(question);
                }

                groups.Add(group);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 4,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 4: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart5(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            for (int i = 0; i < 30; i++)
            {
                int row = startRow + i;

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text,
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 7].Text,
                    Options = new List<OptionRequestDto>
                    {
                        new() { Label = "A", Content = worksheet.Cells[row, 3].Text, IsCorrect = worksheet.Cells[row, 3].Text == worksheet.Cells[row, 8].Text },
                        new() { Label = "B", Content = worksheet.Cells[row, 4].Text, IsCorrect = worksheet.Cells[row, 4].Text == worksheet.Cells[row, 8].Text },
                        new() { Label = "C", Content = worksheet.Cells[row, 5].Text, IsCorrect = worksheet.Cells[row, 5].Text == worksheet.Cells[row, 8].Text },
                        new() { Label = "D", Content = worksheet.Cells[row, 6].Text, IsCorrect = worksheet.Cells[row, 6].Text == worksheet.Cells[row, 8].Text }
                    }
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 5 - Question {i + 1}: Content is required (Row {row}, Column B)");

                if (!question.Options.Any(o => o.IsCorrect))
                    return Result<PartDto>.Failure($"Part 5 - Question {i + 1}: Must have exactly one correct answer (Row {row})");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 5,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 5: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart6(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int startRow = 3;

            for (int g = 0; g < 4; g++)
            {
                int groupStartRow = startRow + (g * 5); // Each group: 1 passage + 4 questions

                var group = new QuestionGroupDto
                {
                    Passage = worksheet.Cells[groupStartRow, 2].Text,
                    ImageUrl = worksheet.Cells[groupStartRow, 3].Text,
                    Questions = new List<QuestionDto>()
                };

                if (string.IsNullOrWhiteSpace(group.Passage))
                    return Result<PartDto>.Failure($"Part 6 - Group {g + 1}: Passage is required (Row {groupStartRow}, Column B)");

                for (int q = 0; q < 4; q++)
                {
                    int qRow = groupStartRow + q + 1;

                    var question = new QuestionDto
                    {
                        Content = worksheet.Cells[qRow, 4].Text,
                        ImageUrl = null,
                        Explanation = worksheet.Cells[qRow, 9].Text,
                        Options = new List<OptionRequestDto>
                        {
                            new() { Label = "A", Content = worksheet.Cells[qRow, 5].Text, IsCorrect = worksheet.Cells[qRow, 5].Text == worksheet.Cells[qRow, 10].Text },
                            new() { Label = "B", Content = worksheet.Cells[qRow, 6].Text, IsCorrect = worksheet.Cells[qRow, 6].Text == worksheet.Cells[qRow, 10].Text },
                            new() { Label = "C", Content = worksheet.Cells[qRow, 7].Text, IsCorrect = worksheet.Cells[qRow, 7].Text == worksheet.Cells[qRow, 10].Text },
                            new() { Label = "D", Content = worksheet.Cells[qRow, 8].Text, IsCorrect = worksheet.Cells[qRow, 8].Text == worksheet.Cells[qRow, 10].Text }
                        }
                    };

                    if (string.IsNullOrWhiteSpace(question.Content))
                        return Result<PartDto>.Failure($"Part 6 - Group {g + 1}, Question {q + 1}: Content is required (Row {qRow}, Column D)");

                    if (!question.Options.Any(o => o.IsCorrect))
                        return Result<PartDto>.Failure($"Part 6 - Group {g + 1}, Question {q + 1}: Must have exactly one correct answer (Row {qRow})");

                    group.Questions.Add(question);
                }

                groups.Add(group);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 6,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 6: {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart7(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int currentRow = 3;

            // Part 7 structure: 12 groups with varying questions
            // Single passages: 4 questions each (first 6 groups)
            // Double/Triple passages: 5 questions each (last 6 groups)
            var groupQuestionCounts = new[] { 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5 }; // Total = 12 groups, 54 questions (24+30=54)

            for (int g = 0; g < 12; g++)
            {
                int questionsInGroup = groupQuestionCounts[g];

                var group = new QuestionGroupDto
                {
                    Passage = worksheet.Cells[currentRow, 2].Text,
                    ImageUrl = worksheet.Cells[currentRow, 3].Text,
                    Questions = new List<QuestionDto>()
                };

                if (string.IsNullOrWhiteSpace(group.Passage))
                    return Result<PartDto>.Failure($"Part 7 - Group {g + 1}: Passage is required (Row {currentRow}, Column B)");

                currentRow++; // Move to first question

                for (int q = 0; q < questionsInGroup; q++)
                {
                    var question = new QuestionDto
                    {
                        Content = worksheet.Cells[currentRow, 4].Text,
                        ImageUrl = worksheet.Cells[currentRow, 5].Text,
                        Explanation = worksheet.Cells[currentRow, 10].Text,
                        Options = new List<OptionRequestDto>
                        {
                            new() { Label = "A", Content = worksheet.Cells[currentRow, 6].Text, IsCorrect = worksheet.Cells[currentRow, 6].Text == worksheet.Cells[currentRow, 11].Text },
                            new() { Label = "B", Content = worksheet.Cells[currentRow, 7].Text, IsCorrect = worksheet.Cells[currentRow, 7].Text == worksheet.Cells[currentRow, 11].Text },
                            new() { Label = "C", Content = worksheet.Cells[currentRow, 8].Text, IsCorrect = worksheet.Cells[currentRow, 8].Text == worksheet.Cells[currentRow, 11].Text },
                            new() { Label = "D", Content = worksheet.Cells[currentRow, 9].Text, IsCorrect = worksheet.Cells[currentRow, 9].Text == worksheet.Cells[currentRow, 11].Text }
                        }
                    };

                    if (string.IsNullOrWhiteSpace(question.Content))
                        return Result<PartDto>.Failure($"Part 7 - Group {g + 1}, Question {q + 1}: Content is required (Row {currentRow}, Column D)");

                    if (!question.Options.Any(o => o.IsCorrect))
                        return Result<PartDto>.Failure($"Part 7 - Group {g + 1}, Question {q + 1}: Must have exactly one correct answer (Row {currentRow})");

                    group.Questions.Add(question);
                    currentRow++;
                }

                groups.Add(group);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 7,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 7: {ex.Message}");
        }
    }

    private async Task<Result<PartDto>> ParsePart8Writing(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            for (int i = 0; i < 5; i++)
            {
                int row = startRow + i;

                // Extract and upload embedded image from Column C
                var imageUrl = await ExtractAndUploadImageAsync(worksheet, row, 3);

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B
                    ImageUrl = imageUrl, // Uploaded cloud URL
                    Explanation = worksheet.Cells[row, 4].Text, // Column D - Sample answer
                    Options = new List<OptionRequestDto>() // No options for writing
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 8 (Writing) - Question {i + 1}: Content is required (Row {row}, Column B)");

                if (string.IsNullOrWhiteSpace(question.ImageUrl))
                    return Result<PartDto>.Failure($"Part 8 (Writing) - Question {i + 1}: Image is required (Row {row}, Column C). Please embed an image in this cell.");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 8,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 8 (Writing): {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart9Writing(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            for (int i = 0; i < 2; i++)
            {
                int row = startRow + i;

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B - Email/request content
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 3].Text, // Column C - Sample response
                    Options = new List<OptionRequestDto>()
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 9 (Writing) - Question {i + 1}: Content is required (Row {row}, Column B)");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 9,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 9 (Writing): {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart10Writing(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int row = 3;

            var question = new QuestionDto
            {
                Content = worksheet.Cells[row, 2].Text, // Column B - Essay prompt
                ImageUrl = null,
                Explanation = worksheet.Cells[row, 3].Text, // Column C - Sample essay
                Options = new List<OptionRequestDto>()
            };

            if (string.IsNullOrWhiteSpace(question.Content))
                return Result<PartDto>.Failure($"Part 10 (Writing) - Essay prompt is required (Row {row}, Column B)");

            questions.Add(question);

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 10,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 10 (Writing): {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart11Speaking(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            for (int i = 0; i < 2; i++)
            {
                int row = startRow + i;

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B - Text to read aloud
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 3].Text, // Column C - Notes/Tips
                    Options = new List<OptionRequestDto>()
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 11 (Speaking) - Question {i + 1}: Content is required (Row {row}, Column B)");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 11,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 11 (Speaking): {ex.Message}");
        }
    }

    private async Task<Result<PartDto>> ParsePart12Speaking(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3;

            // Part 12 has 2 describe picture questions
            for (int i = 0; i < 2; i++)
            {
                int row = startRow + i;

                // Extract and upload embedded image from Column C
                var imageUrl = await ExtractAndUploadImageAsync(worksheet, row, 3);

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B - Instruction
                    ImageUrl = imageUrl, // Uploaded cloud URL
                    Explanation = worksheet.Cells[row, 4].Text, // Column D - Sample description
                    Options = new List<OptionRequestDto>()
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 12 (Speaking) - Question {i + 1}: Content is required (Row {row}, Column B)");

                if (string.IsNullOrWhiteSpace(question.ImageUrl))
                    return Result<PartDto>.Failure($"Part 12 (Speaking) - Question {i + 1}: Image is required (Row {row}, Column C). Please embed an image in this cell.");

                questions.Add(question);
            }

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 12,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 12 (Speaking): {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart13Speaking(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int row = 3;

            // Part 13 has 1 group with introduction/context and 3 questions
            var group = new QuestionGroupDto
            {
                Passage = worksheet.Cells[row, 2].Text, // Column B - Introduction/Context
                ImageUrl = null,
                Questions = new List<QuestionDto>()
            };

            if (string.IsNullOrWhiteSpace(group.Passage))
                return Result<PartDto>.Failure($"Part 13 (Speaking) - Introduction/Context is required (Row {row}, Column B)");

            row++; // Move to first question

            for (int q = 0; q < 3; q++)
            {
                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text,
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 3].Text,
                    Options = new List<OptionRequestDto>()
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 13 (Speaking) - Question {q + 1}: Content is required (Row {row}, Column B)");

                group.Questions.Add(question);
                row++;
            }

            groups.Add(group);

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 13,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 13 (Speaking): {ex.Message}");
        }
    }

    private async Task<Result<PartDto>> ParsePart14Speaking(ExcelWorksheet worksheet)
    {
        try
        {
            var groups = new List<QuestionGroupDto>();
            int row = 3;

            // Extract and upload embedded image from Column C (optional)
            var imageUrl = await ExtractAndUploadImageAsync(worksheet, row, 3);

            // Part 14 has 1 group with passage/schedule and 3 questions
            var group = new QuestionGroupDto
            {
                Passage = worksheet.Cells[row, 2].Text, // Column B - Schedule/Info
                ImageUrl = imageUrl, // Uploaded cloud URL (optional)
                Questions = new List<QuestionDto>()
            };

            if (string.IsNullOrWhiteSpace(group.Passage))
                return Result<PartDto>.Failure($"Part 14 (Speaking) - Passage/Schedule is required (Row {row}, Column B)");

            row++; // Move to first question

            for (int q = 0; q < 3; q++)
            {
                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text,
                    ImageUrl = null,
                    Explanation = worksheet.Cells[row, 3].Text,
                    Options = new List<OptionRequestDto>()
                };

                if (string.IsNullOrWhiteSpace(question.Content))
                    return Result<PartDto>.Failure($"Part 14 (Speaking) - Question {q + 1}: Content is required (Row {row}, Column B)");

                group.Questions.Add(question);
                row++;
            }

            groups.Add(group);

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 14,
                Questions = new List<QuestionDto>(),
                Groups = groups
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 14 (Speaking): {ex.Message}");
        }
    }

    private Result<PartDto> ParsePart15Speaking(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int row = 3;

            // Part 15 has 1 express opinion question
            var question = new QuestionDto
            {
                Content = worksheet.Cells[row, 2].Text, // Column B - Opinion question
                ImageUrl = null,
                Explanation = worksheet.Cells[row, 3].Text, // Column C - Sample response
                Options = new List<OptionRequestDto>()
            };

            if (string.IsNullOrWhiteSpace(question.Content))
                return Result<PartDto>.Failure($"Part 15 (Speaking) - Content is required (Row {row}, Column B)");

            questions.Add(question);

            return Result<PartDto>.Success(new PartDto
            {
                PartId = 15,
                Questions = questions,
                Groups = new List<QuestionGroupDto>()
            });
        }
        catch (Exception ex)
        {
            return Result<PartDto>.Failure($"Error parsing Part 15 (Speaking): {ex.Message}");
        }
    }

    public async Task<Result<byte[]>> GenerateTemplateAsync()
    {
        try
        {
            using var package = new ExcelPackage();

            // Create TestInfo Sheet
            CreateTestInfoSheet(package);

            // Create Part 1 Sheet
            CreatePart1Sheet(package);

            // Create Part 2 Sheet
            CreatePart2Sheet(package);

            // Create Part 3 Sheet
            CreatePart3Sheet(package);

            // Create Part 4 Sheet
            CreatePart4Sheet(package);

            // Create Part 5 Sheet
            CreatePart5Sheet(package);

            // Create Part 6 Sheet
            CreatePart6Sheet(package);

            // Create Part 7 Sheet
            CreatePart7Sheet(package);

            return Result<byte[]>.Success(await package.GetAsByteArrayAsync());
        }
        catch (Exception ex)
        {
            return Result<byte[]>.Failure($"Error generating template: {ex.Message}");
        }
    }

    private void CreateTestInfoSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("TestInfo");

        // Headers
        sheet.Cells["A1"].Value = "Test Information";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Title:";
        sheet.Cells["A3"].Value = "Description:";

        sheet.Cells["A2:A3"].Style.Font.Bold = true;

        // Sample data
        sheet.Cells["B2"].Value = "TOEIC Full Simulator Test 1";
        sheet.Cells["B3"].Value = "Full-length TOEIC Listening & Reading simulation test with 200 questions.";

        // Instructions
        sheet.Cells["A5"].Value = "Instructions:";
        sheet.Cells["A5"].Style.Font.Bold = true;
        sheet.Cells["A6"].Value = "1. Fill in the test title (required)";
        sheet.Cells["A7"].Value = "2. Fill in the description (optional)";
        sheet.Cells["A8"].Value = "3. When importing, you will need to upload an audio file separately";
        sheet.Cells["A9"].Value = "4. For Part 1, embed images directly in Column C cells (Right-click → Insert → Pictures)";
        sheet.Cells["A10"].Value = "5. Fill in all questions in Part1-Part7 sheets";
        sheet.Cells["A11"].Value = "6. Make sure total questions = 200";

        sheet.Columns[1].Width = 15;
        sheet.Columns[2].Width = 80;
    }

    private void CreatePart1Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part1");

        // Header
        sheet.Cells["A1"].Value = "Part 1: Photographs (6 questions, 4 options each)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        // Column headers
        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Content";
        sheet.Cells["C2"].Value = "Embed Image Here (REQUIRED)";
        sheet.Cells["D2"].Value = "Option A";
        sheet.Cells["E2"].Value = "Option B";
        sheet.Cells["F2"].Value = "Option C";
        sheet.Cells["G2"].Value = "Option D";
        sheet.Cells["H2"].Value = "Explanation";
        sheet.Cells["I2"].Value = "Correct Answer";

        sheet.Cells["A2:I2"].Style.Font.Bold = true;
        sheet.Cells["A2:I2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        // Sample data rows with realistic TOEIC content
        var part1Questions = new[]
        {
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "They're sitting at a table.", B = "They're leaving the building.", C = "They're writing on a board.", D = "They're standing in a line.", Correct = "They're sitting at a table.", Explanation = "The photo shows people seated around a conference table in a meeting." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "A building is being constructed.", B = "Workers are having lunch.", C = "The crane is being taken down.", D = "Materials are being delivered.", Correct = "A building is being constructed.", Explanation = "The image depicts an active construction site with ongoing building work." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "Cars are parked in rows.", B = "A vehicle is being washed.", C = "People are getting out of cars.", D = "The lot is completely empty.", Correct = "Cars are parked in rows.", Explanation = "The photograph shows a parking lot with vehicles arranged in organized rows." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "She's closing her laptop.", B = "She's typing on a keyboard.", C = "She's talking on the phone.", D = "She's reading a document.", Correct = "She's typing on a keyboard.", Explanation = "The woman in the photo is actively working on her laptop computer." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "Shelves are being stocked.", B = "Customers are standing in line.", C = "Products are displayed on shelves.", D = "The store is closed.", Correct = "Products are displayed on shelves.", Explanation = "The image shows a retail environment with merchandise arranged on store shelves." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "[Right-click and Insert → Pictures]",
                  A = "A bridge spans a river.", B = "Boats are passing under a bridge.", C = "Workers are repairing a bridge.", D = "A bridge is under construction.", Correct = "A bridge spans a river.", Explanation = "The photograph depicts a completed bridge structure crossing over a body of water." }
        };

        for (int i = 0; i < 6; i++)
        {
            int row = 3 + i;
            var q = part1Questions[i];
            sheet.Cells[row, 1].Value = i + 1;
            sheet.Cells[row, 2].Value = q.Content;
            sheet.Cells[row, 3].Value = q.Image;
            sheet.Cells[row, 4].Value = q.A;
            sheet.Cells[row, 5].Value = q.B;
            sheet.Cells[row, 6].Value = q.C;
            sheet.Cells[row, 7].Value = q.D;
            sheet.Cells[row, 8].Value = q.Explanation;
            sheet.Cells[row, 9].Value = q.Correct;
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 40;
        sheet.Columns[3].Width = 50;
        sheet.Columns[4].Width = 20;
        sheet.Columns[5].Width = 20;
        sheet.Columns[6].Width = 20;
        sheet.Columns[7].Width = 20;
        sheet.Columns[8].Width = 40;
        sheet.Columns[9].Width = 15;
    }

    private void CreatePart2Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part2");

        sheet.Cells["A1"].Value = "Part 2: Question-Response (25 questions, 3 options each)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Content";
        sheet.Cells["C2"].Value = "Option A";
        sheet.Cells["D2"].Value = "Option B";
        sheet.Cells["E2"].Value = "Option C";
        sheet.Cells["F2"].Value = "Explanation";
        sheet.Cells["G2"].Value = "Correct Answer";

        sheet.Cells["A2:G2"].Style.Font.Bold = true;
        sheet.Cells["A2:G2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        // Realistic TOEIC Part 2 questions
        var part2Questions = new[]
        {
            new { Q = "When does the meeting start?", A = "At three o'clock.", B = "In the conference room.", C = "About an hour.", Correct = "At three o'clock.", Exp = "The question asks 'when', so a time answer is appropriate." },
            new { Q = "Who's in charge of the marketing department?", A = "Ms. Johnson is.", B = "Yes, I am.", C = "On the third floor.", Correct = "Ms. Johnson is.", Exp = "'Who' questions require a person as the answer." },
            new { Q = "Where can I find the sales reports?", A = "In the filing cabinet.", B = "Last week.", C = "Mr. Park prepared them.", Correct = "In the filing cabinet.", Exp = "'Where' questions require a location answer." },
            new { Q = "Would you like coffee or tea?", A = "Coffee, please.", B = "Yes, I would.", C = "At the cafe.", Correct = "Coffee, please.", Exp = "Choice questions require selecting one of the given options." },
            new { Q = "The printer isn't working again.", A = "I'll call tech support.", B = "Yes, it is.", C = "In the supply room.", Correct = "I'll call tech support.", Exp = "Statement about a problem requires an appropriate response offering help." },
            new { Q = "Haven't you submitted the budget yet?", A = "I'll do it tomorrow.", B = "Yes, I haven't.", C = "The accounting department.", Correct = "I'll do it tomorrow.", Exp = "Negative questions can be answered with positive statements." },
            new { Q = "How much does the subscription cost?", A = "Fifty dollars a month.", B = "Last year.", C = "The manager approved it.", Correct = "Fifty dollars a month.", Exp = "'How much' questions ask for a price or cost." },
            new { Q = "Why was the shipment delayed?", A = "Due to bad weather.", B = "Next Monday.", C = "The warehouse.", Correct = "Due to bad weather.", Exp = "'Why' questions require a reason as the answer." },
            new { Q = "Could you review this document?", A = "Sure, send it over.", B = "Yes, I could.", C = "It's on my desk.", Correct = "Sure, send it over.", Exp = "Request questions need agreeing or declining responses." },
            new { Q = "How long will the renovation take?", A = "About two weeks.", B = "The construction company.", C = "On the second floor.", Correct = "About two weeks.", Exp = "'How long' questions ask for a duration of time." }
        };

        for (int i = 0; i < 25; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;

            if (i < part2Questions.Length)
            {
                var q = part2Questions[i];
                sheet.Cells[row, 2].Value = q.Q;
                sheet.Cells[row, 3].Value = q.A;
                sheet.Cells[row, 4].Value = q.B;
                sheet.Cells[row, 5].Value = q.C;
                sheet.Cells[row, 6].Value = q.Exp;
                sheet.Cells[row, 7].Value = q.Correct;
            }
            else
            {
                // Simple placeholder for remaining questions
                sheet.Cells[row, 2].Value = $"Part 2 - Question {i + 1}";
                sheet.Cells[row, 3].Value = "Response A";
                sheet.Cells[row, 4].Value = "Response B";
                sheet.Cells[row, 5].Value = "Response C";
                sheet.Cells[row, 6].Value = "Explanation for question";
                sheet.Cells[row, 7].Value = "Response A";
            }
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 40;
        sheet.Columns[3].Width = 20;
        sheet.Columns[4].Width = 20;
        sheet.Columns[5].Width = 20;
        sheet.Columns[6].Width = 40;
        sheet.Columns[7].Width = 15;
    }

    private void CreatePart3Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part3");

        sheet.Cells["A1"].Value = "Part 3: Conversations (13 groups, 3 questions per group = 39 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Group No";
        sheet.Cells["B2"].Value = "Passage";
        sheet.Cells["C2"].Value = "Image URL";
        sheet.Cells["D2"].Value = "Question Content";
        sheet.Cells["E2"].Value = "Q Image URL";
        sheet.Cells["F2"].Value = "Option A";
        sheet.Cells["G2"].Value = "Option B";
        sheet.Cells["H2"].Value = "Option C";
        sheet.Cells["I2"].Value = "Option D";
        sheet.Cells["J2"].Value = "Explanation";
        sheet.Cells["K2"].Value = "Correct Answer";

        sheet.Cells["A2:K2"].Style.Font.Bold = true;
        sheet.Cells["A2:K2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        int row = 3;
        for (int g = 0; g < 13; g++)
        {
            // Passage row
            sheet.Cells[row, 1].Value = g + 1;
            sheet.Cells[row, 2].Value = $"Part 3 - Conversation Group {g + 1}";
            sheet.Cells[row, 3].Value = "";
            row++;

            // 3 questions
            for (int q = 0; q < 3; q++)
            {
                sheet.Cells[row, 4].Value = $"Part 3 - Group {g + 1} Q{q + 1}";
                sheet.Cells[row, 5].Value = "";
                sheet.Cells[row, 6].Value = "Option A";
                sheet.Cells[row, 7].Value = "Option B";
                sheet.Cells[row, 8].Value = "Option C";
                sheet.Cells[row, 9].Value = "Option D";
                sheet.Cells[row, 10].Value = "Sample explanation for Part 3";
                sheet.Cells[row, 11].Value = "Option A";
                row++;
            }
        }

        sheet.Columns[1].Width = 10;
        sheet.Columns[2].Width = 50;
        sheet.Columns[3].Width = 30;
        sheet.Columns[4].Width = 40;
        sheet.Columns[5].Width = 30;
        for (int i = 6; i <= 9; i++)
            sheet.Columns[i].Width = 20;
        sheet.Columns[10].Width = 40;
        sheet.Columns[11].Width = 15;
    }

    private void CreatePart4Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part4");

        sheet.Cells["A1"].Value = "Part 4: Short Talks (10 groups, 3 questions per group = 30 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Group No";
        sheet.Cells["B2"].Value = "Passage";
        sheet.Cells["C2"].Value = "Image URL";
        sheet.Cells["D2"].Value = "Question Content";
        sheet.Cells["E2"].Value = "Q Image URL";
        sheet.Cells["F2"].Value = "Option A";
        sheet.Cells["G2"].Value = "Option B";
        sheet.Cells["H2"].Value = "Option C";
        sheet.Cells["I2"].Value = "Option D";
        sheet.Cells["J2"].Value = "Explanation";
        sheet.Cells["K2"].Value = "Correct Answer";

        sheet.Cells["A2:K2"].Style.Font.Bold = true;
        sheet.Cells["A2:K2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        int row = 3;
        for (int g = 0; g < 10; g++)
        {
            sheet.Cells[row, 1].Value = g + 1;
            sheet.Cells[row, 2].Value = $"Part 4 - Short Talk Group {g + 1}";
            sheet.Cells[row, 3].Value = "";
            row++;

            for (int q = 0; q < 3; q++)
            {
                sheet.Cells[row, 4].Value = $"Part 4 - Group {g + 1} Q{q + 1}";
                sheet.Cells[row, 5].Value = "";
                sheet.Cells[row, 6].Value = "Option A";
                sheet.Cells[row, 7].Value = "Option B";
                sheet.Cells[row, 8].Value = "Option C";
                sheet.Cells[row, 9].Value = "Option D";
                sheet.Cells[row, 10].Value = "Sample explanation for Part 4";
                sheet.Cells[row, 11].Value = "Option A";
                row++;
            }
        }

        sheet.Columns[1].Width = 10;
        sheet.Columns[2].Width = 50;
        sheet.Columns[3].Width = 30;
        sheet.Columns[4].Width = 40;
        sheet.Columns[5].Width = 30;
        for (int i = 6; i <= 9; i++)
            sheet.Columns[i].Width = 20;
        sheet.Columns[10].Width = 40;
        sheet.Columns[11].Width = 15;
    }

    private void CreatePart5Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part5");

        sheet.Cells["A1"].Value = "Part 5: Incomplete Sentences (30 questions, 4 options each)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Content";
        sheet.Cells["C2"].Value = "Option A";
        sheet.Cells["D2"].Value = "Option B";
        sheet.Cells["E2"].Value = "Option C";
        sheet.Cells["F2"].Value = "Option D";
        sheet.Cells["G2"].Value = "Explanation";
        sheet.Cells["H2"].Value = "Correct Answer";

        sheet.Cells["A2:H2"].Style.Font.Bold = true;
        sheet.Cells["A2:H2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        // Realistic TOEIC Part 5 grammar questions
        var part5Questions = new[]
        {
            new { Q = "The company's profits have ------- significantly over the past quarter.", A = "increase", B = "increased", C = "increasing", D = "to increase", Correct = "increased", Exp = "Present perfect tense requires past participle form." },
            new { Q = "Please submit your expense report ------- Friday.", A = "by", B = "until", C = "in", D = "at", Correct = "by", Exp = "'By' indicates a deadline." },
            new { Q = "Ms. Chen is responsible ------- managing the new project.", A = "with", B = "to", C = "for", D = "of", Correct = "for", Exp = "'Responsible for' is the correct collocation." },
            new { Q = "The meeting was ------- postponed due to the CEO's illness.", A = "temporary", B = "temporarily", C = "temporaries", D = "temporariness", Correct = "temporarily", Exp = "Adverb form modifies the verb 'postponed'." },
            new { Q = "------- the renovation is complete, we will move to the new office.", A = "During", B = "While", C = "Once", D = "Meanwhile", Correct = "Once", Exp = "'Once' indicates when one action follows another." },
            new { Q = "The contract must be signed by ------- parties before it becomes effective.", A = "both", B = "every", C = "all", D = "whole", Correct = "both", Exp = "'Both' is used when referring to two parties." },
            new { Q = "Our products are ------- than those of our competitors.", A = "more reliable", B = "most reliable", C = "reliable", D = "reliability", Correct = "more reliable", Exp = "Comparative form is needed for 'than' comparison." },
            new { Q = "The supervisor asked ------- to attend the training session.", A = "we", B = "us", C = "our", D = "ours", Correct = "us", Exp = "Object pronoun is needed after 'asked'." },
            new { Q = "------- employee who completes the course will receive a certificate.", A = "All", B = "Every", C = "Much", D = "Most", Correct = "Every", Exp = "'Every' is used with singular noun 'employee'." },
            new { Q = "The customer service team handles inquiries ------- and professionally.", A = "prompt", B = "prompted", C = "prompting", D = "promptly", Correct = "promptly", Exp = "Adverb form needed to modify verb 'handles'." }
        };

        for (int i = 0; i < 30; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;

            if (i < part5Questions.Length)
            {
                var q = part5Questions[i];
                sheet.Cells[row, 2].Value = q.Q;
                sheet.Cells[row, 3].Value = q.A;
                sheet.Cells[row, 4].Value = q.B;
                sheet.Cells[row, 5].Value = q.C;
                sheet.Cells[row, 6].Value = q.D;
                sheet.Cells[row, 7].Value = q.Exp;
                sheet.Cells[row, 8].Value = q.Correct;
            }
            else
            {
                // Simple placeholder for remaining questions
                sheet.Cells[row, 2].Value = $"The company's new policy will ------- next month. (Question {i + 1})";
                sheet.Cells[row, 3].Value = "implement";
                sheet.Cells[row, 4].Value = "be implemented";
                sheet.Cells[row, 5].Value = "implementing";
                sheet.Cells[row, 6].Value = "implementation";
                sheet.Cells[row, 7].Value = "Choose the grammatically correct option.";
                sheet.Cells[row, 8].Value = "be implemented";
            }
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 40;
        sheet.Columns[3].Width = 20;
        sheet.Columns[4].Width = 20;
        sheet.Columns[5].Width = 20;
        sheet.Columns[6].Width = 20;
        sheet.Columns[7].Width = 40;
        sheet.Columns[8].Width = 15;
    }

    private void CreatePart6Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part6");

        sheet.Cells["A1"].Value = "Part 6: Text Completion (4 groups, 4 questions per group = 16 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Group No";
        sheet.Cells["B2"].Value = "Passage";
        sheet.Cells["C2"].Value = "Image URL";
        sheet.Cells["D2"].Value = "Question Content";
        sheet.Cells["E2"].Value = "Option A";
        sheet.Cells["F2"].Value = "Option B";
        sheet.Cells["G2"].Value = "Option C";
        sheet.Cells["H2"].Value = "Option D";
        sheet.Cells["I2"].Value = "Explanation";
        sheet.Cells["J2"].Value = "Correct Answer";

        sheet.Cells["A2:J2"].Style.Font.Bold = true;
        sheet.Cells["A2:J2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        int row = 3;
        for (int g = 0; g < 4; g++)
        {
            sheet.Cells[row, 1].Value = g + 1;
            sheet.Cells[row, 2].Value = $"Part 6 - Text Completion Group {g + 1}";
            sheet.Cells[row, 3].Value = "";
            row++;

            for (int q = 0; q < 4; q++)
            {
                sheet.Cells[row, 4].Value = $"Part 6 - Group {g + 1} Q{q + 1}";
                sheet.Cells[row, 5].Value = "Option A";
                sheet.Cells[row, 6].Value = "Option B";
                sheet.Cells[row, 7].Value = "Option C";
                sheet.Cells[row, 8].Value = "Option D";
                sheet.Cells[row, 9].Value = "Sample explanation for Part 6";
                sheet.Cells[row, 10].Value = "Option A";
                row++;
            }
        }

        sheet.Columns[1].Width = 10;
        sheet.Columns[2].Width = 50;
        sheet.Columns[3].Width = 30;
        sheet.Columns[4].Width = 40;
        for (int i = 5; i <= 8; i++)
            sheet.Columns[i].Width = 20;
        sheet.Columns[9].Width = 40;
        sheet.Columns[10].Width = 15;
    }

    private void CreatePart7Sheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part7");

        sheet.Cells["A1"].Value = "Part 7: Reading Comprehension (12 groups with varying questions = 54 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Group No";
        sheet.Cells["B2"].Value = "Passage";
        sheet.Cells["C2"].Value = "Image URL";
        sheet.Cells["D2"].Value = "Question Content";
        sheet.Cells["E2"].Value = "Q Image URL";
        sheet.Cells["F2"].Value = "Option A";
        sheet.Cells["G2"].Value = "Option B";
        sheet.Cells["H2"].Value = "Option C";
        sheet.Cells["I2"].Value = "Option D";
        sheet.Cells["J2"].Value = "Explanation";
        sheet.Cells["K2"].Value = "Correct Answer";

        sheet.Cells["A2:K2"].Style.Font.Bold = true;
        sheet.Cells["A2:K2"].Style.Fill.SetBackground(System.Drawing.Color.LightGray);

        var groupQuestionCounts = new[] { 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5 }; // Total = 54 questions
        int row = 3;

        for (int g = 0; g < 12; g++)
        {
            int questionsInGroup = groupQuestionCounts[g];

            sheet.Cells[row, 1].Value = g + 1;
            sheet.Cells[row, 2].Value = $"Part 7 - Reading Comprehension Group {g + 1}";
            sheet.Cells[row, 3].Value = "";
            row++;

            for (int q = 0; q < questionsInGroup; q++)
            {
                sheet.Cells[row, 4].Value = $"Part 7 - Group {g + 1} Q{q + 1}";
                sheet.Cells[row, 5].Value = "";
                sheet.Cells[row, 6].Value = "Option A";
                sheet.Cells[row, 7].Value = "Option B";
                sheet.Cells[row, 8].Value = "Option C";
                sheet.Cells[row, 9].Value = "Option D";
                sheet.Cells[row, 10].Value = "Sample explanation for Part 7";
                sheet.Cells[row, 11].Value = "Option A";
                row++;
            }
        }

        sheet.Columns[1].Width = 10;
        sheet.Columns[2].Width = 60;
        sheet.Columns[3].Width = 30;
        sheet.Columns[4].Width = 40;
        sheet.Columns[5].Width = 30;
        for (int i = 6; i <= 9; i++)
            sheet.Columns[i].Width = 20;
        sheet.Columns[10].Width = 40;
        sheet.Columns[11].Width = 15;
    }

    // ============== 4 SKILLS TEST METHODS ==============

    public async Task<Result<CreateTestManualDto>> ParseExcelToTest4SkillsAsync(IFormFile excelFile)
    {
        try
        {
            // Validate file
            if (excelFile == null || excelFile.Length == 0)
                return Result<CreateTestManualDto>.Failure("Excel file is required");

            if (!excelFile.FileName.EndsWith(".xlsx") && !excelFile.FileName.EndsWith(".xls"))
                return Result<CreateTestManualDto>.Failure("File must be Excel format (.xlsx or .xls)");

            using var stream = new MemoryStream();
            await excelFile.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);

            // Validate required sheets (17 sheets for 4 skills)
            var requiredSheets = new[] { "TestInfo", "Part1", "Part2", "Part3", "Part4", "Part5", "Part6", "Part7",
                "Part8_Writing", "Part9_Writing", "Part10_Writing",
                "Part11_Speaking", "Part12_Speaking", "Part13_Speaking", "Part14_Speaking", "Part15_Speaking" };

            foreach (var sheetName in requiredSheets)
            {
                if (package.Workbook.Worksheets[sheetName] == null)
                    return Result<CreateTestManualDto>.Failure($"Missing required sheet: {sheetName}");
            }

            // Parse Test Info
            var testInfoSheet = package.Workbook.Worksheets["TestInfo"];
            var testDto = new CreateTestManualDto
            {
                Title = testInfoSheet.Cells["B2"].Text,
                Description = testInfoSheet.Cells["B3"].Text,
                AudioUrl = null, // Will be set after audio file upload in controller
                TestType = TestType.Simulator,
                TestSkill = TestSkill.FourSkills, // 4-skills test
                Parts = new List<PartDto>()
            };

            // Validate test info
            if (string.IsNullOrWhiteSpace(testDto.Title))
                return Result<CreateTestManualDto>.Failure("Test title is required (Cell B2 in TestInfo sheet)");

            // Parse Listening Parts (1-4)
            var part1Result = await ParsePart1(package.Workbook.Worksheets["Part1"]);
            if (!part1Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part1Result.ErrorMessage!);
            testDto.Parts.Add(part1Result.Data);

            var part2Result = ParsePart2(package.Workbook.Worksheets["Part2"]);
            if (!part2Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part2Result.ErrorMessage!);
            testDto.Parts.Add(part2Result.Data);

            var part3Result = ParsePart3(package.Workbook.Worksheets["Part3"]);
            if (!part3Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part3Result.ErrorMessage!);
            testDto.Parts.Add(part3Result.Data);

            var part4Result = ParsePart4(package.Workbook.Worksheets["Part4"]);
            if (!part4Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part4Result.ErrorMessage!);
            testDto.Parts.Add(part4Result.Data);

            // Parse Reading Parts (5-7)
            var part5Result = ParsePart5(package.Workbook.Worksheets["Part5"]);
            if (!part5Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part5Result.ErrorMessage!);
            testDto.Parts.Add(part5Result.Data);

            var part6Result = ParsePart6(package.Workbook.Worksheets["Part6"]);
            if (!part6Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part6Result.ErrorMessage!);
            testDto.Parts.Add(part6Result.Data);

            var part7Result = ParsePart7(package.Workbook.Worksheets["Part7"]);
            if (!part7Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part7Result.ErrorMessage!);
            testDto.Parts.Add(part7Result.Data);

            // Parse Writing Parts (8-10)
            var part8Result = await ParsePart8Writing(package.Workbook.Worksheets["Part8_Writing"]);
            if (!part8Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part8Result.ErrorMessage!);
            testDto.Parts.Add(part8Result.Data);

            var part9Result = ParsePart9Writing(package.Workbook.Worksheets["Part9_Writing"]);
            if (!part9Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part9Result.ErrorMessage!);
            testDto.Parts.Add(part9Result.Data);

            var part10Result = ParsePart10Writing(package.Workbook.Worksheets["Part10_Writing"]);
            if (!part10Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part10Result.ErrorMessage!);
            testDto.Parts.Add(part10Result.Data);

            // Parse Speaking Parts (11-15)
            var part11Result = ParsePart11Speaking(package.Workbook.Worksheets["Part11_Speaking"]);
            if (!part11Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part11Result.ErrorMessage!);
            testDto.Parts.Add(part11Result.Data);

            var part12Result = await ParsePart12Speaking(package.Workbook.Worksheets["Part12_Speaking"]);
            if (!part12Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part12Result.ErrorMessage!);
            testDto.Parts.Add(part12Result.Data);

            var part13Result = ParsePart13Speaking(package.Workbook.Worksheets["Part13_Speaking"]);
            if (!part13Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part13Result.ErrorMessage!);
            testDto.Parts.Add(part13Result.Data);

            var part14Result = await ParsePart14Speaking(package.Workbook.Worksheets["Part14_Speaking"]);
            if (!part14Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part14Result.ErrorMessage!);
            testDto.Parts.Add(part14Result.Data);

            var part15Result = ParsePart15Speaking(package.Workbook.Worksheets["Part15_Speaking"]);
            if (!part15Result.IsSuccess) return Result<CreateTestManualDto>.Failure(part15Result.ErrorMessage!);
            testDto.Parts.Add(part15Result.Data);

            // Validate total questions: 200 (L+R) + 8 (W) + 11 (S) = 219
            int totalQuestions = testDto.Parts.Sum(p =>
                (p.Questions?.Count ?? 0) +
                (p.Groups?.Sum(g => g.Questions.Count) ?? 0));

            if (totalQuestions != 219)
                return Result<CreateTestManualDto>.Failure($"Total questions must be 219 (L+R: 200, W: 8, S: 11), found {totalQuestions}");

            return Result<CreateTestManualDto>.Success(testDto);
        }
        catch (Exception ex)
        {
            return Result<CreateTestManualDto>.Failure($"Error parsing 4-skills Excel file: {ex.Message}");
        }
    }

    public async Task<Result<byte[]>> GenerateTemplate4SkillsAsync()
    {
        try
        {
            using var package = new ExcelPackage();

            // Create TestInfo Sheet
            CreateTestInfoSheet4Skills(package);

            // Listening & Reading (reuse existing methods)
            CreatePart1Sheet(package);
            CreatePart2Sheet(package);
            CreatePart3Sheet(package);
            CreatePart4Sheet(package);
            CreatePart5Sheet(package);
            CreatePart6Sheet(package);
            CreatePart7Sheet(package);

            // Writing Parts
            CreatePart8WritingSheet(package);
            CreatePart9WritingSheet(package);
            CreatePart10WritingSheet(package);

            // Speaking Parts
            CreatePart11SpeakingSheet(package);
            CreatePart12SpeakingSheet(package);
            CreatePart13SpeakingSheet(package);
            CreatePart14SpeakingSheet(package);
            CreatePart15SpeakingSheet(package);

            return Result<byte[]>.Success(await package.GetAsByteArrayAsync());
        }
        catch (Exception ex)
        {
            return Result<byte[]>.Failure($"Error generating 4-skills template: {ex.Message}");
        }
    }

    private void CreateTestInfoSheet4Skills(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("TestInfo");

        // Headers
        sheet.Cells["A1"].Value = "Test Information - Full 4 Skills (L+R+W+S)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Title:";
        sheet.Cells["A3"].Value = "Description:";

        sheet.Cells["A2:A3"].Style.Font.Bold = true;

        // Sample data
        sheet.Cells["B2"].Value = "TOEIC Full 4-Skills Test";
        sheet.Cells["B3"].Value = "Complete TOEIC test with Listening, Reading, Writing, and Speaking sections (219 questions total).";

        // Instructions
        sheet.Cells["A5"].Value = "Instructions:";
        sheet.Cells["A5"].Style.Font.Bold = true;
        sheet.Cells["A6"].Value = "1. Fill in the test title (required)";
        sheet.Cells["A7"].Value = "2. Fill in the description (optional)";
        sheet.Cells["A8"].Value = "3. When uploading, you will need to provide the AUDIO FILE separately (45-min listening audio)";
        sheet.Cells["A9"].Value = "4. Fill in all questions in all 15 part sheets";
        sheet.Cells["A10"].Value = "5. For parts requiring images (Part 1, Part 8 Writing, Part 12 Speaking, Part 14 Speaking):";
        sheet.Cells["A11"].Value = "   - DO NOT enter image URLs as text";
        sheet.Cells["A12"].Value = "   - Instead, INSERT/EMBED the actual image directly into the Excel cell";
        sheet.Cells["A13"].Value = "   - Right-click the cell → Insert → Pictures → select your image file";
        sheet.Cells["A14"].Value = "   - The system will automatically upload embedded images to cloud storage";
        sheet.Cells["A15"].Value = "6. Question counts: L&R: 200 | Writing: 8 | Speaking: 11 | Total: 219";

        sheet.Columns[1].Width = 15;
        sheet.Columns[2].Width = 100;
    }

    // Writing Parts Template Generation

    private void CreatePart8WritingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part8_Writing");

        sheet.Cells["A1"].Value = "Part 8 (Writing): Write a sentence based on a picture (5 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Instruction/Prompt";
        sheet.Cells["C2"].Value = "Embed Image Here (REQUIRED)";
        sheet.Cells["D2"].Value = "Sample Answer";

        sheet.Cells["A2:D2"].Style.Font.Bold = true;
        sheet.Cells["A2:D2"].Style.Fill.SetBackground(System.Drawing.Color.LightBlue);

        for (int i = 0; i < 5; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;
            sheet.Cells[row, 2].Value = $"Write a sentence that describes what you see in the picture. (Question {i + 1})";
            sheet.Cells[row, 3].Value = "[Right-click here and Insert → Pictures to embed an image]";
            sheet.Cells[row, 4].Value = $"Sample: A man is sitting at a desk and working on his computer.";
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 50;
        sheet.Columns[3].Width = 50;
        sheet.Columns[4].Width = 60;
    }

    private void CreatePart9WritingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part9_Writing");

        sheet.Cells["A1"].Value = "Part 9 (Writing): Respond to a written request (2 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Email/Request Content";
        sheet.Cells["C2"].Value = "Sample Response";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightBlue);

        var part9Sample = new[]
        {
            new { Req = "Dear Customer, We received your inquiry about our new product line. Could you please provide more details about which products you are interested in? Best regards, Sales Team", Resp = "Dear Sales Team, Thank you for your response. I am particularly interested in your laptop computers and accessories. Could you send me a catalog with pricing information? Sincerely, [Your name]" },
            new { Req = "Hello, I noticed that my recent order has not arrived yet. The estimated delivery date was last week. Can you check the status? Thanks, Customer", Resp = "Dear Customer, I apologize for the delay. I have checked your order status and it is currently being processed at our warehouse. It should be shipped within 2 business days. We will send you a tracking number via email. Thank you for your patience." }
        };

        for (int i = 0; i < 2; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;
            sheet.Cells[row, 2].Value = part9Sample[i].Req;
            sheet.Cells[row, 3].Value = part9Sample[i].Resp;
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 70;
        sheet.Columns[3].Width = 70;
    }

    private void CreatePart10WritingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part10_Writing");

        sheet.Cells["A1"].Value = "Part 10 (Writing): Write an opinion essay (1 question)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Essay Prompt";
        sheet.Cells["C2"].Value = "Sample Essay";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightBlue);

        sheet.Cells[3, 1].Value = 1;
        sheet.Cells[3, 2].Value = "Do you agree or disagree with the following statement? 'Working from home is more productive than working in an office.' Use specific reasons and examples to support your opinion. Write at least 300 words.";
        sheet.Cells[3, 3].Value = "Sample Essay: In today's modern workplace, the debate between working from home and working in an office has become increasingly relevant. I strongly believe that working from home can be more productive for several key reasons.\n\nFirstly, working from home eliminates commuting time, which can significantly increase productivity. Many people spend 1-2 hours per day traveling to and from the office. This time could be better spent on actual work or personal development...\n\n(Continue with body paragraphs and conclusion)";

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 70;
        sheet.Columns[3].Width = 70;
    }

    // Speaking Parts Template Generation

    private void CreatePart11SpeakingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part11_Speaking");

        sheet.Cells["A1"].Value = "Part 11 (Speaking): Read a text aloud (2 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Text to Read Aloud";
        sheet.Cells["C2"].Value = "Notes/Tips";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightGreen);

        var part11Texts = new[]
        {
            new { Text = "Welcome to our annual technology conference. Today's sessions will cover the latest innovations in artificial intelligence, cloud computing, and cybersecurity. Please check your conference guide for the schedule and room locations.", Tip = "Speak clearly and at a moderate pace. Pay attention to pronunciation of technical terms." },
            new { Text = "The company has announced that all employees are required to complete the new safety training program by the end of this month. The online course takes approximately two hours to complete. Please contact the HR department if you have any questions.", Tip = "Emphasize key information like deadlines and requirements." }
        };

        for (int i = 0; i < 2; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;
            sheet.Cells[row, 2].Value = part11Texts[i].Text;
            sheet.Cells[row, 3].Value = part11Texts[i].Tip;
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 70;
        sheet.Columns[3].Width = 40;
    }

    private void CreatePart12SpeakingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part12_Speaking");

        sheet.Cells["A1"].Value = "Part 12 (Speaking): Describe a picture (2 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Instruction";
        sheet.Cells["C2"].Value = "Embed Picture Here (REQUIRED)";
        sheet.Cells["D2"].Value = "Sample Description";

        sheet.Cells["A2:D2"].Style.Font.Bold = true;
        sheet.Cells["A2:D2"].Style.Fill.SetBackground(System.Drawing.Color.LightGreen);

        var part12Questions = new[]
        {
            new { Instruction = "Describe the picture in as much detail as you can. You will have 45 seconds to prepare and 45 seconds to speak.", Sample = "Sample: This picture shows an office environment. In the foreground, I can see two people having a discussion. They appear to be colleagues reviewing some documents together. In the background, there are other employees working at their desks with computers. The office looks modern and well-organized with large windows providing natural light." },
            new { Instruction = "Describe the picture in as much detail as you can. You will have 45 seconds to prepare and 45 seconds to speak.", Sample = "Sample: In this photograph, I can see a busy restaurant scene. There are several tables occupied by customers. A waiter is serving food to a group of people at one table. The atmosphere appears lively and the restaurant looks well-decorated with plants and artwork on the walls." }
        };

        for (int i = 0; i < 2; i++)
        {
            int row = 3 + i;
            sheet.Cells[row, 1].Value = i + 1;
            sheet.Cells[row, 2].Value = part12Questions[i].Instruction;
            sheet.Cells[row, 3].Value = "[Right-click here and Insert → Pictures to embed an image]";
            sheet.Cells[row, 4].Value = part12Questions[i].Sample;
        }

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 50;
        sheet.Columns[3].Width = 50;
        sheet.Columns[4].Width = 70;
    }

    private void CreatePart13SpeakingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part13_Speaking");

        sheet.Cells["A1"].Value = "Part 13 (Speaking): Respond to questions (1 group, 3 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Row Type";
        sheet.Cells["B2"].Value = "Content";
        sheet.Cells["C2"].Value = "Sample Answer";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightGreen);

        // Introduction/Context
        sheet.Cells[3, 1].Value = "Introduction";
        sheet.Cells[3, 2].Value = "Imagine that a market research company is doing a survey about people's eating habits and lifestyle. You have agreed to participate in the survey. I will ask you three questions about this topic.";
        sheet.Cells[3, 3].Value = "";

        var part13Questions = new[]
        {
            new { Q = "What is your favorite restaurant and why do you like it?", A = "My favorite restaurant is an Italian place called Luigi's. I like it because the food is always fresh and delicious, the atmosphere is cozy, and the staff are very friendly." },
            new { Q = "How often do you eat out per week, and what types of food do you usually choose?", A = "I usually eat out about 2-3 times a week. I prefer healthy options like salads and grilled fish, but occasionally I enjoy trying new cuisines like Thai or Mexican food." },
            new { Q = "Do you think eating at home is healthier than eating at restaurants? Why or why not?", A = "Yes, I believe eating at home is generally healthier because you have complete control over the ingredients and cooking methods. You can avoid excessive salt, sugar, and unhealthy fats that are often used in restaurant food." }
        };

        for (int i = 0; i < 3; i++)
        {
            int row = 4 + i;
            sheet.Cells[row, 1].Value = $"Question {i + 1}";
            sheet.Cells[row, 2].Value = part13Questions[i].Q;
            sheet.Cells[row, 3].Value = part13Questions[i].A;
        }

        sheet.Columns[1].Width = 15;
        sheet.Columns[2].Width = 60;
        sheet.Columns[3].Width = 70;
    }

    private void CreatePart14SpeakingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part14_Speaking");

        sheet.Cells["A1"].Value = "Part 14 (Speaking): Respond to questions using information provided (1 group, 3 questions)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Row Type";
        sheet.Cells["B2"].Value = "Content";
        sheet.Cells["C2"].Value = "Embed Image (OPTIONAL) / Sample Answer";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightGreen);

        sheet.Cells[3, 1].Value = "Schedule/Info";
        sheet.Cells[3, 2].Value = "Weekly Team Meeting Schedule:\nMonday 9:00 AM - Project Planning\nWednesday 2:00 PM - Progress Review\nFriday 4:00 PM - Week Wrap-up\nLocation: Conference Room B";
        sheet.Cells[3, 3].Value = "[Optional: Right-click and Insert → Pictures if you want to add a visual schedule]";

        sheet.Cells[4, 1].Value = "Question 1";
        sheet.Cells[4, 2].Value = "When is the project planning meeting held?";
        sheet.Cells[4, 3].Value = "The project planning meeting is held on Monday at 9:00 AM.";

        sheet.Cells[5, 1].Value = "Question 2";
        sheet.Cells[5, 2].Value = "Where do these meetings take place?";
        sheet.Cells[5, 3].Value = "All meetings take place in Conference Room B.";

        sheet.Cells[6, 1].Value = "Question 3";
        sheet.Cells[6, 2].Value = "How many meetings are scheduled per week?";
        sheet.Cells[6, 3].Value = "There are three meetings scheduled per week: on Monday, Wednesday, and Friday.";

        sheet.Columns[1].Width = 15;
        sheet.Columns[2].Width = 60;
        sheet.Columns[3].Width = 60;
    }

    private void CreatePart15SpeakingSheet(ExcelPackage package)
    {
        var sheet = package.Workbook.Worksheets.Add("Part15_Speaking");

        sheet.Cells["A1"].Value = "Part 15 (Speaking): Express an opinion (1 question)";
        sheet.Cells["A1"].Style.Font.Bold = true;
        sheet.Cells["A1"].Style.Font.Size = 14;

        sheet.Cells["A2"].Value = "Question No";
        sheet.Cells["B2"].Value = "Opinion Question";
        sheet.Cells["C2"].Value = "Sample Response";

        sheet.Cells["A2:C2"].Style.Font.Bold = true;
        sheet.Cells["A2:C2"].Style.Fill.SetBackground(System.Drawing.Color.LightGreen);

        sheet.Cells[3, 1].Value = 1;
        sheet.Cells[3, 2].Value = "Do you think companies should allow employees to work flexible hours? Why or why not?";
        sheet.Cells[3, 3].Value = "Yes, I believe companies should allow flexible hours because it helps employees maintain a better work-life balance. When people can adjust their schedules, they're often more productive and satisfied with their jobs. For example, some people work better in the morning while others are more productive in the afternoon. Flexible hours accommodate these different working styles.";

        sheet.Columns[1].Width = 12;
        sheet.Columns[2].Width = 60;
        sheet.Columns[3].Width = 70;
    }

    // ==================== HELPER METHODS FOR IMAGE EXTRACTION & UPLOAD ====================

    /// <summary>
    /// Extracts an embedded image from an Excel cell and uploads it to cloud storage
    /// </summary>
    /// <param name="worksheet">The worksheet containing the image</param>
    /// <param name="row">Row index (1-based)</param>
    /// <param name="col">Column index (1-based)</param>
    /// <returns>Cloud URL of the uploaded image, or null if no image found</returns>
    private async Task<string?> ExtractAndUploadImageAsync(ExcelWorksheet worksheet, int row, int col)
    {
        try
        {
            // EPPlus uses 1-based indexing, but drawings collection uses different addressing
            // We need to find drawings that overlap with the specified cell
            var cellAddress = worksheet.Cells[row, col].Address;

            foreach (var drawing in worksheet.Drawings)
            {
                if (drawing is OfficeOpenXml.Drawing.ExcelPicture picture)
                {
                    // Check if picture is in or near the target cell
                    if (IsPictureInCell(picture, row, col))
                    {
                        // Extract image bytes
                        var imageBytes = picture.Image.ImageBytes;
                        var imageType = picture.Image.Type ?? OfficeOpenXml.Drawing.ePictureType.Jpg; // Default to JPG if null
                        var extension = GetImageExtension(imageType);
                        var contentType = GetContentType(imageType);

                        // Convert to IFormFile
                        var formFile = ConvertToFormFile(imageBytes, $"image{extension}", contentType);

                        // Upload to cloud storage
                        var uploadResult = await _fileService.UploadFileAsync(formFile, "image");

                        if (uploadResult.IsSuccess)
                        {
                            return uploadResult.Data;
                        }
                        else
                        {
                            throw new Exception($"Failed to upload image: {uploadResult.ErrorMessage}");
                        }
                    }
                }
            }

            // No image found in this cell
            return null;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error extracting image from cell {worksheet.Cells[row, col].Address}: {ex.Message}");
        }
    }

    /// <summary>
    /// Checks if a picture is positioned in or overlapping with the specified cell
    /// </summary>
    private bool IsPictureInCell(OfficeOpenXml.Drawing.ExcelPicture picture, int row, int col)
    {
        // EPPlus picture positioning: From.Row and From.Column are 0-based
        var picStartRow = picture.From.Row + 1; // Convert to 1-based
        var picStartCol = picture.From.Column + 1; // Convert to 1-based
        var picEndRow = picture.To.Row + 1;
        var picEndCol = picture.To.Column + 1;

        // Check if the picture overlaps with the target cell
        return (picStartRow <= row && row <= picEndRow) &&
               (picStartCol <= col && col <= picEndCol);
    }

    /// <summary>
    /// Converts image bytes to IFormFile for upload
    /// </summary>
    private IFormFile ConvertToFormFile(byte[] imageBytes, string fileName, string contentType)
    {
        var stream = new MemoryStream(imageBytes);
        var formFile = new FormFile(stream, 0, imageBytes.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
        return formFile;
    }

    /// <summary>
    /// Gets file extension from EPPlus image type
    /// </summary>
    private string GetImageExtension(OfficeOpenXml.Drawing.ePictureType imageType)
    {
        return imageType switch
        {
            OfficeOpenXml.Drawing.ePictureType.Jpg => ".jpg",
            OfficeOpenXml.Drawing.ePictureType.Png => ".png",
            OfficeOpenXml.Drawing.ePictureType.Gif => ".gif",
            OfficeOpenXml.Drawing.ePictureType.Bmp => ".bmp",
            OfficeOpenXml.Drawing.ePictureType.Tif => ".tif",
            _ => ".jpg"
        };
    }

    /// <summary>
    /// Gets content type from EPPlus image type
    /// </summary>
    private string GetContentType(OfficeOpenXml.Drawing.ePictureType imageType)
    {
        return imageType switch
        {
            OfficeOpenXml.Drawing.ePictureType.Jpg => "image/jpeg",
            OfficeOpenXml.Drawing.ePictureType.Png => "image/png",
            OfficeOpenXml.Drawing.ePictureType.Gif => "image/gif",
            OfficeOpenXml.Drawing.ePictureType.Bmp => "image/bmp",
            OfficeOpenXml.Drawing.ePictureType.Tif => "image/tiff",
            _ => "image/jpeg"
        };
    }
}
