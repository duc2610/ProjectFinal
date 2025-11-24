namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class TestStartRequestDto
	{
		public int Id { get; set; }
		public bool IsSelectTime { get; set; } = true; // Tính giờ hoặc không tính giờ.
	}
}
