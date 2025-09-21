using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Persistence
{
	public class ToeicGeniusDbContext : DbContext
	{
		public ToeicGeniusDbContext(DbContextOptions<ToeicGeniusDbContext> options) : base(options) { }
		public DbSet<User> Users => Set<User>();
		public DbSet<Role> Roles => Set<Role>();
		public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
		public DbSet<UserOtp> UserOtps => Set<UserOtp>();

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			// Many-to-many User <-> Role
			modelBuilder.Entity<User>()
				.HasMany(u => u.Roles)
				.WithMany(r => r.Users)
				.UsingEntity<Dictionary<string, object>>(
					"UserRoles",
					j => j.HasOne<Role>().WithMany().HasForeignKey("RoleId"),
					j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
					j =>
					{
						j.HasKey("UserId", "RoleId");
						j.ToTable("UserRoles");
					}
				);

			modelBuilder.Entity<RefreshToken>()
				.HasOne(rt => rt.User)
				.WithMany(u => u.RefreshTokens)
				.HasForeignKey(rt => rt.UserId);

			// Default values
			modelBuilder.Entity<User>()
				.Property(u => u.CreatedAt)
				.HasDefaultValueSql("SYSUTCDATETIME()");

			modelBuilder.Entity<RefreshToken>()
				.Property(rt => rt.CreatedAt)
				.HasDefaultValueSql("SYSUTCDATETIME()");

			// Seed Roles
			modelBuilder.Entity<Role>().HasData(
				new Role { Id = 1, RoleName = "Admin" },
				new Role { Id = 2, RoleName = "User" }
			);
		}
	}
}
