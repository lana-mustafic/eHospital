namespace EHosp.Domain.Entities;
public class Medication
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty; // Tablet, Syrup, Injection
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ActiveIngredient { get; set; } // For interaction checking

    // Navigation properties
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    public ICollection<DrugInteraction> InteractionsAsMedication1 { get; set; } = new List<DrugInteraction>();
    public ICollection<DrugInteraction> InteractionsAsMedication2 { get; set; } = new List<DrugInteraction>();
}
