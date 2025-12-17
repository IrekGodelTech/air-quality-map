# Air Quality Map

A full-stack web application for managing and visualizing air quality monitoring stations. Users can register, add their own air quality stations with coordinates and measurement endpoints, and view all stations in both table and map layouts.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Station Management**: Add, edit, and delete air quality stations (authenticated users only)
- **Dual Viewing Modes**: 
  - Table view for detailed station information
  - Interactive map view with markers for each station
- **RESTful API**: Backend API with C# ASP.NET Core
- **Modern Frontend**: React + TypeScript with Vite
- **Docker Support**: Containerized application for easy deployment

## Tech Stack

### Backend
- C# / ASP.NET Core 9.0
- Entity Framework Core with PostgreSQL
- JWT Authentication
- BCrypt for password hashing

### Frontend
- TypeScript
- React 18
- React Router for navigation
- Leaflet for interactive maps
- Axios for API communication
- Vite for build tooling

## Project Structure

```
air-quality-map/
├── backend/
│   └── AirQualityMap.Api/       # ASP.NET Core Web API
│       ├── Controllers/          # API controllers
│       ├── Models/               # Data models
│       ├── DTOs/                 # Data transfer objects
│       ├── Services/             # Business logic services
│       ├── Data/                 # DbContext and database configuration
│       └── Dockerfile            # Backend container configuration
├── frontend/                     # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API client services
│   │   ├── context/             # React context providers
│   │   └── types/               # TypeScript type definitions
│   ├── Dockerfile               # Frontend container configuration
│   └── nginx.conf               # Nginx configuration for production
└── docker-compose.yml           # Multi-container orchestration
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
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation (Swagger): http://localhost:5000/swagger

### Running Locally for Development

#### Backend
```bash
cd backend/AirQualityMap.Api
dotnet restore
dotnet run
```

Backend will be available at http://localhost:5000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Stations
- `GET /api/stations` - Get all stations (public)
- `GET /api/stations/{id}` - Get a specific station (public)
- `POST /api/stations` - Create a new station (authenticated)
- `PUT /api/stations/{id}` - Update a station (authenticated, owner only)
- `DELETE /api/stations/{id}` - Delete a station (authenticated, owner only)

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

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- CORS configuration for frontend access
- User authorization for station management
- Input validation on both frontend and backend
- PostgreSQL with parameterized queries to prevent SQL injection

## License

MIT
