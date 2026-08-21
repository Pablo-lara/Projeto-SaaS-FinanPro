namespace FinanPro.Application.DTOs;

public record CategorySummaryDto(string CategoryName, decimal TotalAmount);

public record DashboardOverviewDto(
    decimal CurrentBalance,
    decimal TotalIncome,
    decimal TotalExpenses,
    List<CategorySummaryDto> ExpensesByCategory
);