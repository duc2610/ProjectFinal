using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
    public class Flashcard
    {
        [Key]
        public int CardId { get; set; }

        [Required]
        public int SetId { get; set; }
        public FlashcardSet FlashcardSet { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Term { get; set; } = string.Empty; 

        public string? Definition { get; set; } 
        [MaxLength(255)]
        public string? Pronunciation { get; set; } 

        public string? ImageUrl { get; set; } 

        [MaxLength(50)]
        public string? WordType { get; set; } 

        public string? Examples { get; set; } 

        public string? Notes { get; set; } 

        public string? AudioUrl { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<FlashcardProgress> Progresses { get; set; } = new List<FlashcardProgress>();
    }
}



