# Copilot Coding Agent Instructions for Air Quality Map

## Repository Overview

Air Quality Map is a full-stack web application for managing and visualizing air quality monitoring stations. The app features user authentication, station CRUD operations, and dual viewing modes (table and interactive map).

**Tech Stack:**
- **Backend:** C# / ASP.NET Core 9.0, Entity Framework Core with PostgreSQL, JWT Authentication, BCrypt password hashing
- **Frontend:** TypeScript, React 19.2, React Router 7.10, Leaflet 1.9.4 maps, Axios 1.13.2, Vite 7.2.4 build tooling
- **Testing:** Vitest (frontend), xUnit (backend)
- **CI/CD:** GitHub Actions workflows for automated build, test, and deployment validation
- **Containerization:** Docker & Docker Compose v2

**Required Tools:**
- Docker 28.0.4+ with Docker Compose v2
- .NET SDK 9.0+
- Node.js 20.19.6+
- npm 10.8.2+

## Development Workflow

### ⚠️ IMPORTANT: Always Use Docker

**Do NOT run frontend or backend locally for development, building, or testing.** Always use Docker Compose for all development and CI/CD validation.

### Docker-Based Development (Primary Method)

**Working Directory:** Root `/`

**Start Full Stack:**
```bash
docker compose up --build
```

**Services Available:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger/API Docs: http://localhost:5000/swagger
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050 (PGADMIN_DEFAULT_EMAIL: admin@pgadmin.com, password: password)

**Build Only (No Start):**
```bash
docker compose build --no-cache
```

**Rebuild Specific Service:**
```bash
docker compose build --no-cache frontend
docker compose build --no-cache backend
```

**View Logs:**
```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
```

**Stop Services:**
```bash
docker compose down
```

**Clean Everything:**
```bash
docker compose down -v  # Removes volumes too
```

**⚠️ IMPORTANT:** Always use `docker compose` (v2 CLI), not `docker-compose` (v1). The v1 command is not available.

## Project Architecture & Layout

## Project Architecture & Layout

### Root Files
```
/
├── docker-compose.yml      # Multi-container orchestration (postgres, backend, frontend)
├── .gitignore              # Standard .NET + Node gitignore
└── README.md               # User-facing documentation
```

### Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── StationForm.tsx      # Station creation/edit form
│   │   ├── StationForm.test.tsx
│   │   ├── StationMap.tsx       # Leaflet map integration
│   │   ├── StationMap.test.tsx
│   │   ├── StationTable.tsx     # Data table view
│   │   └── StationTable.test.tsx
│   ├── pages/                   # Route components (page-level)
│   │   ├── DashboardPage.tsx    # Main dashboard with view switcher
│   │   ├── DashboardPage.test.tsx
│   │   ├── LoginPage.tsx        # Authentication page
│   │   ├── LoginPage.test.tsx
│   │   ├── RegisterPage.tsx     # User registration page
│   │   └── RegisterPage.test.tsx
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark/light mode
│   ├── services/                # API client layer (Axios)
│   │   └── api.ts              # API service endpoints
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   ├── test/                    # Test utilities
│   ├── __mocks__/               # Mock data and modules
│   ├── App.tsx                  # Router setup, main component
│   ├── App.css                  # Global component styles
│   ├── index.css                # Global application styles
│   └── main.tsx                 # React app entry point
├── public/                      # Static assets
├── package.json                 # npm scripts: dev, build, test, lint, preview
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── eslint.config.js            # ESLint 9 flat config
├── tsconfig.json               # TypeScript root config
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── Dockerfile                  # Multi-stage: Node 20 build → nginx serve
├── Dockerfile.test             # Test container
├── nginx.conf                  # Production nginx config
├── .env.example                # Environment variables template
└── TEST-GUIDE.md              # Frontend testing documentation
```

### Backend Structure (`backend/AirQualityMap.Api/`)
```
backend/
├── AirQualityMap.Api/
│   ├── Controllers/             # API endpoints
│   │   ├── AuthController.cs    # POST /api/auth/register, /api/auth/login
│   │   ├── StationsController.cs # CRUD /api/stations
│   │   ├── MeasurementsController.cs # /api/measurements
│   │   └── UsersController.cs   # User management endpoints
│   ├── Models/                  # EF Core entities
│   │   ├── User.cs              # User entity
│   │   ├── AirQualityStation.cs # Station entity
│   │   └── Measurement.cs       # Measurement readings
│   ├── DTOs/                    # Data Transfer Objects
│   │   ├── AuthResponseDto.cs
│   │   ├── LoginDto.cs
│   │   ├── RegisterDto.cs
│   │   ├── UpdateUserDto.cs
│   │   ├── ChangePasswordDto.cs
│   │   ├── StationDto.cs
│   │   └── MeasurementDto.cs
│   ├── Services/                # Business logic layer
│   │   ├── TokenService.cs      # JWT token generation
│   │   ├── UserService.cs       # User operations
│   │   ├── StationService.cs    # Station operations
│   │   ├── MeasurementService.cs # Measurement operations
│   │   └── Contracts/           # Service interfaces
│   ├── Data/                    # Database layer
│   │   └── AppDbContext.cs      # EF Core DbContext
│   ├── Migrations/              # EF Core migrations (auto-applied)
│   │   ├── 20251218115332_InitialCreate.cs
│   │   ├── 20251218115332_InitialCreate.Designer.cs
│   │   └── AppDbContextModelSnapshot.cs
│   ├── Program.cs               # App configuration, middleware, DI
│   ├── AirQualityMap.Api.csproj # .NET 9.0 project file
│   ├── appsettings.json         # Configuration (JWT, DB connection)
│   ├── appsettings.Development.json
│   ├── AirQualityMap.Api.http   # HTTP file for testing
│   ├── Dockerfile               # Multi-stage .NET 9.0 build
│   └── Properties/
│       └── launchSettings.json  # Profile settings
├── AirQualityMap.Api.Tests/     # xUnit test project
│   ├── Controllers/
│   │   ├── AuthControllerTests.cs
│   │   └── StationsControllerTests.cs
│   ├── Services/
│   │   └── TokenServiceTests.cs
│   ├── Data/
│   │   └── DataModelTests.cs
│   ├── Fixtures/
│   │   └── TestDataFixtures.cs
│   ├── AirQualityMap.Api.Tests.csproj
│   └── README.md
└── README.md
```

## Key Configuration Files

### Backend Configuration
- **appsettings.json:** JWT settings (Key, Issuer, Audience), PostgreSQL connection string
- **Program.cs:** 
  - CORS policy allows http://localhost:3000 and http://localhost:5173 (line 49)
  - JWT authentication configured (lines 24-37)
  - EF Core migrations auto-applied on startup via `context.Database.Migrate()` (line 70)

### Frontend Configuration
- **vite.config.ts:** Minimal config with React plugin
- **vitest.config.ts:** Vitest testing framework setup with jsdom
- **eslint.config.js:** ESLint 9 flat config with TypeScript, React hooks, and React refresh plugins
- **.env.example:** Template for VITE_API_URL (http://localhost:5000/api in Docker)

### Docker Configuration
- **docker-compose.yml:** 
  - Uses postgres:16-alpine for database
  - Backend exposes internal 8080 as external 5000
  - Frontend exposes internal 80 as external 3000
  - pgAdmin available on port 5050
  - All services on `airquality-network` bridge network
  - **⚠️ WARNING:** Default PostgreSQL credentials (postgres/postgres) are for development only

## Database Schema & Migrations

### Migration Strategy
The application uses **EF Core Code-First migrations** for schema management:
- Migrations are located in `backend/AirQualityMap.Api/Migrations/`
- Migrations are **automatically applied** on application startup via `context.Database.Migrate()` in Program.cs
- No manual migration commands needed during development
- To create new migrations, use Docker and run: `docker compose exec backend dotnet ef migrations add MigrationName`

### Current Schema
Three main entities: **User**, **AirQualityStation**, **Measurement**
- Relationships: Users have Stations, Stations have Measurements
- All migrations tracked in snapshot file for safe schema evolution

## CI/CD Pipelines

GitHub Actions workflows automatically validate code quality and functionality:

### Frontend Workflows
- **frontend-build.yml:** TypeScript compilation + Vite build on every push/PR
- **frontend-tests.yml:** Run Vitest unit tests on every push/PR

### Backend Workflows  
- **backend-build.yml:** Restore dependencies + dotnet build on every push/PR
- **backend-tests.yml:** Run xUnit tests on every push/PR (with PostgreSQL service)

**All workflows run on Ubuntu and use consistent dependency versions with local development.**

## Validation & Testing

### Docker-Based Validation (Recommended)
```bash
# Build entire stack with all validation
docker compose build --no-cache

# Run full application
docker compose up

# Run tests inside containers (if supported)
docker compose exec frontend npm run test:run
docker compose exec backend dotnet test
```

### Local Validation (Not Recommended - Use Docker Instead)
If you must validate locally (not recommended), commands would be:
- **Frontend:** `cd frontend && npm install && npm run build && npm run test:run`
- **Backend:** `cd backend/AirQualityMap.Api && dotnet restore && dotnet build && dotnet test`

However, **always prefer Docker-based validation** for consistency with CI/CD pipelines.

## Dependencies & Package Management

### Frontend Dependencies
- **Core:** React 19.2.0, React Router 7.10.1, Axios 1.13.2, Leaflet 1.9.4, React Leaflet 5.0.0
- **Dev:** TypeScript 5.9.3, Vite 7.2.4, ESLint 9.39.1, Vitest 3.0.1, Testing Library 16.1.0

### Backend Dependencies
- **Core:** .NET 9.0, Entity Framework Core 9.0.1, PostgreSQL provider
- **Auth:** BCrypt.Net-Next 4.0.3, JWT Bearer 9.0.1
- **API:** Swashbuckle/Swagger 6.6.2 (interactive API documentation)
- **Testing:** xUnit (via test project file)

## Common Pitfalls & Workarounds

1. **Running backend/frontend locally without Docker** - This will cause port conflicts, missing dependencies, and CI/CD mismatches. Always use `docker compose`.

2. **Docker Compose v2 required** - Use `docker compose` not `docker-compose`. The v1 command is not available.

3. **Port conflicts** - When using Docker, services are accessible on: Frontend 3000, Backend 5000, PostgreSQL 5432, pgAdmin 5050.

4. **Using `tail` or `head` bash commands** - Avoid shell-specific utilities like `tail`, `head`, `grep` in Docker commands as they may not be available in Alpine-based images. Use Docker's built-in filtering instead.

5. **Modifying database models** - After model changes:
   - Create migration: `docker compose exec backend dotnet ef migrations add MigrationName`
   - Migrations auto-apply on startup (no manual `dotnet ef database update` needed)
   - The `--no-cache` flag forces rebuilding with new migrations

6. **CORS origins** - Backend only allows localhost:3000 and localhost:5173. If you change frontend port in Docker or local dev, update Program.cs line 49.

7. **Build order in Docker** - Services depend on postgres health check. Frontend and backend build independently but both wait for postgres readiness.

## Working with This Repository

**Trust these instructions.** All commands have been tested and validated. Key principles:

1. **Always use Docker** for building, running, and testing - never run services locally
2. **Use `docker compose` (v2)** not `docker-compose` (v1)
3. **Avoid shell utilities** like `tail`, `head`, `grep` in Docker contexts
4. **Create migrations via Docker** when modifying models
5. **Validate changes** match pre-existing error counts (frontend has some known lint issues)

**For code changes:**
- Make your changes to source files
- Use `docker compose build --no-cache` to verify build succeeds
- Use `docker compose up` to test the full application
- Push changes - GitHub Actions will validate automatically via CI/CD workflows

**File locations are explicit in the directory trees above** - use them to locate files quickly without extensive searching.
