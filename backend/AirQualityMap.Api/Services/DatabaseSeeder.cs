using Microsoft.EntityFrameworkCore;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.Models;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Service responsible for seeding initial data into the database.
/// Follows the Single Responsibility Principle by separating seed logic from application startup.
/// </summary>
public class DatabaseSeeder
{
    private readonly AppDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(AppDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with initial data if it is empty.
    /// This method ensures idempotency by checking if data already exists.
    /// </summary>
    public async Task SeedAsync()
    {
        if (await IsDatabaseEmptyAsync())
        {
            _logger.LogInformation("Database is empty. Starting seed data initialization...");
            
            await SeedAdminUserAsync();
            await SeedSampleStationAsync();
            
            _logger.LogInformation("Seed data initialization completed successfully.");
        }
        else
        {
            _logger.LogInformation("Database already contains data. Skipping seed data initialization.");
        }
    }

    /// <summary>
    /// Checks if the database is empty by verifying if any users exist.
    /// </summary>
    private async Task<bool> IsDatabaseEmptyAsync()
    {
        return !await _context.Users.AnyAsync();
    }

    /// <summary>
    /// Seeds the default admin user with credentials:
    /// Username: admin, Password: admin, Email: admin@admin.com
    /// </summary>
    private async Task SeedAdminUserAsync()
    {
        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@admin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(adminUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Admin user created successfully with username: {Username}", adminUser.Username);
    }

    /// <summary>
    /// Seeds a sample air quality station linked to the admin user.
    /// Station data is retrieved from ThingSpeak API.
    /// </summary>
    private async Task SeedSampleStationAsync()
    {
        // Retrieve the admin user that was just created
        var adminUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == "admin");

        if (adminUser is null)
        {
            _logger.LogError("Cannot seed sample station: Admin user not found.");
            return;
        }

        var sampleStation = new AirQualityStation
        {
            Name = "sample-station",
            Description = "Sample air quality monitoring station",
            Latitude = 51.110374,
            Longitude = 17.062858,
            MeasurementEndpoint = "https://api.thingspeak.com/channels/2415188/feeds/last.json",
            CreatedAt = DateTime.UtcNow,
            UserId = adminUser.Id
        };

        _context.Stations.Add(sampleStation);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Sample station '{StationName}' created successfully at coordinates ({Latitude}, {Longitude})",
            sampleStation.Name,
            sampleStation.Latitude,
            sampleStation.Longitude
        );
    }
}
