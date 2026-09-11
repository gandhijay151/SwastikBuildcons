using Microsoft.EntityFrameworkCore;
using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<IndustrialProject> IndustrialProjects => Set<IndustrialProject>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.ToTable("Leads");
            entity.HasKey(lead => lead.Id);
            entity.Property(lead => lead.Name).HasMaxLength(120).IsRequired();
            entity.Property(lead => lead.Phone).HasMaxLength(20).IsRequired();
            entity.Property(lead => lead.Email).HasMaxLength(160);
            entity.Property(lead => lead.ProjectType).HasMaxLength(80).IsRequired();
            entity.Property(lead => lead.Budget).HasMaxLength(80).IsRequired();
            entity.Property(lead => lead.Message).HasMaxLength(1500);
            entity.Property(lead => lead.Status).HasMaxLength(40).IsRequired();
            entity.Property(lead => lead.CreatedAtUtc).HasDefaultValueSql("now()");
            entity.HasIndex(lead => lead.CreatedAtUtc);
            entity.HasIndex(lead => lead.Phone);
        });

        modelBuilder.Entity<IndustrialProject>(entity =>
        {
            entity.ToTable("IndustrialProjects");
            entity.HasKey(ip => ip.Id);
            entity.Property(ip => ip.ProjectName).HasMaxLength(120).IsRequired();
            entity.Property(ip => ip.ClientName).HasMaxLength(120).IsRequired();
            entity.Property(ip => ip.Location).HasMaxLength(200).IsRequired();
            entity.Property(ip => ip.ProjectType).HasMaxLength(100).IsRequired();
            entity.Property(ip => ip.Status).HasMaxLength(50).IsRequired();
            entity.Property(ip => ip.Description).HasMaxLength(500);
            entity.Property(ip => ip.ScopeOfWork).HasMaxLength(1000);
            entity.Property(ip => ip.ProjectManager).HasMaxLength(200);
            // Plain calendar dates (no timezone semantics) → timestamp without time zone,
            // so Npgsql accepts DateTime values regardless of Kind.
            entity.Property(ip => ip.StartDate).HasColumnType("timestamp without time zone");
            entity.Property(ip => ip.EstimatedCompletionDate).HasColumnType("timestamp without time zone");
            entity.Property(ip => ip.ActualCompletionDate).HasColumnType("timestamp without time zone");
            entity.Property(ip => ip.IsPublished).HasDefaultValue(false);
            entity.Property(ip => ip.UpdatedBy).HasMaxLength(120);
            entity.Property(ip => ip.BudgetAmount).HasColumnType("decimal(18,2)");
            entity.Property(ip => ip.ActualCostToDate).HasColumnType("decimal(18,2)");
            entity.Property(ip => ip.CreatedAtUtc).HasDefaultValueSql("now()");
            entity.Property(ip => ip.UpdatedAtUtc).HasDefaultValueSql("now()");
            entity.HasIndex(ip => ip.IsPublished);
            entity.HasIndex(ip => ip.Status);
            entity.HasIndex(ip => ip.StartDate);
            entity.HasIndex(ip => ip.EstimatedCompletionDate);
        });

        modelBuilder.Entity<Testimonial>(entity =>
        {
            entity.ToTable("Testimonials");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.ClientName).HasMaxLength(120).IsRequired();
            entity.Property(t => t.Company).HasMaxLength(160);
            entity.Property(t => t.Quote).HasMaxLength(1000).IsRequired();
            entity.Property(t => t.IsPublished).HasDefaultValue(false);
            entity.Property(t => t.UpdatedBy).HasMaxLength(120);
            entity.Property(t => t.CreatedAtUtc).HasDefaultValueSql("now()");
            entity.Property(t => t.UpdatedAtUtc).HasDefaultValueSql("now()");
            entity.HasIndex(t => t.IsPublished);
            entity.HasOne(t => t.Project)
                  .WithMany()
                  .HasForeignKey(t => t.ProjectId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
