namespace ToeicGenius.Shared.Constants
{
	public static class NumberConstants
	{
		public const int MinPasswordLength = 8;
		public const int MaxPasswordLength = 100;
		public const int DefaultPageSize = 1;
		public const int DefaultFirstPage = 1;
		public const int MaxRetryCount = 5;
		public const int MaxQuantityOption = 4;
		public const int MinQuantityOption = 3;

		// Test Duration (in minutes)
		public const int LRDuration = 120;
		public const int SpeakingDuration = 20;
		public const int WritingDuration = 60;
		public const int SWDuration = 80; // Speaking (20) + Writing (60) 

		// Quantity question of each part - Simulator test
		// Listening
		public const int QuantityListeningP1 = 6;
		public const int QuantityListeningP2 = 25;
		public const int QuantityListeningP3 = 39;
		public const int QuantityListeningP4 = 30;

		// Reading
		public const int QuantityReadingP5 = 30;
		public const int QuantityReadingP6 = 16;
		public const int QuantityReadingP7 = 54;

		// Speaking
		public const int QuantitySpeakingP1 = 5;
		public const int QuantitySpeakingP2 = 2;
		public const int QuantitySpeakingP3 = 1;

		// Writing
		public const int QuantityWritingP1 = 2;
		public const int QuantityWritingP2 = 2;
		public const int QuantityWritingP3 = 1;
		public const int QuantityWritingP4 = 1;
		public const int QuantityWritingP5 = 1;

		// Total
		public const int TotalQuantityWriting = 8;
		public const int TotalQuantitySpeaking = 7;
		public const int TotalQuantityListening = 100;
		public const int TotalQuantityReading = 100;

		public const int MinQuantityQuestionInGroup = 2;
		public const int MaxQuantityQuestionInGroup = 5;

		public const int FirstOrderNumber = 1;
		public const int FirstVersion = 1;

	}
}
