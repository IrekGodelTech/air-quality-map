# Air Quality Map

A full-stack web application for managing and visualizing air quality monitoring stations. Users can register, add their own air quality stations with coordinates and measurement endpoints, and view all stations in both table and map layouts.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **User Management**: Update user profile and change password
- **Station Management**: Add, edit, and delete air quality stations (authenticated users only)
- **Dual Viewing Modes**: 
  - Table view for detailed station information
  - Interactive map view with markers for each station
- **Measurement Tracking**: 
  - Automatic polling of external measurement endpoints
  - Historical measurement data storage
  - Detailed measurement views with PM2.5, PM10, and temperature data
  - Interactive charts for visualizing measurement trends
- **RESTful API**: Backend API with C# ASP.NET Core
- **Modern Frontend**: React + TypeScript with Vite
- **Comprehensive Testing**: Unit tests for both frontend (Vitest) and backend (xUnit)
- **Code Quality Tools**: ESLint for frontend linting
- **Database Seed Data**: Automatic initialization with admin user and sample station
- **Docker Support**: Containerized application for easy deployment

## Tech Stack

### Backend
- C# / ASP.NET Core 9.0
- Entity Framework Core with PostgreSQL
- JWT Authentication
- BCrypt for password hashing

### Frontend
- TypeScript 5.9
- React 19.2
- React Router 7.10 for navigation
- Leaflet 1.9.4 for interactive maps
- Chart.js 4.5 with React Chart.js 2 for data visualization
- Axios 1.13 for API communication
- Vite 7.2 for build tooling
- Vitest 3.0 for unit testing
- ESLint 9 for code quality

## Project Structure

```
air-quality-map/
├── backend/
│   ├── AirQualityMap.Api/       # ASP.NET Core Web API
│   │   ├── Controllers/         # API controllers (Auth, Stations, Measurements, Users)
│   │   ├── Models/              # Data models (User, AirQualityStation, Measurement)
│   │   ├── DTOs/                # Data transfer objects
│   │   ├── Services/            # Business logic services
│   │   │   ├── Contracts/       # Service interfaces
│   │   │   ├── ExternalMeasurementService.cs  # Fetch measurements from external APIs
│   │   │   ├── MeasurementPollingHostedService.cs  # Background polling service
│   │   │   ├── DatabaseSeeder.cs # Initial data seeding service
│   │   │   └── ...              # Other services
│   │   ├── Data/                # DbContext and database configuration
│   │   ├── Migrations/          # EF Core migrations
│   │   └── Dockerfile           # Backend container configuration
│   └── AirQualityMap.Api.Tests/ # xUnit test project
│       ├── Controllers/         # Controller tests
│       ├── Services/            # Service tests
│       └── Data/                # Data model tests
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── StationForm.tsx
│   │   │   ├── StationTable.tsx
│   │   │   ├── StationMap.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/               # Page components (Dashboard, Login, Register)
│   │   ├── services/            # API client services
│   │   ├── context/             # React context providers (Auth, Theme)
│   │   ├── types/               # TypeScript type definitions
│   │   ├── __mocks__/           # Test mocks
│   │   └── test/                # Test utilities
│   ├── Dockerfile               # Frontend container configuration
│   ├── Dockerfile.test          # Test container configuration
│   ├── nginx.conf               # Nginx configuration for production
│   ├── vitest.config.ts         # Vitest test configuration
│   └── eslint.config.js         # ESLint configuration
├── docker-compose.yml           # Multi-container orchestration
└── docker-compose.test.yml      # Test environment configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Node.js 20+ and .NET 9.0 SDK (for local development)

### Running with Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/IrekGodelTech/air-quality-map.git
cd air-quality-map
```

2. Start the application:
```bash
docker compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050

**Default Credentials:**
On first startup, the database is automatically seeded with:
- **Admin User**: Username: `admin`, Password: `admin`, Email: `admin@admin.com`
- **Sample Station**: "sample-station" with real-time data from ThingSpeak API

### Running Tests with Docker

Run all tests:
```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
# Or run specific tests:
docker compose -f docker-compose.test.yml up frontend-tests
docker compose -f docker-compose.test.yml up backend-tests
```

### Running Locally for Development

#### Backend
```bash
cd backend/AirQualityMap.Api
dotnet restore
dotnet run
dotnet test # to run backend tests
```

Backend will be available at http://localhost:5000

#### Frontend
```bash
cd frontend
npm install
npm run dev
npm run test # to run frontend tests
```

Frontend will be available at http://localhost:5173

### Measurements
- `GET /api/measurements/station/{stationId}` - Get all measurements for a station
- `GET /api/measurements/station/{stationId}/last` - Get the latest measurement for a station
- `GET /api/measurements/{id}` - Get a specific measurement
- `POST /api/measurements/station/{stationId}/sync` - Manually sync measurements from external endpoint (authenticated)

### Users
- `GET /api/users/{id}` - Get user information
- `PUT /api/users/{id}` - Update user profile (authenticated, own profile only)
- `DELETE /api/users/{id}` - Delete user account (authenticated, own account only)
- `PUT /api/users/{id}/change-password` - Change password (authenticated, own account only)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Stations
- `GET /api/stations` - Get all stations (public)
- `GET /api/stations/{id}` - Get a specific station (public)
- `POST /api/stations` - Create a new station (authenticated)
- `PUT /api/stations/{id}` - Upoptional - link to current measurements JSON endpoint)
5. **View stations** - Toggle between Table and Map views
6. **View measurements** - Click on a station to see detailed measurement history and charts
7. **Manage profile** - Update your account details or change password
8. **Edit/Delete** - Manage your own stations (authenticated users only)

### Automatic Measurement Polling

The application includes a background service that automatically polls external measurement endpoints:
- Polls every 5 minutes (configurable)
- Fetches measurements from station endpoint URLs
- Only saves new measurements (based on timestamp)
- Supports standard air quality data formats (PM2.5, PM10, temperature, humidity, pressure
## Usage

1. **Register an account** - Click "Register" on the login page
2. **Login** - Use your credentials to access authenticated features
3. **Add a station** - Click "+ Add Station" button
4. **Fill in station details**:
   - Name
   - Description
   - Latitude and Longitude coordinates
   - Measurement endpoint URL (link to current measurements)
5. **View stations** - Toggle between Table and Map views
6. **Edit/Delete** - Manage your own stations (authenticated users only)

## Environment Variables

### Backend (appsettings.json or environment)
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Jwt__Key` - Secret key for JWT signing
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

### Database (PostgreSQL)
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

**⚠️ Security Note:** The default PostgreSQL credentials in `docker-compose.yml` are for development only. For production deployments:
- Change the default passwords
- Use Docker secrets or environment variables for sensitive data
- Enable SSL/TLS for database connections
- Consider using managed database services

## CI/CD Pipelines

The project includes automated GitHub Actions workflows that run on every push and pull request:

### Frontend Pipeline
- **Lint and Type Check**: ESLint validation and TypeScript compilation check
- **Test**: Unit tests with Vitest and coverage report generation
- **Build**: Production build with Vite
- **Docker Build**: Validates Docker image creation

### Backend Pipeline
- **Lint and Format**: Code formatting verification and build with warnings as errors
- **Test**: xUnit tests with PostgreSQL test database
- **Build**: Release build with .NET 9.0
- **Docker Build**: Validates Docker image creation

All pipelines run on Ubuntu with consistent dependency versions matching local development environment.

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- CORS configuration for frontend access
- User authorization for station management
- Input validation on both frontend and backend
- PostgreSQL with parameterized queries to prevent SQL injection

## License

MIT
