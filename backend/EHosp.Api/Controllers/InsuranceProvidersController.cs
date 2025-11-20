using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InsuranceProvidersController : ControllerBase
{
    private readonly IInsuranceProviderService _providerService;
    private readonly ILogger<InsuranceProvidersController> _logger;

    public InsuranceProvidersController(
        IInsuranceProviderService providerService,
        ILogger<InsuranceProvidersController> logger)
    {
        _providerService = providerService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<InsuranceProviderDto>>> GetAllProviders([FromQuery] bool activeOnly = false)
    {
        var providers = activeOnly
            ? await _providerService.GetActiveProvidersAsync()
            : await _providerService.GetAllProvidersAsync();
        return Ok(providers);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<InsuranceProviderDto>> GetProvider(int id)
    {
        var provider = await _providerService.GetProviderByIdAsync(id);
        if (provider == null)
        {
            return NotFound();
        }
        return Ok(provider);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InsuranceProviderDto>> CreateProvider(CreateInsuranceProviderDto createDto)
    {
        try
        {
            var provider = await _providerService.CreateProviderAsync(createDto);
            return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProvider(int id, UpdateInsuranceProviderDto updateDto)
    {
        try
        {
            await _providerService.UpdateProviderAsync(id, updateDto);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProvider(int id)
    {
        try
        {
            await _providerService.DeleteProviderAsync(id);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }
}

