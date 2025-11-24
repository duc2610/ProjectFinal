using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.AdminDashboard;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers;

[Route("api/admin/dashboard")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _adminDashboardService;

    public AdminDashboardController(IAdminDashboardService adminDashboardService)
    {
        _adminDashboardService = adminDashboardService;
    }

    /// <summary>
    /// Lấy thống kê tổng quan cho Admin Dashboard
    /// </summary>
    /// <returns>Thống kê tổng số người dùng, bài thi, câu hỏi, kết quả thi</returns>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<AdminDashboardStatisticsResponseDto>>> GetDashboardStatistics()
    {
        var statistics = await _adminDashboardService.GetDashboardStatisticsAsync();
        return Ok(new ApiResponse<AdminDashboardStatisticsResponseDto>
        {
            Data = statistics,
            Message = "Lấy thống kê thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy thống kê người dùng theo tháng
    /// </summary>
    /// <param name="months">Số tháng cần lấy thống kê (mặc định 12 tháng)</param>
    /// <returns>Danh sách thống kê người dùng theo từng tháng</returns>
    [HttpGet("users/monthly")]
    public async Task<ActionResult<ApiResponse<List<UserStatisticsByMonthResponseDto>>>> GetUserStatisticsByMonth([FromQuery] int months = 12)
    {
        var statistics = await _adminDashboardService.GetUserStatisticsByMonthAsync(months);
        return Ok(new ApiResponse<List<UserStatisticsByMonthResponseDto>>
        {
            Data = statistics,
            Message = "Lấy thống kê người dùng theo tháng thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy thống kê số lượng bài thi hoàn thành theo ngày
    /// </summary>
    /// <param name="days">Số ngày cần lấy thống kê (mặc định 7 ngày)</param>
    /// <returns>Danh sách thống kê bài thi hoàn thành theo từng ngày</returns>
    [HttpGet("tests/completions")]
    public async Task<ActionResult<ApiResponse<List<TestCompletionsByDayResponseDto>>>> GetTestCompletionsByDay([FromQuery] int days = 7)
    {
        var completions = await _adminDashboardService.GetTestCompletionsByDayAsync(days);
        return Ok(new ApiResponse<List<TestCompletionsByDayResponseDto>>
        {
            Data = completions,
            Message = "Lấy thống kê hoàn thành bài thi thành công",
            StatusCode = 200
        });
    }

    /// <summary>
    /// Lấy danh sách hoạt động gần đây
    /// </summary>
    /// <param name="limit">Số lượng hoạt động cần lấy (mặc định 20)</param>
    /// <returns>Danh sách các hoạt động gần đây (đăng ký, hoàn thành bài thi, bị cấm, tạo bài thi)</returns>
    [HttpGet("activities/recent")]
    public async Task<ActionResult<ApiResponse<List<RecentActivityResponseDto>>>> GetRecentActivities([FromQuery] int limit = 20)
    {
        var activities = await _adminDashboardService.GetRecentActivitiesAsync(limit);
        return Ok(new ApiResponse<List<RecentActivityResponseDto>>
        {
            Data = activities,
            Message = "Lấy hoạt động gần đây thành công",
            StatusCode = 200
        });
    }
}
