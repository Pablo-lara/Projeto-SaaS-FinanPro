using FinanPro.Application.DTOs;
using FinanPro.Domain.Entities;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace FinanPro.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.Categories.ToListAsync();

        if (!categories.Any())
        {
            var defaultCategories = new List<Category>
                {
                    new Category { Name = "Vendas / Serviços", Type = (TransactionType)0 }, // 0 = Income / Receita
                    new Category { Name = "Investimentos", Type = (TransactionType)0 },
                    new Category { Name = "Alimentação", Type = (TransactionType)1 },      // 1 = Expense / Despesa
                    new Category { Name = "Infraestrutura / Software", Type = (TransactionType)1 },
                    new Category { Name = "Salários / Pro-labore", Type = (TransactionType)1 },
                    new Category { Name = "Impostos", Type = (TransactionType)1 }
                };

            _context.Categories.AddRange(defaultCategories);
            await _context.SaveChangesAsync();
            categories = defaultCategories;
        }

        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var category = new Category { Name = dto.Name, Type = dto.Type };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new CategoryResponseDto(category.Id, category.Name, category.Type));
    }
}