namespace FinanPro.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string CnpjOrCpf { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid PlanId { get; set; }
    public string SubscriptionStatus { get; set; } = "Active"; // Active, Canceled, Pending
}