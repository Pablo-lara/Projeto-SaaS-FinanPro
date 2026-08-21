namespace FinanPro.Domain.Entities;

public class Account : BaseEntity
{
    public string Name { get; set; } = string.Empty; // ex: Itaú, Bradesco, Carteira
    public decimal Balance { get; set; }
}