using EHosp.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace EHosp.Domain.Entities;  

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Foreign keys
    public int RoleId { get; set; }

    // Navigation properties
    public virtual Role Role { get; set; } = null!;
    public virtual Doctor? Doctor { get; set; }
    public virtual Patient? Patient { get; set; }
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual NotificationPreference? NotificationPreference { get; set; }
    public virtual ICollection<Admission> CreatedAdmissions { get; set; } = new List<Admission>();
    public virtual ICollection<RoomTransfer> CreatedRoomTransfers { get; set; } = new List<RoomTransfer>();
}