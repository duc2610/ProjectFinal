using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
    public class FlashcardProgress
    {
        [Key]
        public int ProgressId { get; set; }

        [Required]
        public int CardId { get; set; }
        public Flashcard Flashcard { get; set; } = null!;

        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public int ReviewCount { get; set; } = 0; 
        public int CorrectCount { get; set; } = 0; 
        public int IncorrectCount { get; set; } = 0; 

        [MaxLength(50)]
        public string Status { get; set; } = "new"; 

        public DateTime? LastReviewedAt { get; set; }
        public DateTime? NextReviewAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}



