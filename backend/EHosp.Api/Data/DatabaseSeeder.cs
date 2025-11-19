using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EHosp.Api.Data;

public static class DatabaseSeeder
{
    private const string DefaultAdminEmail = "admin@ehospital.com";
    private const string DefaultAdminPassword = "Admin@123";
    private const string DefaultPassword = "Password@123";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var loggerFactory = scope.ServiceProvider.GetService<ILoggerFactory>();
        var logger = loggerFactory?.CreateLogger("DatabaseSeeder");

        try
        {
            await context.Database.MigrateAsync();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("pending changes"))
        {
            logger?.LogWarning("Database model has pending changes. Please create a migration: dotnet ef migrations add <MigrationName>");
        }

        // Seed Admin User
        if (!await context.Users.AnyAsync(u => u.Email == DefaultAdminEmail))
        {
            var adminRoleId = await context.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => (int?)r.Id)
                .FirstOrDefaultAsync() ?? 1;

            var adminUser = new User
            {
                Email = DefaultAdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultAdminPassword, 13),
                FirstName = "System",
                LastName = "Administrator",
                PhoneNumber = "123-456-7890",
                RoleId = adminRoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // Seed additional users and data
        await SeedUsersAndStaff(context, logger);
        await SeedPatients(context, logger);
        await SeedAppointments(context, logger);
        await SeedQueues(context, logger);
        await SeedEDVisits(context, logger);
        await SeedMedicalRecords(context, logger);
        await SeedVitalSigns(context, logger);
        await SeedInvoices(context, logger);
        await SeedRoomsAndBeds(context, logger);
        await SeedPharmacyData(context, logger);

        logger?.LogInformation("Database seeding completed successfully");
    }

    private static async Task SeedUsersAndStaff(ApplicationDbContext context, ILogger? logger)
    {
        var doctorRoleId = await context.Roles.Where(r => r.Name == "Doctor").Select(r => r.Id).FirstOrDefaultAsync();
        var nurseRoleId = await context.Roles.Where(r => r.Name == "Nurse").Select(r => r.Id).FirstOrDefaultAsync();
        var receptionistRoleId = await context.Roles.Where(r => r.Name == "Receptionist").Select(r => r.Id).FirstOrDefaultAsync();
        var departments = await context.Departments.ToListAsync();

        if (departments.Count == 0) return;

        // Seed Doctors
        if (!await context.Doctors.AnyAsync())
        {
            var doctors = new[]
            {
                new { FirstName = "John", LastName = "Smith", Email = "john.smith@ehospital.com", Specialization = "Cardiology", Department = departments[0], License = "MD-001", Experience = 15 },
                new { FirstName = "Sarah", LastName = "Johnson", Email = "sarah.johnson@ehospital.com", Specialization = "Neurology", Department = departments[1], License = "MD-002", Experience = 12 },
                new { FirstName = "Michael", LastName = "Brown", Email = "michael.brown@ehospital.com", Specialization = "Pediatrics", Department = departments[2], License = "MD-003", Experience = 10 },
                new { FirstName = "Emily", LastName = "Davis", Email = "emily.davis@ehospital.com", Specialization = "Emergency Medicine", Department = departments[0], License = "MD-004", Experience = 8 }
            };

            foreach (var doc in doctors)
            {
                var user = new User
                {
                    Email = doc.Email,
                    PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultPassword, 13),
                    FirstName = doc.FirstName,
                    LastName = doc.LastName,
                    PhoneNumber = $"555-{Random.Shared.Next(1000, 9999)}",
                    RoleId = doctorRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(user);
                await context.SaveChangesAsync();

                var doctor = new Doctor
                {
                    UserId = user.Id,
                    DepartmentId = doc.Department.Id,
                    Specialization = doc.Specialization,
                    LicenseNumber = doc.License,
                    YearsOfExperience = doc.Experience
                };
                context.Doctors.Add(doctor);
            }
            await context.SaveChangesAsync();
        }

        // Seed Nurses
        if (!await context.Users.AnyAsync(u => u.RoleId == nurseRoleId && u.Email != DefaultAdminEmail))
        {
            var nurses = new[]
            {
                new { FirstName = "Lisa", LastName = "Anderson", Email = "lisa.anderson@ehospital.com" },
                new { FirstName = "Robert", LastName = "Wilson", Email = "robert.wilson@ehospital.com" },
                new { FirstName = "Jennifer", LastName = "Martinez", Email = "jennifer.martinez@ehospital.com" }
            };

            foreach (var nurse in nurses)
            {
                context.Users.Add(new User
                {
                    Email = nurse.Email,
                    PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultPassword, 13),
                    FirstName = nurse.FirstName,
                    LastName = nurse.LastName,
                    PhoneNumber = $"555-{Random.Shared.Next(1000, 9999)}",
                    RoleId = nurseRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }

        // Seed Receptionists
        if (!await context.Users.AnyAsync(u => u.RoleId == receptionistRoleId))
        {
            var receptionists = new[]
            {
                new { FirstName = "Amanda", LastName = "Taylor", Email = "amanda.taylor@ehospital.com" },
                new { FirstName = "David", LastName = "Thomas", Email = "david.thomas@ehospital.com" }
            };

            foreach (var rec in receptionists)
            {
                context.Users.Add(new User
                {
                    Email = rec.Email,
                    PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultPassword, 13),
                    FirstName = rec.FirstName,
                    LastName = rec.LastName,
                    PhoneNumber = $"555-{Random.Shared.Next(1000, 9999)}",
                    RoleId = receptionistRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedPatients(ApplicationDbContext context, ILogger? logger)
    {
        var patientRoleId = await context.Roles.Where(r => r.Name == "Patient").Select(r => r.Id).FirstOrDefaultAsync();

        if (!await context.Patients.AnyAsync())
        {
            var patients = new[]
            {
                new { FirstName = "James", LastName = "Miller", Email = "james.miller@email.com", DOB = new DateTime(1985, 5, 15), Gender = "Male", BloodType = "O+" },
                new { FirstName = "Patricia", LastName = "Garcia", Email = "patricia.garcia@email.com", DOB = new DateTime(1990, 8, 22), Gender = "Female", BloodType = "A+" },
                new { FirstName = "William", LastName = "Rodriguez", Email = "william.rodriguez@email.com", DOB = new DateTime(1978, 3, 10), Gender = "Male", BloodType = "B+" },
                new { FirstName = "Linda", LastName = "Lewis", Email = "linda.lewis@email.com", DOB = new DateTime(1992, 11, 5), Gender = "Female", BloodType = "AB+" },
                new { FirstName = "Richard", LastName = "Walker", Email = "richard.walker@email.com", DOB = new DateTime(1988, 7, 30), Gender = "Male", BloodType = "O-" },
                new { FirstName = "Barbara", LastName = "Hall", Email = "barbara.hall@email.com", DOB = new DateTime(1983, 2, 18), Gender = "Female", BloodType = "A-" }
            };

            foreach (var pat in patients)
            {
                var user = new User
                {
                    Email = pat.Email,
                    PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultPassword, 13),
                    FirstName = pat.FirstName,
                    LastName = pat.LastName,
                    PhoneNumber = $"555-{Random.Shared.Next(1000, 9999)}",
                    RoleId = patientRoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(user);
                await context.SaveChangesAsync();

                context.Patients.Add(new Patient
                {
                    UserId = user.Id,
                    DateOfBirth = pat.DOB,
                    Gender = pat.Gender,
                    BloodType = pat.BloodType,
                    Address = $"{Random.Shared.Next(100, 9999)} Main St, City, State {Random.Shared.Next(10000, 99999)}",
                    EmergencyContact = $"Emergency Contact - {Random.Shared.Next(100, 999)}-{Random.Shared.Next(100, 999)}-{Random.Shared.Next(1000, 9999)}"
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedAppointments(ApplicationDbContext context, ILogger? logger)
    {
        var doctors = await context.Doctors.Include(d => d.User).ToListAsync();
        var patients = await context.Patients.Include(p => p.User).ToListAsync();

        if (doctors.Count == 0 || patients.Count == 0) return;

        if (!await context.Appointments.AnyAsync())
        {
            var today = DateTime.Today;
            var statuses = new[] { "Scheduled", "Completed", "Checked-In", "Cancelled" };
            var reasons = new[]
            {
                "Routine checkup", "Chest pain", "Headache", "Fever and cough",
                "Annual physical", "Follow-up visit", "Back pain", "Dizziness"
            };

            for (int i = 0; i < 15; i++)
            {
                var doctor = doctors[Random.Shared.Next(doctors.Count)];
                var patient = patients[Random.Shared.Next(patients.Count)];
                var appointmentDate = today.AddDays(Random.Shared.Next(-7, 14));
                var hour = Random.Shared.Next(9, 17);
                var minute = Random.Shared.Next(0, 4) * 15;
                var startTime = new TimeSpan(hour, minute, 0);
                var endTime = startTime.Add(new TimeSpan(0, 30, 0));

                var status = appointmentDate < today ? 
                    (Random.Shared.Next(2) == 0 ? "Completed" : "Cancelled") : 
                    statuses[Random.Shared.Next(statuses.Length)];

                context.Appointments.Add(new Appointment
                {
                    PatientId = patient.Id,
                    DoctorId = doctor.Id,
                    AppointmentDate = appointmentDate,
                    StartTime = startTime,
                    EndTime = endTime,
                    Status = status,
                    Reason = reasons[Random.Shared.Next(reasons.Length)],
                    Notes = status == "Completed" ? "Patient seen and treated successfully." : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(0, 30))
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedQueues(ApplicationDbContext context, ILogger? logger)
    {
        var appointments = await context.Appointments
            .Where(a => a.Status == "Scheduled" || a.Status == "Checked-In")
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .ToListAsync();

        if (appointments.Count == 0) return;

        if (!await context.Queues.AnyAsync())
        {
            var today = DateTime.Today;
            var statuses = new[] { "Waiting", "InProgress", "Called", "Completed" };

            foreach (var appointment in appointments.Take(8))
            {
                var queueDate = appointment.AppointmentDate.Date;
                var existingQueues = await context.Queues
                    .Where(q => q.DoctorId == appointment.DoctorId && q.QueueDate.Date == queueDate)
                    .ToListAsync();
                var queueNumber = existingQueues.Count > 0 ? existingQueues.Max(q => q.QueueNumber) + 1 : 1;

                var status = statuses[Random.Shared.Next(statuses.Length)];
                var createdAt = queueDate.AddHours(8).AddMinutes(Random.Shared.Next(0, 240));

                var queue = new Queue
                {
                    AppointmentId = appointment.Id,
                    PatientId = appointment.PatientId,
                    DoctorId = appointment.DoctorId,
                    QueueNumber = queueNumber,
                    QueueDate = queueDate,
                    Status = status,
                    CreatedAt = createdAt,
                    EstimatedWaitTimeMinutes = Random.Shared.Next(10, 45),
                    ActualWaitTimeMinutes = status == "Completed" ? Random.Shared.Next(15, 60) : 0,
                    Notes = status == "Completed" ? "Patient consultation completed." : null
                };

                if (status == "InProgress" || status == "Called")
                {
                    queue.CalledAt = createdAt.AddMinutes(Random.Shared.Next(5, 30));
                    queue.StartedAt = queue.CalledAt;
                }

                if (status == "Completed")
                {
                    queue.CompletedAt = createdAt.AddMinutes(Random.Shared.Next(20, 90));
                }

                context.Queues.Add(queue);
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedEDVisits(ApplicationDbContext context, ILogger? logger)
    {
        var patients = await context.Patients.Include(p => p.User).ToListAsync();
        var doctors = await context.Doctors.Include(d => d.User).ToListAsync();
        var nurses = await context.Users.Where(u => u.RoleId == 4).ToListAsync(); // Nurse role

        if (patients.Count == 0 || doctors.Count == 0) return;

        if (!await context.EDVisits.AnyAsync())
        {
            var priorities = new[] { "Critical", "Urgent", "Non-Urgent" };
            var statuses = new[] { "Triage", "Treatment", "Discharged", "Admitted" };
            var chiefComplaints = new[]
            {
                "Chest pain", "Shortness of breath", "Severe headache", "Abdominal pain",
                "Fever and chills", "Trauma from accident", "Difficulty breathing", "Unconscious"
            };

            for (int i = 0; i < 10; i++)
            {
                var patient = patients[Random.Shared.Next(patients.Count)];
                var priority = priorities[Random.Shared.Next(priorities.Length)];
                var status = statuses[Random.Shared.Next(statuses.Length)];
                var arrivalTime = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 48));

                var visit = new EDVisit
                {
                    PatientId = patient.Id,
                    ArrivalTime = arrivalTime,
                    TriagePriority = priority,
                    ChiefComplaint = chiefComplaints[Random.Shared.Next(chiefComplaints.Length)],
                    Status = status,
                    BloodPressureSystolic = Random.Shared.Next(90, 180),
                    BloodPressureDiastolic = Random.Shared.Next(60, 120),
                    HeartRate = Random.Shared.Next(60, 120),
                    Temperature = 36.5m + (decimal)(Random.Shared.NextDouble() * 2.5),
                    RespiratoryRate = Random.Shared.Next(12, 24),
                    OxygenSaturation = Random.Shared.Next(92, 100),
                    PainScale = Random.Shared.Next(0, 11),
                    CreatedAt = arrivalTime
                };

                if (status != "Triage")
                {
                    visit.TriageTime = arrivalTime.AddMinutes(Random.Shared.Next(5, 30));
                    visit.TriageNurseId = nurses.Count > 0 ? nurses[Random.Shared.Next(nurses.Count)].Id : null;
                    visit.WaitTimeToTriage = (int)(visit.TriageTime.Value - arrivalTime).TotalMinutes;
                }

                if (status == "Treatment" || status == "Discharged" || status == "Admitted")
                {
                    visit.TreatmentStartTime = visit.TriageTime?.AddMinutes(Random.Shared.Next(10, 60));
                    visit.AssignedDoctorId = doctors[Random.Shared.Next(doctors.Count)].Id;
                    visit.TreatedByDoctorId = visit.AssignedDoctorId;
                    visit.WaitTimeToTreatment = visit.TreatmentStartTime.HasValue ? 
                        (int)(visit.TreatmentStartTime.Value - arrivalTime).TotalMinutes : null;
                }

                if (status == "Discharged" || status == "Admitted")
                {
                    visit.DischargeTime = visit.TreatmentStartTime?.AddMinutes(Random.Shared.Next(60, 240));
                    visit.Disposition = status == "Admitted" ? "Admit" : "Discharge";
                    visit.TotalEDStayTime = visit.DischargeTime.HasValue ? 
                        (int)(visit.DischargeTime.Value - arrivalTime).TotalMinutes : null;
                }

                context.EDVisits.Add(visit);
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedMedicalRecords(ApplicationDbContext context, ILogger? logger)
    {
        var doctors = await context.Doctors.Include(d => d.User).ToListAsync();
        var patients = await context.Patients.Include(p => p.User).ToListAsync();

        if (doctors.Count == 0 || patients.Count == 0) return;

        if (!await context.MedicalRecords.AnyAsync())
        {
            var symptoms = new[]
            {
                "Fever, cough, and fatigue", "Headache and dizziness", "Chest pain and shortness of breath",
                "Abdominal pain and nausea", "Joint pain and stiffness", "Rash and itching"
            };

            var treatments = new[]
            {
                "Prescribed antibiotics and rest", "Pain medication and follow-up in 1 week",
                "Blood tests ordered, monitoring required", "Physical therapy recommended",
                "Antihistamines prescribed for allergic reaction"
            };

            for (int i = 0; i < 12; i++)
            {
                var doctor = doctors[Random.Shared.Next(doctors.Count)];
                var patient = patients[Random.Shared.Next(patients.Count)];
                var visitDate = DateTime.Today.AddDays(-Random.Shared.Next(0, 90));

                context.MedicalRecords.Add(new MedicalRecord
                {
                    PatientId = patient.Id,
                    DoctorId = doctor.Id,
                    VisitDate = visitDate,
                    Symptoms = symptoms[Random.Shared.Next(symptoms.Length)],
                    Treatment = treatments[Random.Shared.Next(treatments.Length)],
                    Notes = "Patient responded well to treatment. Follow-up scheduled if needed.",
                    CreatedAt = visitDate
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedVitalSigns(ApplicationDbContext context, ILogger? logger)
    {
        var patients = await context.Patients.Include(p => p.User).ToListAsync();
        var medicalRecords = await context.MedicalRecords.Take(5).ToListAsync();

        if (patients.Count == 0) return;

        if (!await context.VitalSigns.AnyAsync())
        {
            for (int i = 0; i < 15; i++)
            {
                var patient = patients[Random.Shared.Next(patients.Count)];
                var record = medicalRecords.Count > 0 && Random.Shared.Next(2) == 0 ? 
                    medicalRecords[Random.Shared.Next(medicalRecords.Count)] : null;

                context.VitalSigns.Add(new VitalSigns
                {
                    PatientId = patient.Id,
                    MedicalRecordId = record?.Id,
                    RecordedDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(0, 30)),
                    BloodPressureSystolic = Random.Shared.Next(100, 140),
                    BloodPressureDiastolic = Random.Shared.Next(60, 90),
                    HeartRate = Random.Shared.Next(60, 100),
                    Temperature = 36.5m + (decimal)(Random.Shared.NextDouble() * 1.5),
                    RespiratoryRate = Random.Shared.Next(12, 20),
                    OxygenSaturation = Random.Shared.Next(95, 100),
                    Weight = 50 + Random.Shared.Next(0, 50),
                    Height = 150 + Random.Shared.Next(0, 50),
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(0, 30))
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedInvoices(ApplicationDbContext context, ILogger? logger)
    {
        var patients = await context.Patients.Include(p => p.User).ToListAsync();
        var appointments = await context.Appointments.Where(a => a.Status == "Completed").Take(5).ToListAsync();

        if (patients.Count == 0) return;

        if (!await context.Invoices.AnyAsync())
        {
            var statuses = new[] { "Pending", "Paid", "Overdue" };

            for (int i = 0; i < 8; i++)
            {
                var patient = patients[Random.Shared.Next(patients.Count)];
                var appointment = appointments.Count > 0 && Random.Shared.Next(2) == 0 ? 
                    appointments[Random.Shared.Next(appointments.Count)] : null;
                var amount = Random.Shared.Next(100, 1000);
                var status = statuses[Random.Shared.Next(statuses.Length)];

                var invoiceNumber = $"INV-{DateTime.Today:yyyyMMdd}-{i + 1:D3}";
                var subtotal = amount;
                var taxAmount = subtotal * 0.1m;
                var totalAmount = subtotal + taxAmount;

                var invoice = new Invoice
                {
                    InvoiceNumber = invoiceNumber,
                    PatientId = patient.Id,
                    AppointmentId = appointment?.Id,
                    InvoiceDate = DateTime.Today.AddDays(-Random.Shared.Next(0, 30)),
                    DueDate = DateTime.Today.AddDays(Random.Shared.Next(0, 30)),
                    SubTotal = subtotal,
                    TaxAmount = taxAmount,
                    TotalAmount = totalAmount,
                    PaidAmount = status == "Paid" ? totalAmount : (status == "PartiallyPaid" ? totalAmount * 0.5m : 0),
                    Status = status,
                    CreatedAt = DateTime.Today.AddDays(-Random.Shared.Next(0, 30))
                };

                context.Invoices.Add(invoice);
                await context.SaveChangesAsync();

                // Add invoice items
                var item1Amount = amount * 0.6m;
                context.InvoiceItems.Add(new InvoiceItem
                {
                    InvoiceId = invoice.Id,
                    Description = "Consultation Fee",
                    Quantity = 1,
                    UnitPrice = item1Amount
                });

                if (Random.Shared.Next(2) == 0)
                {
                    var item2Amount = amount * 0.4m;
                    context.InvoiceItems.Add(new InvoiceItem
                    {
                        InvoiceId = invoice.Id,
                        Description = "Lab Tests",
                        Quantity = 1,
                        UnitPrice = item2Amount
                    });
                }

                if (status == "Paid")
                {
                    var paymentNumber = $"PAY-{DateTime.Today:yyyyMMdd}-{i + 1:D3}";
                    context.Payments.Add(new Payment
                    {
                        PaymentNumber = paymentNumber,
                        InvoiceId = invoice.Id,
                        Amount = totalAmount,
                        PaymentDate = invoice.InvoiceDate.AddDays(Random.Shared.Next(0, 5)),
                        PaymentMethod = "Credit Card",
                        Status = "Completed",
                        CreatedAt = invoice.InvoiceDate.AddDays(Random.Shared.Next(0, 5))
                    });
                }
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedRoomsAndBeds(ApplicationDbContext context, ILogger? logger)
    {
        if (!await context.RoomTypes.AnyAsync())
        {
            var roomTypes = new[]
            {
                new { Name = "Standard Single", Description = "Standard single occupancy room", BasePrice = 200m, MaxOccupancy = 1 },
                new { Name = "Standard Double", Description = "Standard double occupancy room", BasePrice = 150m, MaxOccupancy = 2 },
                new { Name = "Private Suite", Description = "Private suite with amenities", BasePrice = 500m, MaxOccupancy = 1 },
                new { Name = "ICU", Description = "Intensive Care Unit", BasePrice = 1000m, MaxOccupancy = 1 }
            };

            foreach (var rt in roomTypes)
            {
                context.RoomTypes.Add(new RoomType
                {
                    Name = rt.Name,
                    Description = rt.Description,
                    BaseRatePerDay = rt.BasePrice,
                    MaxOccupancy = rt.MaxOccupancy
                });
            }
            await context.SaveChangesAsync();
        }

        var existingRoomTypes = await context.RoomTypes.ToListAsync();
        if (existingRoomTypes.Count == 0) return;

        if (!await context.Rooms.AnyAsync())
        {
            for (int i = 1; i <= 20; i++)
            {
                var roomType = existingRoomTypes[Random.Shared.Next(existingRoomTypes.Count)];
                var statuses = new[] { "Available", "Occupied", "Maintenance" };
                context.Rooms.Add(new Room
                {
                    RoomNumber = $"R{i:D3}",
                    RoomTypeId = roomType.Id,
                    Floor = Random.Shared.Next(1, 5),
                    Status = statuses[Random.Shared.Next(statuses.Length)]
                });
            }
            await context.SaveChangesAsync();
        }

        var rooms = await context.Rooms.ToListAsync();
        if (rooms.Count == 0) return;

        if (!await context.Beds.AnyAsync())
        {
            foreach (var room in rooms)
            {
                var bedCount = room.RoomNumber.Contains("ICU") ? 1 : Random.Shared.Next(1, 3);
                for (int i = 1; i <= bedCount; i++)
                {
                    var bedStatuses = new[] { "Available", "Occupied", "Maintenance" };
                    context.Beds.Add(new Bed
                    {
                        RoomId = room.Id,
                        BedNumber = $"{room.RoomNumber}-B{i}",
                        Status = bedStatuses[Random.Shared.Next(bedStatuses.Length)]
                    });
                }
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedPharmacyData(ApplicationDbContext context, ILogger? logger)
    {
        if (!await context.Suppliers.AnyAsync())
        {
            var suppliers = new[]
            {
                new { Name = "MedSupply Co.", ContactPerson = "John Doe", Email = "contact@medsupply.com", Phone = "555-0100" },
                new { Name = "PharmaDist Inc.", ContactPerson = "Jane Smith", Email = "info@pharmadist.com", Phone = "555-0200" },
                new { Name = "HealthCare Supplies", ContactPerson = "Mike Johnson", Email = "sales@healthcare.com", Phone = "555-0300" }
            };

            foreach (var sup in suppliers)
            {
                context.Suppliers.Add(new Supplier
                {
                    Name = sup.Name,
                    ContactPerson = sup.ContactPerson,
                    Email = sup.Email,
                    PhoneNumber = sup.Phone,
                    Address = $"{Random.Shared.Next(100, 9999)} Business St, City, State"
                });
            }
            await context.SaveChangesAsync();
        }

        if (!await context.Medications.AnyAsync())
        {
            var medications = new[]
            {
                new { Name = "Paracetamol", Description = "Pain reliever and fever reducer", Form = "Tablet", Dosage = "500mg", Price = 5.00m, Stock = 1000 },
                new { Name = "Ibuprofen", Description = "Anti-inflammatory medication", Form = "Tablet", Dosage = "400mg", Price = 8.50m, Stock = 800 },
                new { Name = "Amoxicillin", Description = "Antibiotic", Form = "Capsule", Dosage = "500mg", Price = 12.00m, Stock = 500 },
                new { Name = "Aspirin", Description = "Blood thinner and pain reliever", Form = "Tablet", Dosage = "100mg", Price = 3.50m, Stock = 1200 },
                new { Name = "Metformin", Description = "Diabetes medication", Form = "Tablet", Dosage = "500mg", Price = 10.00m, Stock = 600 }
            };

            foreach (var med in medications)
            {
                context.Medications.Add(new Medication
                {
                    Name = med.Name,
                    Description = med.Description,
                    Form = med.Form,
                    Dosage = med.Dosage,
                    Price = med.Price,
                    StockQuantity = med.Stock
                });
            }
            await context.SaveChangesAsync();
        }
    }
}
