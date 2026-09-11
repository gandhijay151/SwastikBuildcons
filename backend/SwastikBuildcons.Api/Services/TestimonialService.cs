using Microsoft.EntityFrameworkCore;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Services;

public class TestimonialService : ITestimonialService
{
    private readonly AppDbContext _context;

    public TestimonialService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PublicTestimonialResponse>> GetPublishedAsync(CancellationToken cancellationToken)
    {
        var testimonials = await _context.Testimonials
            .AsNoTracking()
            .Where(t => t.IsPublished)
            .OrderByDescending(t => t.Id)
            .ToListAsync(cancellationToken);

        return testimonials.Select(ToPublicResponse).ToList();
    }

    public async Task<IReadOnlyList<TestimonialResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var testimonials = await _context.Testimonials
            .AsNoTracking()
            .OrderByDescending(t => t.Id)
            .ToListAsync(cancellationToken);

        return testimonials.Select(ToAdminResponse).ToList();
    }

    public async Task<TestimonialResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var testimonial = await _context.Testimonials
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        return testimonial is null ? null : ToAdminResponse(testimonial);
    }

    public async Task<TestimonialResponse> CreateAsync(CreateTestimonialRequest request, CancellationToken cancellationToken, string? createdBy = null)
    {
        var now = DateTimeOffset.UtcNow;
        var testimonial = new Testimonial
        {
            ClientName = request.ClientName.Trim(),
            Company = string.IsNullOrWhiteSpace(request.Company) ? null : request.Company.Trim(),
            Quote = request.Quote.Trim(),
            Rating = request.Rating,
            ProjectId = request.ProjectId,
            IsPublished = request.IsPublished,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            UpdatedBy = string.IsNullOrWhiteSpace(createdBy) ? null : createdBy
        };

        _context.Testimonials.Add(testimonial);
        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(testimonial);
    }

    public async Task<TestimonialResponse?> UpdateAsync(int id, UpdateTestimonialRequest request, CancellationToken cancellationToken, string? updatedBy = null)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (testimonial is null)
        {
            return null;
        }

        testimonial.ClientName = request.ClientName.Trim();
        testimonial.Company = string.IsNullOrWhiteSpace(request.Company) ? null : request.Company.Trim();
        testimonial.Quote = request.Quote.Trim();
        testimonial.Rating = request.Rating;
        testimonial.ProjectId = request.ProjectId;
        testimonial.IsPublished = request.IsPublished;
        testimonial.UpdatedAtUtc = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(updatedBy))
        {
            testimonial.UpdatedBy = updatedBy;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(testimonial);
    }

    public async Task<TestimonialResponse?> SetPublishedAsync(int id, bool isPublished, CancellationToken cancellationToken, string? updatedBy = null)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (testimonial is null)
        {
            return null;
        }

        testimonial.IsPublished = isPublished;
        testimonial.UpdatedAtUtc = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(updatedBy))
        {
            testimonial.UpdatedBy = updatedBy;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(testimonial);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (testimonial is null)
        {
            return false;
        }

        _context.Testimonials.Remove(testimonial);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static TestimonialResponse ToAdminResponse(Testimonial t) =>
        new TestimonialResponse(
            t.Id,
            t.ClientName,
            t.Company,
            t.Quote,
            t.Rating,
            t.ProjectId,
            t.IsPublished,
            t.CreatedAtUtc,
            t.UpdatedBy);

    private static PublicTestimonialResponse ToPublicResponse(Testimonial t) =>
        new PublicTestimonialResponse(
            t.Id,
            t.ClientName,
            t.Company,
            t.Quote,
            t.Rating,
            t.ProjectId);
}
