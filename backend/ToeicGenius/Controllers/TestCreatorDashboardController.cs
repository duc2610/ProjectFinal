using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers;

[Route("api/test-creator/dashboard")]
[ApiController]
[Authorize(Roles = "TestCreator")]
public class TestCreatorDashboardController : ControllerBase
{
    private readonly ITestCreatorDashboardService _testCreatorDashboardService;

    public TestCreatorDashboardController(ITestCreatorDashboardService testCreatorDashboardService)
    {
        _testCreatorDashboardService = testCreatorDashboardService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }

    /// <summary>
    /// Lấy thống kê tổng quan cho Test Creator Dashboard
    /// </summary>
    /// <returns>Thống kê tổng số bài thi, câu hỏi, kết quả thi, điểm trung bình</returns>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<TestCreatorDashboardStatisticsResponseDto>>> GetDashboardStatistics()
    {
        var creatorId = GetCurrentUserId();
        var statistics = await _testCreatorDashboardService.GetDashboardStatisticsAsync(creatorId);

        return Ok(new ApiResponse<TestCreatorDashboardStatisticsResponseDto>
        {
            Data = statistics,
            Message = "Lấy thống kê thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy hiệu suất bài thi theo ngày
    /// </summary>
    /// <param name="days">Số ngày cần lấy thống kê (mặc định 7 ngày)</param>
    /// <returns>Danh sách hiệu suất bài thi theo từng ngày (số lượt hoàn thành và điểm TB)</returns>
    [HttpGet("performance/daily")]
    public async Task<ActionResult<ApiResponse<List<TestPerformanceByDayResponseDto>>>> GetTestPerformanceByDay([FromQuery] int days = 7)
    {
        var creatorId = GetCurrentUserId();
        var performance = await _testCreatorDashboardService.GetTestPerformanceByDayAsync(creatorId, days);

        return Ok(new ApiResponse<List<TestPerformanceByDayResponseDto>>
        {
            Data = performance,
            Message = "Lấy hiệu suất bài thi thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy danh sách top bài thi hiệu suất cao
    /// </summary>
    /// <param name="limit">Số lượng bài thi cần lấy (mặc định 5)</param>
    /// <returns>Danh sách top bài thi với số lượt hoàn thành và điểm trung bình cao nhất</returns>
    [HttpGet("tests/top")]
    public async Task<ActionResult<ApiResponse<List<TopPerformingTestResponseDto>>>> GetTopPerformingTests([FromQuery] int limit = 5)
    {
        var creatorId = GetCurrentUserId();
        var topTests = await _testCreatorDashboardService.GetTopPerformingTestsAsync(creatorId, limit);

        return Ok(new ApiResponse<List<TopPerformingTestResponseDto>>
        {
            Data = topTests,
            Message = "Lấy top bài thi thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy danh sách hoạt động gần đây
    /// </summary>
    /// <param name="limit">Số lượng hoạt động cần lấy (mặc định 20)</param>
    /// <returns>Danh sách các hoạt động gần đây (tạo bài thi, thêm câu hỏi, xuất bản, cập nhật)</returns>
    [HttpGet("activities/recent")]
    public async Task<ActionResult<ApiResponse<List<TestCreatorRecentActivityResponseDto>>>> GetRecentActivities([FromQuery] int limit = 20)
    {
        var creatorId = GetCurrentUserId();
        var activities = await _testCreatorDashboardService.GetRecentActivitiesAsync(creatorId, limit);

        return Ok(new ApiResponse<List<TestCreatorRecentActivityResponseDto>>
        {
            Data = activities,
            Message = "Lấy hoạt động gần đây thành công",
            StatusCode = 200
        });
    }
}
