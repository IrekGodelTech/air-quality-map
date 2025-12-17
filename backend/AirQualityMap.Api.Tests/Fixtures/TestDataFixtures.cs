using AirQualityMap.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace AirQualityMap.Api.Tests.Fixtures;

/// <summary>
/// Provides an in-memory database context for testing without requiring a real PostgreSQL instance.
/// This fixture ensures test isolation and fast execution.
/// </summary>
public class InMemoryDbContextFactory
{
    public static AppDbContext CreateDbContext(string databaseName = "TestDatabase")
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName + Guid.NewGuid())
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}

/// <summary>
/// Fixture for test data generation following consistent patterns.
/// </summary>
public static class TestDataBuilder
{
    public static Models.User CreateTestUser(
        int id = 1,
        string username = "testuser",
        string email = "test@example.com",
        string passwordHash = "hashedpassword")
    {
        return new Models.User
        {
            Id = id,
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static Models.AirQualityStation CreateTestStation(
        int id = 1,
        string name = "Test Station",
        string description = "A test air quality station",
        double latitude = 40.7128,
        double longitude = -74.0060,
        string measurementEndpoint = "https://api.example.com/measurements",
        int userId = 1)
    {
        return new Models.AirQualityStation
        {
            Id = id,
            Name = name,
            Description = description,
            Latitude = latitude,
            Longitude = longitude,
            MeasurementEndpoint = measurementEndpoint,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
