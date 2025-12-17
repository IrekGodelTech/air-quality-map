# Copilot Coding Agent Instructions for Air Quality Map

## Repository Overview

Air Quality Map is a full-stack web application for managing and visualizing air quality monitoring stations. The app features user authentication, station CRUD operations, and dual viewing modes (table and interactive map). This is a **small codebase** (~1,234 lines of code) with 11 TypeScript/React files and 16 C# files.

**Tech Stack:**
- **Backend:** C# / ASP.NET Core 9.0, Entity Framework Core with PostgreSQL, JWT Authentication, BCrypt password hashing
- **Frontend:** TypeScript, React 18, React Router, Leaflet maps, Axios, Vite build tooling
- **Runtime Versions:** .NET SDK 10.0.100+, Node.js 20.19.6+, npm 10.8.2+, Docker 28.0.4+

## Build & Validation Commands

### Frontend (React + TypeScript + Vite)

**Working Directory:** `frontend/`

**Bootstrap & Build Sequence (tested and validated):**
```bash
cd frontend
npm install          # Install dependencies (takes ~2-4 seconds)
npm run build        # TypeScript compile + Vite build (takes ~2-3 seconds)
```

**Lint (with known issues):**
```bash
npm run lint         # Run ESLint - EXITS WITH CODE 1
```

**⚠️ KNOWN ISSUE:** ESLint currently has 11 pre-existing errors in the codebase:
- StationForm.tsx: setState in useEffect (line 21)
- StationMap.tsx: `any` type usage (line 12)
- AuthContext.tsx: setState in useEffect (line 24), exports issue (line 58)
- DashboardPage.tsx: function accessed before declaration (line 20), unused variable, `any` types (lines 27, 43, 57)
- LoginPage.tsx: `any` type usage (line 19)
- RegisterPage.tsx: `any` type usage (line 20)

**These are NOT your responsibility to fix unless directly related to your changes.** Always run `npm run lint` to catch new issues, but ignore these pre-existing errors.

**Development Server:**
```bash
npm run dev          # Starts Vite dev server on http://localhost:5173
```

**Clean Build:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Backend (C# ASP.NET Core)

**Working Directory:** `backend/AirQualityMap.Api/`

**Bootstrap & Build Sequence (tested and validated):**
```bash
cd backend/AirQualityMap.Api
dotnet restore       # Restore NuGet packages (takes ~3-5 seconds)
dotnet build         # Build project (takes ~2-10 seconds)
```

**Clean Build:**
```bash
dotnet clean
dotnet restore
dotnet build
```

**Run Backend:**
```bash
dotnet run           # Starts API on http://localhost:5000
```

**Note:** Database is created automatically using `EnsureCreated()` in Program.cs (line 69). No manual migrations needed.

### Docker (Full Stack)

**Working Directory:** Root `/`

```bash
docker compose build --no-cache   # Takes 3-5 minutes, use docker compose not docker-compose
docker compose up                 # Start all services
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- PostgreSQL: localhost:5432

**⚠️ IMPORTANT:** Use `docker compose` (v2 CLI) not `docker-compose` (v1). The v1 command is not available.

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
│   ├── components/         # Reusable UI components
│   │   ├── StationForm.tsx
│   │   ├── StationMap.tsx  # Leaflet map integration
│   │   └── StationTable.tsx
│   ├── pages/              # Route components
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── services/           # API client (Axios)
│   ├── context/            # React context (AuthContext.tsx)
│   ├── types/              # TypeScript type definitions (index.ts)
│   ├── App.tsx             # Router setup, main component
│   └── main.tsx            # React app entry point
├── public/                 # Static assets
├── package.json            # npm scripts: dev, build, lint, preview
├── vite.config.ts          # Vite configuration
├── eslint.config.js        # ESLint 9 flat config
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # App TypeScript config
├── tsconfig.node.json      # Node TypeScript config
├── Dockerfile              # Multi-stage: Node 20 build + nginx serve
├── nginx.conf              # Production nginx config
└── .env.example            # VITE_API_URL example
```

### Backend Structure (`backend/AirQualityMap.Api/`)
```
backend/AirQualityMap.Api/
├── Controllers/
│   ├── AuthController.cs       # POST /api/auth/register, /api/auth/login
│   └── StationsController.cs   # CRUD for /api/stations
├── Models/
│   ├── User.cs                 # User entity
│   └── AirQualityStation.cs    # Station entity
├── DTOs/
│   ├── AuthResponseDto.cs
│   ├── LoginDto.cs
│   ├── RegisterDto.cs
│   └── StationDto.cs
├── Services/
│   ├── ITokenService.cs
│   └── TokenService.cs         # JWT token generation
├── Data/
│   └── AppDbContext.cs         # EF Core DbContext (Users, Stations)
├── Program.cs                  # App entry, middleware setup, DB initialization
├── AirQualityMap.Api.csproj    # .NET 9.0 project file
├── appsettings.json            # Default config (JWT, DB connection string)
├── appsettings.Development.json
└── Dockerfile                  # Multi-stage .NET 9.0 build
```

**No Migrations Directory:** The app uses `dbContext.Database.EnsureCreated()` for automatic schema creation (Program.cs line 69). This is NOT recommended for production but is the current approach.

## Key Configuration Files

### Backend Configuration
- **appsettings.json:** JWT settings (Key, Issuer, Audience), PostgreSQL connection string
- **Program.cs:** 
  - CORS policy allows http://localhost:3000 and http://localhost:5173 (line 49)
  - JWT authentication configured (lines 24-37)
  - Automatic database creation (lines 66-70)

### Frontend Configuration
- **vite.config.ts:** Minimal config with React plugin
- **eslint.config.js:** ESLint 9 flat config with TypeScript, React hooks, and React refresh plugins
- **.env.example:** Template for VITE_API_URL (default: http://localhost:5211/api - note this differs from docker-compose which uses port 5000)

### Docker Configuration
- **docker-compose.yml:** 
  - Uses postgres:16-alpine
  - Backend exposes internal 8080 as external 5000
  - Frontend exposes internal 80 as external 3000
  - **⚠️ WARNING:** Default PostgreSQL credentials (postgres/postgres) are for development only

## Validation & CI/CD

**No CI/CD workflows currently exist.** There are no GitHub Actions workflows, pre-commit hooks, or automated tests.

**Manual Validation Steps:**
1. Run `npm run lint` in frontend/ (expect 11 pre-existing errors)
2. Run `npm run build` in frontend/ (should succeed)
3. Run `dotnet build` in backend/AirQualityMap.Api/ (should succeed with 0 warnings)
4. Optionally test with `docker compose build` if Docker changes are made

**No test suite exists** - there are no test files in either frontend or backend.

## Dependencies & Package Management

### Frontend Dependencies
- React 19.2.0, React Router 7.10.1, Axios 1.13.2, Leaflet 1.9.4
- Dev: TypeScript 5.9.3, Vite 7.2.4, ESLint 9.39.1

### Backend Dependencies
- NuGet packages in AirQualityMap.Api.csproj:
  - BCrypt.Net-Next 4.0.3
  - Microsoft.AspNetCore.Authentication.JwtBearer 9.0.1
  - Npgsql.EntityFrameworkCore.PostgreSQL 9.0.1
  - Swashbuckle.AspNetCore 6.6.2 (Swagger)

## Common Pitfalls & Workarounds

1. **Frontend lint errors are pre-existing** - Do not attempt to fix all 11 errors unless they're related to your changes.

2. **Docker Compose v2 required** - Use `docker compose` not `docker-compose`.

3. **Port confusion** - .env.example uses port 5211, but docker-compose uses 5000. Frontend dev server uses 5173, production uses 3000.

4. **No migrations** - Database schema is auto-created via EnsureCreated(). If you modify models, the database may need to be dropped and recreated.

5. **CORS origins** - Backend only allows localhost:3000 and localhost:5173. If you change frontend port, update Program.cs line 49.

6. **Build order matters for Docker** - Frontend and backend build independently, but both depend on postgres health check.

## Working with This Repository

**Trust these instructions.** All commands have been tested and validated. Only search or explore further if:
- You find an error in these instructions
- You need information not covered here
- You're working on a feature requiring deep understanding of a specific component

**For code changes:**
- Frontend changes: Always run `npm run lint` and `npm run build` after changes
- Backend changes: Always run `dotnet build` after changes
- Both: Validate that pre-existing lint errors haven't increased

**File locations are explicit above** - use the directory trees to locate files quickly without searching.
