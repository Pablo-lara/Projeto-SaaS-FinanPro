namespace FinanPro.Domain.Entities;

public class Transaction : BaseEntity
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public TransactionType Type { get; set; }

    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}