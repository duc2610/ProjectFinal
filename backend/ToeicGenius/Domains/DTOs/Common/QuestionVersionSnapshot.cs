using ToeicGenius.Domains.DTOs.Responses.Question;

namespace ToeicGenius.Domains.DTOs.Common
{
	/// <summary>
	/// Represents a single version of a question snapshot
	/// </summary>
	public class QuestionVersionSnapshot
	{
		public int Version { get; set; }
		public QuestionSnapshotDto Snapshot { get; set; } = null!;
		public DateTime CreatedAt { get; set; }
	}

	/// <summary>
	/// Container for all versions of a question
	/// </summary>
	public class QuestionVersionHistory
	{
		public List<QuestionVersionSnapshot> Versions { get; set; } = new();

		/// <summary>
		/// Get the latest version number
		/// </summary>
		public int CurrentVersion => Versions.Any() ? Versions.Max(v => v.Version) : 1;

		/// <summary>
		/// Get snapshot by version number
		/// </summary>
		public QuestionSnapshotDto? GetSnapshot(int version)
		{
			return Versions.FirstOrDefault(v => v.Version == version)?.Snapshot;
		}

		/// <summary>
		/// Get the latest snapshot
		/// </summary>
		public QuestionSnapshotDto? GetLatestSnapshot()
		{
			var latestVersion = Versions.OrderByDescending(v => v.Version).FirstOrDefault();
			return latestVersion?.Snapshot;
		}

		/// <summary>
		/// Add a new version
		/// </summary>
		public void AddVersion(QuestionSnapshotDto snapshot, DateTime createdAt)
		{
			var newVersion = new QuestionVersionSnapshot
			{
				Version = CurrentVersion + 1,
				Snapshot = snapshot,
				CreatedAt = createdAt
			};
			Versions.Add(newVersion);
		}

		/// <summary>
		/// Initialize with first version
		/// </summary>
		public static QuestionVersionHistory CreateInitial(QuestionSnapshotDto snapshot, DateTime createdAt)
		{
			var history = new QuestionVersionHistory();
			history.Versions.Add(new QuestionVersionSnapshot
			{
				Version = 1,
				Snapshot = snapshot,
				CreatedAt = createdAt
			});
			return history;
		}
	}
}
