# TOEIC Test Preparation Support Website

## Introduction
Website hỗ trợ luyện thi toeic, có sử dụng AI để hỗ trợ chấm kĩ năng Speaking & Writing.

## Authors
Development Team: SEP490_G22 - FPT University

## Technologies Used
- **Programming Language**: C#
- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Frontend**: ReactJs
- **Version Control**: Github

## Quy chuẩn Commit Message

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
# ToeicGenius - Frontend

## Technologies Used
- **Framework**: React 18.2.0
- **Build Tool**: Vite 7.1.6
- **UI Library**: Ant Design 5.27.3, Material-UI 7.3.2
- **Routing**: React Router DOM 7.9.1
- **HTTP Client**: Axios 1.12.1
- **Authentication**: React OAuth Google
- **State Management**: React Hooks (Context API)
- **Styling**: CSS Modules, TailwindCSS (via Ant Design)

## Project Structure
```
frontend/src/
├── app/                      # Application configuration
│   ├── guards/              # Route guards (PrivateRoute, RoleRoute)
│   ├── providers/           # Context providers (AuthProvider)
│   └── routes/               # Route definitions
├── assets/                   # Static assets (images, fonts)
├── config/                   # Configuration files (env.js)
├── pages/                    # Page components
│   ├── account/             # User account pages
│   ├── admin/               # Admin pages
│   ├── auth/                # Authentication pages
│   ├── public/              # Public pages
│   └── testCreator/         # Test creator pages
├── services/                 # API service layer
├── shared/                   # Shared components and utilities
│   ├── components/          # Reusable components
│   ├── constants/           # Application constants
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Layout components
│   ├── styles/              # CSS modules
│   └── utils/               # Utility functions
├── App.jsx                   # Root component
├── main.jsx                  # Application entry point
└── index.css                 # Global styles
```

## Key Directories

- **app/**: Contains route guards, context providers, and route definitions
  - `guards/`: Route protection logic (PrivateRoute, PublicOnlyRoute, RoleRoute)
  - `providers/`: React context providers (e.g., AuthProvider)
  - `routes/`: Centralized route configuration

- **pages/**: Page-level components organized by feature
  - `account/`: User profile and account management
  - `admin/`: Admin dashboard and account management
  - `auth/`: Login, register, password reset, email verification
  - `public/`: Public pages (Home, About, NotFound)
  - `testCreator/`: Test and question bank management

- **services/**: API service layer for backend communication
  - Each service file corresponds to a backend resource (auth, tests, questions, etc.)
  - Uses axios with configured interceptors for authentication

- **shared/**: Reusable components, utilities, and configurations
  - `components/`: Shared UI components (ExamManagement, QuestionBank, TOEICExam)
  - `layouts/`: Layout wrappers (MainLayout, AdminShell, Header, Footer)
  - `constants/`: Application constants (TOEIC structure, roles, etc.)
  - `hooks/`: Custom React hooks (useAuth)
  - `styles/`: CSS module files
  - `utils/`: Helper functions (ACL, validators)

## Installation Guide

### System Requirements:
- Node.js 18.x (or higher)
- npm or yarn package manager

### Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

### Install dependencies:
```bash
npm install
# or
yarn install
```

### Setup environment variables:
1. Create a `.env` file in the `frontend` directory (or update `src/config/env.js`):
```javascript
// src/config/env.js
export default {
  API_BASE_URL: "https://localhost:7100", // Backend API URL
  GOOGLE_CLIENT_ID: "your-google-client-id",
  // Add other environment variables as needed
};
```

### Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will start at:
- **Frontend**: `http://localhost:3000`
- The browser will automatically open the application

### Build for production:
```bash
npm run build
# or
yarn build
```

### Preview production build:
```bash
npm run preview
# or
yarn preview
```

## Path Aliases

The project uses path aliases configured in `vite.config.js` for cleaner imports:

- `@app` → `/src/app`
- `@pages` → `/src/pages`
- `@shared` → `/src/shared`
- `@services` → `/src/services`
- `@config` → `/src/config`
- `@assets` → `/src/assets`
- `@hooks` → `/src/hooks`
- `@utils` → `/src/utils`

### Example Usage:
```javascript
import { useAuth } from "@hooks/useAuth";
import { getTests } from "@services/testsService";
import MainLayout from "@shared/layouts/MainLayout";
import Login from "@pages/auth/Login";
```

## Development Guidelines

### Component Structure:
- Use functional components with React Hooks
- Prefer `const` over `function` declarations
- Use descriptive variable and function names
- Event handlers should be prefixed with "handle" (e.g., `handleClick`, `handleSubmit`)

### State Management:
- Use `useState` for local component state
- Use Context API (`AuthProvider`) for global authentication state
- Avoid prop drilling; use Context or lift state up when needed

### API Integration:
- All API calls should go through service files in `src/services/`
- Use the configured `apiClient` which includes:
  - Automatic JWT token injection
  - Error handling interceptors
  - FormData handling
- Service functions should return promises and handle errors appropriately

### Routing:
- Routes are defined in `app/routes/index.jsx`
- Use lazy loading for route components
- Protect routes using guards:
  - `PrivateRoute`: Requires authentication
  - `PublicOnlyRoute`: Only accessible when logged out
  - `RoleRoute`: Requires specific user roles

### Styling:
- Use Ant Design components for UI elements
- Use CSS Modules for custom styling (`.module.css` files)
- Follow Ant Design design system guidelines
- Use TailwindCSS classes when needed (via Ant Design)

### File Organization:
- One component per file
- Export default for main component
- Use named exports for utilities and hooks
- Group related components in subdirectories

## Key Features

### Authentication:
- JWT-based authentication
- Google OAuth integration
- Email verification flow
- Password reset functionality

### Role-Based Access Control:
- **Admin**: Full system access
- **TestCreator**: Can create and manage tests
- **Examinee**: Can take tests and view results

### Test Management:
- Create tests from question bank (Practice tests)
- Create manual tests (Simulator tests)
- Import/Export tests via Excel
- Version control for tests
- Test structure validation (TOEIC format)

### Question Bank:
- Single question management
- Question group management
- Search and filter by skill, part, keyword
- Soft delete and restore functionality

### Exam Taking:
- Full TOEIC exam simulation
- Timer functionality
- Question navigation
- Test result display with detailed scoring

## Common Development Tasks

### Adding a New Page:
1. Create component in appropriate `pages/` subdirectory
2. Add route in `app/routes/index.jsx`
3. Apply appropriate route guard
4. Add navigation links if needed

### Adding a New API Service:
1. Create service file in `src/services/`
2. Import `api` from `apiClient`
3. Export async functions that return promises
4. Handle errors appropriately

### Creating a Shared Component:
1. Create component in `shared/components/`
2. Use Ant Design components when possible
3. Export as default
4. Document props using JSDoc if needed

## Troubleshooting

### Port already in use:
Change the port in `vite.config.js`:
```javascript
server: {
  port: 3001, // Change to available port
}
```

### API connection errors:
- Verify `API_BASE_URL` in `src/config/env.js`
- Check backend server is running
- Verify CORS settings on backend
- Check browser console for detailed error messages

### Authentication issues:
- Check token storage in localStorage
- Verify JWT token expiration
- Clear localStorage and re-login if needed

---
*This documentation is updated regularly. Please contribute to improve project quality.*
