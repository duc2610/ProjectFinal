namespace ToeicGenius.Domains.Enums
{
	public enum TestResultStatus
	{
		InProgress = 0, // Người dùng vừa bắt đầu hoặc đang làm bài (chưa nộp).
		//Abandoned = 1, // Bài thi bị bỏ dở (thoát ra hoặc disconnect nhưng ko resume sau 30p).
		Graded = 2 // Bài đã được chấm điểm.
	}
}
