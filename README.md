# TOEIC Test Preparation Support Website

## Introduction
Website hỗ trợ luyện thi toeic, có sử dụng AI để hỗ trợ chấm kĩ năng Speaking & Writing.

## Authors
Development Team: SEP490_G20 - FPT University

## Technologies Used
- **Programming Language**: C#
- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Frontend**: ReactJs
- **Version Control**: Github

## 📝 Quy chuẩn Commit Message

### Format chuẩn
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Các loại commit (type):
- **feat**: Tính năng mới
- **fix**: Sửa lỗi
- **docs**: Cập nhật documentation
- **style**: Formatting, missing semicolons, etc (không ảnh hưởng logic)
- **refactor**: Refactor code
- **test**: Thêm hoặc sửa tests
- **chore**: Cập nhật build process, dependencies, etc

### Scope (tùy chọn):
- **auth**: Authentication related
- **user**: User management
- **exam**: Exam functionality
- **api**: API changes
- **db**: Database changes

### Ví dụ commit messages:
```bash
feat(auth): add Google OAuth login functionality

fix(user): resolve password validation issue

docs(api): update authentication endpoints documentation

refactor(repo): improve base repository pattern

test(auth): add unit tests for AuthService

chore(deps): update Entity Framework to 8.0.20
```
## Git Flow

### Nếu chưa tạo branch (code tính năng mới):
**B1**: Tạo branch trên github 

### Nếu đang code dở, mà qua lười code để nay code nốt:
**B2**: Open git bash or cmd trong project (có thể dùng git tool cho trực quan: Github Desktop,...)
**B3**: Run command `git checkout main` để chuyển về nhánh main  
**B4**: Run command `git pull` để pull code mới nhất về (quan trọng để tránh bị conflict)  
**B5**: Run command `git checkout <your_branch>` để chuyển sang branch của mình  
**B6.1**: Run command `git merge main` để merge code mới nhất trên main  
**B6.2**: Nếu ae bị conflict ở đây thì xem xem code nào ko phải của mình thì accept code mới nhé. Còn code mình đang dev thì accept my code (để tránh bị mất code người khác)  
**B7**: Code thôi!  
**B8**: Run command `git add .` để add code lên git local  
**B9**: Run command `git commit -m "<commit_cua_minh>"` để commit  
**B10**: Run command `git push` để push code lên git global  
**B11**: Mở project trên Github, chuyển sang branch của mình  
**B12**: Tạo Merge Request  
**B13**: Nếu không bị conflict thì merge thôi:
- Nhớ bỏ chọn 'Delete source branch when merge request is accepted.' để không bị xóa branch, phòng trường hợp có bug thì fix lại trên branch đó
- Và chọn 'Squash commits when merge request is accepted.' để squash nhiều commits lại thành 1 commit khi merge vào main để nếu có bug thì rollback lại version cũ dễ  

# ToeicGenius - Backend API

## Project Structure
```
ToeicGenius/
├── Configuration/            # Configure
├── Controllers/              # API Controllers
├── Domains/                  # Business logic and data models
│   ├── DTOs/                # Data Transfer Objects
│   ├── Entities/            # Database entities
│   └── Enums/               # Enumerations
├── Services/                 # Business logic layer
├── Repositories/             # Data access layer
├── Configurations/           # DI and app configurations
├── Filters/                  # Custom filters
├── Shared/                   # Constants and helpers
├── Migrations/               # EF Core migrations
├── Tests/                    # Unit and integration tests
├── appsettings.json          # Application settings
└── Program.cs                # Application entry point
```

## Key Directories

- **Controllers**: Contains API controllers to handle HTTP requests
- **Domains**: Contains business logic, DTOs, entities, and enums
- **Services**: Contains business logic, calls repositories
- **Repositories**: Contains data access logic, calls DbContext
- **Configurations**: Contains DI configuration and app settings
- **Filters**: Custom action filters for validation
- **Shared**: Constants, error messages, and helper utilities
- **Migrations**: Entity Framework Core database migrations
- **Tests**: Unit tests and integration tests
- **appsettings.json**: Application configuration
- **appsettings.Development.json**: Application configuration for developer (ae cấu hình ở file này nhé)
- **Program.cs**: Application startup and configuration

## Installation Guide

### System Requirements:
- Visual Studio 2022 (or later)
- SQL Server 2019 (or higher)
- .NET 8.0 (or higher)

### Clone the repository:
```bash
git clone <repository-url>
cd ToeicGenius
```

### Setup appsettings.Development.json:
1. Open Solution: `ToeicGenius.sln`
2. Open `appsettings.Development.json` and update connection string or others
3. Build Solution

### Initialize the database:
If you haven't installed dotnet ef, run:
```bash
dotnet tool install --global dotnet-ef
```

Or update dotnet ef:
```bash
dotnet tool update --global dotnet-ef
```

Finally, run:
```bash
dotnet ef database update
```

### Run the application:
```bash
dotnet run
```

Open browser and go to:
- **API**: `https://localhost:7100`
- **Swagger**: `https://localhost:7100/swagger`

## How to Code

### Architecture Pattern:
**Controller** → Nhận request, gọi Service (Xử lý logic nghiệp vụ)  
**Service** → Chứa business logic, gọi Repository (Làm việc với database)  
**Repository** → Chứa logic truy vấn database, gọi DbContext (Truy vấn dữ liệu)

### File Structure:
```
/Controllers
├── AuthController.cs
/Services
├── IAuthService.cs
├── AuthService.cs
/Repositories
├── IUserRepository.cs
├── UserRepository.cs
/Domains/Entities
├── User.cs
/Domains/DTOs
├── LoginRequestDto.cs
├── LoginResponseDto.cs
```

### Development Steps:
**B1**: Tạo interface `I_Repository`  
**B2**: Tạo class `_Repository` implements `I_Repository`  
**B3**: Tạo interface `I_Service`  
**B4**: Tạo class `_Service` implements `I_Service`  
**B5**: DI trong `DependencyInjection.cs`:
```csharp
services.AddScoped<I_Repository, _Repository>();
services.AddScoped<I_Service, _Service>();
```
**B6**: Tạo `_Controller` rồi code thôi!!

## Code First Migrations

### Tạo Migration mới:
```bash
dotnet ef migrations add MigrationName
# Ví dụ:
dotnet ef migrations add AddUserProfileTable
```

### Cập nhật Database:
```bash
dotnet ef database update
```

### Quản lý Migrations:
```bash
# Xem danh sách migrations
dotnet ef migrations list

# Xóa migration cuối cùng (nếu chưa apply)
dotnet ef migrations remove

# Tạo script SQL từ migrations
dotnet ef migrations script
```

## API Documentation
- **Authentication API**: `API_Auth_Documentation.md`
- **Swagger UI**: `https://localhost:7100/swagger` (Development)

## Environment Configuration

### appsettings.Development.json:
```json
{
  
  "ConnectionStrings": {
    "MyCnn": "Server=localhost;Database=DBexample;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Issuer": "Capstone_SEP490_G22",
    "Audience": "Capstone_SEP490_G22",
    "SecretKey": "example",
    "ExpireMinutes": 30
  },
  "MailSettings": {
    "Host": "smtp.gmail.com",
    "Password": "abc xyz bcm",
    "Port": "xyz",
    "UserName": "mail@example.com",
    "From": "abc@gmail.com"
   },
   "Authentication": {
     "Google": {
        "ClientId": "clientId",
        "ClientSecret": "ClientSecret",
        "RedirectUri": "https://localhost:123/examplee"
      }
    }
}
```
# ToeicGenius - Frontend (Update sau)
---
*Tài liệu này được cập nhật thường xuyên. Vui lòng đóng góp để cải thiện chất lượng dự án.*
