using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(IInvoiceService invoiceService, ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAllInvoices()
    {
        var invoices = await _invoiceService.GetAllInvoicesAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
        if (invoice == null)
        {
            return NotFound();
        }
        // TODO: Add authorization check for patients to only view their own invoices
        return Ok(invoice);
    }

    [HttpGet("number/{invoiceNumber}")]
    [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
    public async Task<ActionResult<InvoiceDto>> GetInvoiceByNumber(string invoiceNumber)
    {
        var invoice = await _invoiceService.GetInvoiceByInvoiceNumberAsync(invoiceNumber);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByPatient(int patientId)
    {
        // TODO: Add authorization check for patients to only view their own invoices
        var invoices = await _invoiceService.GetInvoicesByPatientAsync(patientId);
        return Ok(invoices);
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByStatus(string status)
    {
        var invoices = await _invoiceService.GetInvoicesByStatusAsync(status);
        return Ok(invoices);
    }

    [HttpGet("date-range")]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var invoices = await _invoiceService.GetInvoicesByDateRangeAsync(startDate, endDate);
        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice(CreateInvoiceDto createInvoiceDto)
    {
        try
        {
            var invoice = await _invoiceService.CreateInvoiceAsync(createInvoiceDto);
            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invoice");
            return BadRequest(new { message = "Error creating invoice", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> UpdateInvoice(int id, UpdateInvoiceDto updateInvoiceDto)
    {
        try
        {
            await _invoiceService.UpdateInvoiceAsync(id, updateInvoiceDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating invoice");
            return BadRequest(new { message = "Error updating invoice", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        try
        {
            await _invoiceService.DeleteInvoiceAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting invoice");
            return BadRequest(new { message = "Error deleting invoice", error = ex.Message });
        }
    }

    [HttpGet("{id}/pdf")]
    [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
    public async Task<IActionResult> DownloadInvoicePdf(int id)
    {
        try
        {
            var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"invoice-{id}.pdf");
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating invoice PDF");
            return BadRequest(new { message = "Error generating invoice PDF", error = ex.Message });
        }
    }

    // Payment endpoints
    [HttpPost("payments")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<PaymentDto>> CreatePayment(CreatePaymentDto createPaymentDto)
    {
        try
        {
            var payment = await _invoiceService.CreatePaymentAsync(createPaymentDto);
            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment");
            return BadRequest(new { message = "Error creating payment", error = ex.Message });
        }
    }

    [HttpGet("payments/{id}")]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<ActionResult<PaymentDto>> GetPayment(int id)
    {
        var payment = await _invoiceService.GetPaymentByIdAsync(id);
        if (payment == null)
        {
            return NotFound();
        }
        return Ok(payment);
    }

    [HttpGet("{invoiceId}/payments")]
    [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByInvoice(int invoiceId)
    {
        var payments = await _invoiceService.GetPaymentsByInvoiceAsync(invoiceId);
        return Ok(payments);
    }

    [HttpPut("payments/{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> UpdatePayment(int id, UpdatePaymentDto updatePaymentDto)
    {
        try
        {
            await _invoiceService.UpdatePaymentAsync(id, updatePaymentDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payment");
            return BadRequest(new { message = "Error updating payment", error = ex.Message });
        }
    }

    [HttpDelete("payments/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        try
        {
            await _invoiceService.DeletePaymentAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting payment");
            return BadRequest(new { message = "Error deleting payment", error = ex.Message });
        }
    }
}

