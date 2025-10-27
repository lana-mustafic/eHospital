namespace EHosp.Domain.Entities;
public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Cardiology, Neurology, etc.
    public string Description { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}