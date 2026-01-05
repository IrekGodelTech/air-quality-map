using AirQualityMap.Api.Data;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace AirQualityMap.Api.Tests.Services;

/// <summary>
/// Integration tests for the DatabaseSeeder class covering seed data initialization.
/// These tests validate that the seeder correctly populates an empty database with initial data
/// and handles non-empty databases appropriately.
/// </summary>
public class DatabaseSeederTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<ILogger<DatabaseSeeder>> _mockLogger;
    private readonly DatabaseSeeder _seeder;

    public DatabaseSeederTests()
    {
        _context = InMemoryDbContextFactory.CreateDbContext();
        _mockLogger = new Mock<ILogger<DatabaseSeeder>>();
        _seeder = new DatabaseSeeder(_context, _mockLogger.Object);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task SeedAsync_WithEmptyDatabase_SeedsAdminUserAndSampleStation()
    {
        // Arrange
        Assert.Empty(await _context.Users.ToListAsync());
        Assert.Empty(await _context.Stations.ToListAsync());

        // Act
        await _seeder.SeedAsync();

        // Assert
        var users = await _context.Users.ToListAsync();
        var stations = await _context.Stations.ToListAsync();

        Assert.Single(users);
        Assert.Single(stations);

        // Verify admin user details
        var adminUser = users.First();
        Assert.Equal("admin", adminUser.Username);
        Assert.Equal("admin@admin.com", adminUser.Email);
        Assert.NotEmpty(adminUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("admin", adminUser.PasswordHash));

        // Verify sample station details
        var station = stations.First();
        Assert.Equal("sample-station", station.Name);
        Assert.Equal(51.110374, station.Latitude);
        Assert.Equal(17.062858, station.Longitude);
        Assert.Equal("https://api.thingspeak.com/channels/2415188/feeds/last.json", station.MeasurementEndpoint);
        Assert.Equal(adminUser.Id, station.UserId);
    }

    [Fact]
    public async Task SeedAsync_WithEmptyDatabase_LogsInformationMessages()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Database is empty")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Admin user created successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Sample station")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_WithExistingData_DoesNotSeedAgain()
    {
        // Arrange
        var existingUser = TestDataBuilder.CreateTestUser(id: 0, username: "existinguser");
        _context.Users.Add(existingUser);
        await _context.SaveChangesAsync();

        // Act
        await _seeder.SeedAsync();

        // Assert
        var users = await _context.Users.ToListAsync();
        var stations = await _context.Stations.ToListAsync();

        // Should only have the one existing user, no new data
        Assert.Single(users);
        Assert.Empty(stations);
        Assert.Equal("existinguser", users.First().Username);

        // Verify skip message was logged
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("already contains data")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_IsIdempotent_CanBeCalledMultipleTimes()
    {
        // Act - Call seed multiple times
        await _seeder.SeedAsync();
        await _seeder.SeedAsync();
        await _seeder.SeedAsync();

        // Assert - Should only have one admin user and one station
        var users = await _context.Users.ToListAsync();
        var stations = await _context.Stations.ToListAsync();

        Assert.Single(users);
        Assert.Single(stations);
    }

    [Fact]
    public async Task SeedAsync_CreatesStationLinkedToAdminUser()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var station = await _context.Stations
            .Include(s => s.User)
            .FirstOrDefaultAsync();

        Assert.NotNull(station);
        Assert.NotNull(station.User);
        Assert.Equal("admin", station.User.Username);
    }

    [Fact]
    public async Task SeedAsync_CreatedTimestampsAreRecent()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var user = await _context.Users.FirstAsync();
        var station = await _context.Stations.FirstAsync();

        var now = DateTime.UtcNow;
        Assert.True((now - user.CreatedAt).TotalSeconds < 5);
        Assert.True((now - station.CreatedAt).TotalSeconds < 5);
    }

    [Fact]
    public async Task SeedAsync_AdminPasswordIsProperlyHashed()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var admin = await _context.Users.FirstAsync();

        // Password should be hashed, not plain text
        Assert.NotEqual("admin", admin.PasswordHash);
        
        // Should be able to verify with BCrypt
        Assert.True(BCrypt.Net.BCrypt.Verify("admin", admin.PasswordHash));
        
        // Should fail with wrong password
        Assert.False(BCrypt.Net.BCrypt.Verify("wrongpassword", admin.PasswordHash));
    }

    [Fact]
    public async Task SeedAsync_StationHasDescriptionField()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var station = await _context.Stations.FirstAsync();
        Assert.NotEmpty(station.Description);
        Assert.Equal("Sample air quality monitoring station", station.Description);
    }

    [Fact]
    public async Task SeedAsync_CoordinatesAreValidWroclawLocation()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var station = await _context.Stations.FirstAsync();
        
        // Verify coordinates are within Wroclaw area (Poland)
        Assert.InRange(station.Latitude, 51.0, 51.2);
        Assert.InRange(station.Longitude, 16.9, 17.2);
    }

    [Fact]
    public async Task SeedAsync_MeasurementEndpointIsValidUrl()
    {
        // Act
        await _seeder.SeedAsync();

        // Assert
        var station = await _context.Stations.FirstAsync();
        
        Assert.True(Uri.TryCreate(station.MeasurementEndpoint, UriKind.Absolute, out var uri));
        Assert.Equal("https", uri.Scheme);
        Assert.Contains("thingspeak.com", uri.Host);
    }
}
