using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;

namespace AirQualityMap.Api.Tests.Services;

/// <summary>
/// Integration tests for the StationService class covering station management operations.
/// These tests use an in-memory database to validate service behavior with actual EF Core operations.
/// </summary>
public class StationServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly StationService _stationService;

    public StationServiceTests()
    {
        _context = InMemoryDbContextFactory.CreateDbContext();
        _stationService = new StationService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetAllStationsAsync_WithNoStations_ReturnsEmptyList()
    {
        // Act
        var stations = await _stationService.GetAllStationsAsync();

        // Assert
        Assert.NotNull(stations);
        Assert.Empty(stations);
    }

    [Fact]
    public async Task GetAllStationsAsync_WithMultipleStations_ReturnsAllStations()
    {
        // Arrange
        var station1 = TestDataBuilder.CreateTestStation(id: 0, name: "Station 1", userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 0, name: "Station 2", userId: 1);
        
        _context.Stations.Add(station1);
        _context.Stations.Add(station2);
        await _context.SaveChangesAsync();

        // Act
        var stations = await _stationService.GetAllStationsAsync();

        // Assert
        Assert.NotNull(stations);
        Assert.Equal(2, stations.Count());
    }

    [Fact]
    public async Task GetStationByIdAsync_WithExistingStation_ReturnsStation()
    {
        // Arrange
        var station = TestDataBuilder.CreateTestStation(id: 0, name: "Test Station", userId: 1);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();

        // Act
        var foundStation = await _stationService.GetStationByIdAsync(station.Id);

        // Assert
        Assert.NotNull(foundStation);
        Assert.Equal(station.Id, foundStation.Id);
        Assert.Equal(station.Name, foundStation.Name);
        Assert.Equal(station.Description, foundStation.Description);
        Assert.Equal(station.Latitude, foundStation.Latitude);
        Assert.Equal(station.Longitude, foundStation.Longitude);
    }

    [Fact]
    public async Task GetStationByIdAsync_WithNonExistentStation_ReturnsNull()
    {
        // Act
        var foundStation = await _stationService.GetStationByIdAsync(999);

        // Assert
        Assert.Null(foundStation);
    }

    [Fact]
    public async Task CreateStationAsync_WithValidData_CreatesStation()
    {
        // Arrange
        var stationDto = new StationDto
        {
            Name = "New Station",
            Description = "A new monitoring station",
            Latitude = 40.7128,
            Longitude = -74.0060,
            MeasurementEndpoint = "https://api.example.com/measurements"
        };
        var userId = 1;

        // Act
        var createdStation = await _stationService.CreateStationAsync(stationDto, userId);

        // Assert
        Assert.NotNull(createdStation);
        Assert.True(createdStation.Id > 0);
        Assert.Equal(stationDto.Name, createdStation.Name);
        Assert.Equal(stationDto.Description, createdStation.Description);
        Assert.Equal(stationDto.Latitude, createdStation.Latitude);
        Assert.Equal(stationDto.Longitude, createdStation.Longitude);
        Assert.Equal(stationDto.MeasurementEndpoint, createdStation.MeasurementEndpoint);
        Assert.NotNull(createdStation.CreatedAt);
        Assert.True((DateTime.UtcNow - createdStation.CreatedAt.Value).TotalSeconds < 5);

        // Verify station was persisted to database
        var dbStation = await _context.Stations.FindAsync(createdStation.Id);
        Assert.NotNull(dbStation);
        Assert.Equal(userId, dbStation.UserId);
    }

    [Fact]
    public async Task UpdateStationAsync_WithValidDataAndOwner_UpdatesStation()
    {
        // Arrange
        var userId = 1;
        var station = TestDataBuilder.CreateTestStation(id: 0, name: "Original Station", userId: userId);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();

        var updateDto = new StationDto
        {
            Name = "Updated Station",
            Description = "Updated description",
            Latitude = 41.0,
            Longitude = -75.0,
            MeasurementEndpoint = "https://api.example.com/updated"
        };

        // Act
        var updatedStation = await _stationService.UpdateStationAsync(station.Id, updateDto, userId);

        // Assert
        Assert.NotNull(updatedStation);
        Assert.Equal(updateDto.Name, updatedStation.Name);
        Assert.Equal(updateDto.Description, updatedStation.Description);
        Assert.Equal(updateDto.Latitude, updatedStation.Latitude);
        Assert.Equal(updateDto.Longitude, updatedStation.Longitude);
        Assert.Equal(updateDto.MeasurementEndpoint, updatedStation.MeasurementEndpoint);

        // Verify changes were persisted
        var dbStation = await _context.Stations.FindAsync(station.Id);
        Assert.Equal(updateDto.Name, dbStation!.Name);
    }

    [Fact]
    public async Task UpdateStationAsync_WithDifferentOwner_ReturnsNull()
    {
        // Arrange
        var ownerId = 1;
        var otherUserId = 2;
        var station = TestDataBuilder.CreateTestStation(id: 0, userId: ownerId);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();

        var updateDto = new StationDto
        {
            Name = "Hacked Station",
            Description = "Should not update",
            Latitude = 0,
            Longitude = 0,
            MeasurementEndpoint = "https://evil.com"
        };

        // Act
        var result = await _stationService.UpdateStationAsync(station.Id, updateDto, otherUserId);

        // Assert
        Assert.Null(result);

        // Verify station was not modified
        var dbStation = await _context.Stations.FindAsync(station.Id);
        Assert.NotEqual(updateDto.Name, dbStation!.Name);
    }

    [Fact]
    public async Task UpdateStationAsync_WithNonExistentStation_ReturnsNull()
    {
        // Arrange
        var updateDto = new StationDto
        {
            Name = "Updated Station",
            Description = "Updated description",
            Latitude = 41.0,
            Longitude = -75.0,
            MeasurementEndpoint = "https://api.example.com/updated"
        };

        // Act
        var result = await _stationService.UpdateStationAsync(999, updateDto, 1);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteStationAsync_WithValidIdAndOwner_DeletesStation()
    {
        // Arrange
        var userId = 1;
        var station = TestDataBuilder.CreateTestStation(id: 0, userId: userId);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();
        var stationId = station.Id;

        // Act
        var result = await _stationService.DeleteStationAsync(stationId, userId);

        // Assert
        Assert.True(result);

        // Verify station was deleted from database
        var dbStation = await _context.Stations.FindAsync(stationId);
        Assert.Null(dbStation);
    }

    [Fact]
    public async Task DeleteStationAsync_WithDifferentOwner_ReturnsFalse()
    {
        // Arrange
        var ownerId = 1;
        var otherUserId = 2;
        var station = TestDataBuilder.CreateTestStation(id: 0, userId: ownerId);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();
        var stationId = station.Id;

        // Act
        var result = await _stationService.DeleteStationAsync(stationId, otherUserId);

        // Assert
        Assert.False(result);

        // Verify station still exists
        var dbStation = await _context.Stations.FindAsync(stationId);
        Assert.NotNull(dbStation);
    }

    [Fact]
    public async Task DeleteStationAsync_WithNonExistentStation_ReturnsFalse()
    {
        // Act
        var result = await _stationService.DeleteStationAsync(999, 1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CreateStationAsync_WithMinimalData_CreatesStationSuccessfully()
    {
        // Arrange
        var stationDto = new StationDto
        {
            Name = "Minimal Station",
            Description = "",
            Latitude = 0.0,
            Longitude = 0.0,
            MeasurementEndpoint = ""
        };

        // Act
        var createdStation = await _stationService.CreateStationAsync(stationDto, 1);

        // Assert
        Assert.NotNull(createdStation);
        Assert.Equal("Minimal Station", createdStation.Name);
        Assert.Equal("", createdStation.Description);
    }

    [Fact]
    public async Task GetAllStationsAsync_ReturnsDifferentUserStations()
    {
        // Arrange
        var station1 = TestDataBuilder.CreateTestStation(id: 0, name: "User1 Station", userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 0, name: "User2 Station", userId: 2);
        
        _context.Stations.Add(station1);
        _context.Stations.Add(station2);
        await _context.SaveChangesAsync();

        // Act
        var allStations = await _stationService.GetAllStationsAsync();

        // Assert
        Assert.Equal(2, allStations.Count());
        Assert.Contains(allStations, s => s.Name == "User1 Station");
        Assert.Contains(allStations, s => s.Name == "User2 Station");
    }
}
