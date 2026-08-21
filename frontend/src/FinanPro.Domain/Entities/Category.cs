namespace FinanPro.Domain.Entities;

public enum TransactionType
{
    Income = 0,  // Receita
    Expense = 1  // Despesa
}

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty; // ex: Alimentação, Marketing, Impostos
    public TransactionType Type { get; set; }
}