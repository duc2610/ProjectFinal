using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations;

public class ExcelService : IExcelService
{
    public ExcelService()
    {
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
                AudioUrl = testInfoSheet.Cells["B4"].Text,
                TestType = TestType.Simulator,
                TestSkill = TestSkill.LR,
                Parts = new List<PartDto>()
            };

            // Validate test info
            if (string.IsNullOrWhiteSpace(testDto.Title))
                return Result<CreateTestManualDto>.Failure("Test title is required (Cell B2 in TestInfo sheet)");

            if (string.IsNullOrWhiteSpace(testDto.AudioUrl))
                return Result<CreateTestManualDto>.Failure("Audio URL is required (Cell B4 in TestInfo sheet)");

            // Parse Part 1 (6 questions with images, 4 options)
            var part1Result = ParsePart1(package.Workbook.Worksheets["Part1"]);
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

    private Result<PartDto> ParsePart1(ExcelWorksheet worksheet)
    {
        try
        {
            var questions = new List<QuestionDto>();
            int startRow = 3; // Data starts at row 3

            for (int i = 0; i < 6; i++)
            {
                int row = startRow + i;

                var question = new QuestionDto
                {
                    Content = worksheet.Cells[row, 2].Text, // Column B
                    ImageUrl = worksheet.Cells[row, 3].Text, // Column C
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
                    return Result<PartDto>.Failure($"Part 1 - Question {i + 1}: Image URL is required (Row {row}, Column C)");

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
        sheet.Cells["A4"].Value = "Audio URL:";

        sheet.Cells["A2:A4"].Style.Font.Bold = true;

        // Sample data
        sheet.Cells["B2"].Value = "TOEIC Full Simulator Test 1";
        sheet.Cells["B3"].Value = "Full-length TOEIC Listening & Reading simulation test with 200 questions.";
        sheet.Cells["B4"].Value = "https://example.com/audio/toeic-test-1.mp3";

        // Instructions
        sheet.Cells["A6"].Value = "Instructions:";
        sheet.Cells["A6"].Style.Font.Bold = true;
        sheet.Cells["A7"].Value = "1. Fill in the test title (required)";
        sheet.Cells["A8"].Value = "2. Fill in the description (optional)";
        sheet.Cells["A9"].Value = "3. Fill in the audio file URL (required for L&R tests)";
        sheet.Cells["A10"].Value = "4. Fill in all questions in Part1-Part7 sheets";
        sheet.Cells["A11"].Value = "5. Make sure total questions = 200";

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
        sheet.Cells["C2"].Value = "Image URL";
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
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-office-meeting.jpg",
                  A = "They're sitting at a table.", B = "They're leaving the building.", C = "They're writing on a board.", D = "They're standing in a line.", Correct = "They're sitting at a table.", Explanation = "The photo shows people seated around a conference table in a meeting." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-construction.jpg",
                  A = "A building is being constructed.", B = "Workers are having lunch.", C = "The crane is being taken down.", D = "Materials are being delivered.", Correct = "A building is being constructed.", Explanation = "The image depicts an active construction site with ongoing building work." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-parking-lot.jpg",
                  A = "Cars are parked in rows.", B = "A vehicle is being washed.", C = "People are getting out of cars.", D = "The lot is completely empty.", Correct = "Cars are parked in rows.", Explanation = "The photograph shows a parking lot with vehicles arranged in organized rows." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-woman-laptop.jpg",
                  A = "She's closing her laptop.", B = "She's typing on a keyboard.", C = "She's talking on the phone.", D = "She's reading a document.", Correct = "She's typing on a keyboard.", Explanation = "The woman in the photo is actively working on her laptop computer." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-grocery-store.jpg",
                  A = "Shelves are being stocked.", B = "Customers are standing in line.", C = "Products are displayed on shelves.", D = "The store is closed.", Correct = "Products are displayed on shelves.", Explanation = "The image shows a retail environment with merchandise arranged on store shelves." },
            new { Content = "Look at the photograph. Listen to the four statements and choose the one that best describes what you see.", Image = "https://example.com/images/part1-bridge.jpg",
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
        sheet.Columns[3].Width = 40;
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
}
