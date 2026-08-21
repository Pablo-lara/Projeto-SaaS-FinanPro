using FinanPro.Application.Common.Interfaces;
using FinanPro.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantProvider? _tenantProvider;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantProvider? tenantProvider = null) : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Global Query Filters (Acesse o método do provider dentro da lambda)
        modelBuilder.Entity<Account>()
            .HasQueryFilter(a => a.TenantId == _tenantProvider.GetTenantId());

        modelBuilder.Entity<Category>()
            .HasQueryFilter(c => c.TenantId == _tenantProvider.GetTenantId());

        modelBuilder.Entity<Transaction>()
            .HasQueryFilter(t => t.TenantId == _tenantProvider.GetTenantId());

        // 2. Mapeamento de precisão decimal
        modelBuilder.Entity<Account>()
            .Property(a => a.Balance)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantProvider?.GetTenantId() ?? Guid.Empty;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                entry.Entity.TenantId = tenantId;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}