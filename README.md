# eHospital 🏥

> **Enterprise-Grade Hospital Management System**

A comprehensive, full-stack Hospital Management System designed to streamline healthcare operations and improve patient care. It covers clinical workflows, administration, billing, inventory, reporting, and patient interaction through a secure, role-based architecture.

This project was built as a production-oriented system, focusing on clean architecture, scalability, security, and real-world healthcare workflows.

---

## 🚀 At a Glance

- ✅ **40+ REST API controllers**
- ✅ **Clean Architecture** (.NET 9 + Angular 20)
- ✅ **Role-Based Access Control** (5 user roles)
- ✅ **Real-time dashboards & notifications**
- ✅ **Clinical, administrative & billing modules**
- ✅ **SQL Server + EF Core** (30+ migrations)
- ✅ **Accessibility-first UI** (WCAG-inspired)

> ⚠️ **Disclaimer**  
> This project is intended for educational and portfolio purposes.  
> It is not certified for real-world healthcare environments without additional regulatory compliance.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Technology Stack](#️-technology-stack)
- [Architecture](#️-architecture)
- [Key Features](#-key-features)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [Database](#️-database)
- [Security](#-security)
- [Accessibility](#️-accessibility)
- [Integration Capabilities](#-integration-capabilities)
- [Getting Started](#-getting-started)
- [Development Notes](#-development-notes)
- [License](#-license)
- [Author](#️-author)

---

## 🎯 Overview

eHospital is an enterprise-grade Hospital Management System that supports the full lifecycle of patient care:

- Patient registration and medical records (EHR)
- Appointment scheduling and department workflows
- Emergency department and room management
- Pharmacy, billing, and insurance processing
- Reporting, auditing, and administrative oversight

The system is designed to mirror real hospital operations, with strict access control, auditing, and data integrity.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Angular 20 (Standalone Components)
- **Language**: TypeScript
- **Styling**: SCSS
- **State Management**: RxJS
- **Routing**: Lazy-loaded feature modules
- **UI**: Responsive, accessibility-aware design

### Backend

- **Framework**: ASP.NET Core 9 (Web API)
- **Language**: C#
- **ORM**: Entity Framework Core 9
- **Database**: SQL Server
- **Authentication**: JWT Bearer Tokens
- **Architecture**: Clean Architecture
- **API Docs**: Swagger / OpenAPI

### Supporting Technologies

- **AutoMapper** (DTO mapping)
- **SignalR** (real-time communication – configured)
- **Azure Blob Storage** (file storage)
- **ImageSharp** (image processing)

---

## 🏗️ Architecture

The project follows **Clean Architecture** with full separation of concerns.

### Backend Structure

```
EHosp.Api/            → Presentation layer (REST controllers, middleware)
EHosp.Application/    → Business logic, services, DTOs
EHosp.Domain/         → Core domain entities
EHosp.Infrastructure/ → Data access, repositories, EF Core migrations
```

**Key Principles:**

- Domain-driven entity modeling
- Repository Pattern for persistence
- DTO-based API boundaries
- Dependency Injection throughout

### Frontend Structure

```
core/      → Services, guards, interceptors
features/  → Feature-based modules (patients, appointments, ER, billing, etc.)
shared/    → Reusable components and layouts
styles/    → Global themes and styling
```

---

## ✨ Key Features

### 🩺 Clinical Management

- Patient registry with advanced search and history
- Electronic Health Records (EHR)
- Appointments with doctor availability validation
- Vital signs and lab test records
- Diagnoses, prescriptions, and medical history
- Radiology and imaging records
- Discharge summaries
- Clinical decision support foundations

### ⚙️ Operations Management

- Emergency Department workflow
- Queue management per department
- Room and bed allocation
- Pharmacy & medication inventory
- Bulk administrative operations

### 🧾 Administrative & Billing

- Doctor and staff management
- Department configuration
- Billing, invoices, and payments
- Insurance providers and claims
- Audit logs and reporting

### 📊 Dashboards & UX

- Real-time dashboards with auto-refresh
- Global search across records
- In-app notifications
- Guided wizards for complex workflows
- Dedicated patient portal

---

## 👥 User Roles & Permissions

The system supports **five distinct roles**:

| Role | Description |
|------|-------------|
| **Admin** | Full system control, configuration, reports, audits |
| **Doctor** | Medical records, diagnoses, prescriptions, schedules |
| **Nurse** | Patient care, vitals, room & queue management |
| **Receptionist** | Registration, appointments, billing, insurance |
| **Patient** | Profile, appointments, limited medical history |

All access is protected via **RBAC** with policy-based authorization.

---

## 📁 Project Structure

### Backend

- **40+ controllers**
- **70+ service interfaces**
- **40+ domain entities**
- **30+ database migrations**

### Frontend

- **25+ feature modules**
- **Reactive forms**
- **Guards & interceptors**
- **Fully lazy-loaded routing**

---

## 🗄️ Database

- **Database**: SQL Server
- **Approach**: Code-first (EF Core)
- **Entities**: Users, Patients, Doctors, Appointments, Medical Records, Billing, Insurance, Rooms, Pharmacy, Notifications, Audit Logs

---

## 🔐 Security

- **JWT-based authentication**
- **Role-based and policy-based authorization**
- **Secure password hashing**
- **Protected API endpoints**
- **CORS configured per environment**
- **Full audit trail** of critical actions

---

## ♿ Accessibility

Accessibility is treated as a core feature:

- **WCAG-inspired design**
- **High contrast mode**
- **Adjustable font sizes**
- **Reduced motion option**
- **Screen reader support** (ARIA)
- **Full keyboard navigation**
- **Semantic HTML structure**

---

## 🔌 Integration Capabilities

Designed for integration with external systems:

- **HL7 / FHIR** (healthcare interoperability)
- **Insurance provider APIs**
- **Payment gateways**
- **Email & SMS services**
- **Lab system integration**

---

## 🚀 Getting Started

### Prerequisites

- **.NET 9 SDK**
- **Node.js 18+**
- **SQL Server**
- **Angular CLI**

### Backend

```bash
cd backend/EHosp.Api
dotnet ef database update --project ../EHosp.Infrastructure --startup-project .
dotnet run
```

### Frontend

```bash
cd frontend/ehospital-web
npm install
npm start
```

---

## 📝 Development Notes

- Lazy loading used across Angular features
- AutoMapper handles all DTO mapping
- Repository Pattern enforces data boundaries
- SignalR prepared for real-time extensions
- Detailed commit history recommended

---

## 📄 License

**MIT License**

---

## 👨‍💻 Author

**Lana Mustafić**

