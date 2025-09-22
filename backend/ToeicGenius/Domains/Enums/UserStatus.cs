using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.Enums
{
	public enum UserStatus
	{
		Active = 1,
		Deleted = -1,
		Banned = 0
	}
}
