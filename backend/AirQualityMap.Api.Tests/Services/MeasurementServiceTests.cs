using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;

namespace AirQualityMap.Api.Tests.Services;

/// <summary>
/// Integration tests for the MeasurementService class covering measurement operations.
/// These tests use an in-memory database to validate service behavior with actual EF Core operations.
/// </summary>
public class MeasurementServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly MeasurementService _measurementService;

    public MeasurementServiceTests()
    {
        _context = InMemoryDbContextFactory.CreateDbContext();
        _measurementService = new MeasurementService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private async Task<int> CreateTestStationAsync(int userId = 1, string name = "Test Station")
    {
        var station = TestDataBuilder.CreateTestStation(id: 0, name: name, userId: userId);
        _context.Stations.Add(station);
        await _context.SaveChangesAsync();
        return station.Id;
    }

    [Fact]
    public async Task GetMeasurementsByStationAsync_WithNoMeasurements_ReturnsEmptyList()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();

        // Act
        var measurements = await _measurementService.GetMeasurementsByStationAsync(stationId);

        // Assert
        Assert.NotNull(measurements);
        Assert.Empty(measurements);
    }

    [Fact]
    public async Task GetMeasurementsByStationAsync_WithMultipleMeasurements_ReturnsAllMeasurements()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        
        var measurement1 = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 35);
        var measurement2 = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 40);
        
        _context.Measurements.Add(measurement1);
        _context.Measurements.Add(measurement2);
        await _context.SaveChangesAsync();

        // Act
        var measurements = await _measurementService.GetMeasurementsByStationAsync(stationId);

        // Assert
        Assert.NotNull(measurements);
        Assert.Equal(2, measurements.Count());
    }

    [Fact]
    public async Task GetMeasurementsByStationAsync_ReturnsOrderedByCreatedAtDescending()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        
        var older = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 35);
        older.CreatedAt = DateTime.UtcNow.AddHours(-2);
        
        var newer = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 40);
        newer.CreatedAt = DateTime.UtcNow.AddHours(-1);
        
        _context.Measurements.Add(older);
        _context.Measurements.Add(newer);
        await _context.SaveChangesAsync();

        // Act
        var measurements = await _measurementService.GetMeasurementsByStationAsync(stationId);

        // Assert
        var measurementList = measurements.ToList();
        Assert.Equal(40, measurementList[0].PM25); // Newer measurement first
        Assert.Equal(35, measurementList[1].PM25); // Older measurement second
    }

    [Fact]
    public async Task GetLastMeasurementByStationAsync_WithMeasurements_ReturnsLatestMeasurement()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        
        var older = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 35);
        older.CreatedAt = DateTime.UtcNow.AddHours(-2);
        
        var latest = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 50);
        latest.CreatedAt = DateTime.UtcNow;
        
        _context.Measurements.Add(older);
        _context.Measurements.Add(latest);
        await _context.SaveChangesAsync();

        // Act
        var lastMeasurement = await _measurementService.GetLastMeasurementByStationAsync(stationId);

        // Assert
        Assert.NotNull(lastMeasurement);
        Assert.Equal(50, lastMeasurement.PM25);
    }

    [Fact]
    public async Task GetLastMeasurementByStationAsync_WithNoMeasurements_ReturnsNull()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();

        // Act
        var lastMeasurement = await _measurementService.GetLastMeasurementByStationAsync(stationId);

        // Assert
        Assert.Null(lastMeasurement);
    }

    [Fact]
    public async Task GetMeasurementByIdAsync_WithExistingMeasurement_ReturnsMeasurement()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurement = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 42);
        _context.Measurements.Add(measurement);
        await _context.SaveChangesAsync();

        // Act
        var foundMeasurement = await _measurementService.GetMeasurementByIdAsync(measurement.Id);

        // Assert
        Assert.NotNull(foundMeasurement);
        Assert.Equal(measurement.Id, foundMeasurement.Id);
        Assert.Equal(42, foundMeasurement.PM25);
        Assert.Equal(stationId, foundMeasurement.StationId);
    }

    [Fact]
    public async Task GetMeasurementByIdAsync_WithNonExistentMeasurement_ReturnsNull()
    {
        // Act
        var foundMeasurement = await _measurementService.GetMeasurementByIdAsync(999);

        // Assert
        Assert.Null(foundMeasurement);
    }

    [Fact]
    public async Task CreateMeasurementAsync_WithValidData_CreatesMeasurement()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurementDto = new MeasurementDto
        {
            StationId = stationId,
            PM25 = 35,
            PM10 = 50,
            Temperature = 22.5f
        };

        // Act
        var createdMeasurement = await _measurementService.CreateMeasurementAsync(measurementDto);

        // Assert
        Assert.NotNull(createdMeasurement);
        Assert.True(createdMeasurement.Id > 0);
        Assert.Equal(measurementDto.StationId, createdMeasurement.StationId);
        Assert.Equal(measurementDto.PM25, createdMeasurement.PM25);
        Assert.Equal(measurementDto.PM10, createdMeasurement.PM10);
        Assert.Equal(measurementDto.Temperature, createdMeasurement.Temperature);
        Assert.NotNull(createdMeasurement.CreatedAt);
        Assert.True((DateTime.UtcNow - createdMeasurement.CreatedAt.Value).TotalSeconds < 5);

        // Verify measurement was persisted
        var dbMeasurement = await _context.Measurements.FindAsync(createdMeasurement.Id);
        Assert.NotNull(dbMeasurement);
    }

    [Fact]
    public async Task CreateMeasurementAsync_WithNonExistentStation_ThrowsInvalidOperationException()
    {
        // Arrange
        var measurementDto = new MeasurementDto
        {
            StationId = 999,
            PM25 = 35,
            PM10 = 50,
            Temperature = 22.5f
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _measurementService.CreateMeasurementAsync(measurementDto)
        );
        Assert.Contains("Station with ID 999 not found", exception.Message);
    }

    [Fact]
    public async Task CreateMeasurementAsync_WithNullTemperature_CreatesMeasurementSuccessfully()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurementDto = new MeasurementDto
        {
            StationId = stationId,
            PM25 = 35,
            PM10 = 50,
            Temperature = null
        };

        // Act
        var createdMeasurement = await _measurementService.CreateMeasurementAsync(measurementDto);

        // Assert
        Assert.NotNull(createdMeasurement);
        Assert.Null(createdMeasurement.Temperature);
    }

    [Fact]
    public async Task UpdateMeasurementAsync_WithValidData_UpdatesMeasurement()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurement = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId, pm25: 35, pm10: 50);
        _context.Measurements.Add(measurement);
        await _context.SaveChangesAsync();

        var updateDto = new MeasurementDto
        {
            PM25 = 45,
            PM10 = 60,
            Temperature = 25.0f
        };

        // Act
        var updatedMeasurement = await _measurementService.UpdateMeasurementAsync(measurement.Id, updateDto);

        // Assert
        Assert.NotNull(updatedMeasurement);
        Assert.Equal(45, updatedMeasurement.PM25);
        Assert.Equal(60, updatedMeasurement.PM10);
        Assert.Equal(25.0f, updatedMeasurement.Temperature);

        // Verify changes were persisted
        var dbMeasurement = await _context.Measurements.FindAsync(measurement.Id);
        Assert.Equal(45, dbMeasurement!.PM25);
    }

    [Fact]
    public async Task UpdateMeasurementAsync_WithNonExistentMeasurement_ReturnsNull()
    {
        // Arrange
        var updateDto = new MeasurementDto
        {
            PM25 = 45,
            PM10 = 60,
            Temperature = 25.0f
        };

        // Act
        var result = await _measurementService.UpdateMeasurementAsync(999, updateDto);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteMeasurementAsync_WithValidId_DeletesMeasurement()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurement = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: stationId);
        _context.Measurements.Add(measurement);
        await _context.SaveChangesAsync();
        var measurementId = measurement.Id;

        // Act
        var result = await _measurementService.DeleteMeasurementAsync(measurementId);

        // Assert
        Assert.True(result);

        // Verify measurement was deleted
        var dbMeasurement = await _context.Measurements.FindAsync(measurementId);
        Assert.Null(dbMeasurement);
    }

    [Fact]
    public async Task DeleteMeasurementAsync_WithNonExistentMeasurement_ReturnsFalse()
    {
        // Act
        var result = await _measurementService.DeleteMeasurementAsync(999);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task GetMeasurementsByStationAsync_OnlyReturnsSpecificStationMeasurements()
    {
        // Arrange
        var station1Id = await CreateTestStationAsync(userId: 1, name: "Station 1");
        var station2Id = await CreateTestStationAsync(userId: 1, name: "Station 2");
        
        var measurement1 = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: station1Id, pm25: 35);
        var measurement2 = TestDataBuilder.CreateTestMeasurement(id: 0, stationId: station2Id, pm25: 40);
        
        _context.Measurements.Add(measurement1);
        _context.Measurements.Add(measurement2);
        await _context.SaveChangesAsync();

        // Act
        var station1Measurements = await _measurementService.GetMeasurementsByStationAsync(station1Id);

        // Assert
        Assert.Single(station1Measurements);
        Assert.Equal(35, station1Measurements.First().PM25);
    }

    [Fact]
    public async Task CreateMeasurementAsync_WithIntegerPMValues_HandlesCorrectly()
    {
        // Arrange
        var stationId = await CreateTestStationAsync();
        var measurementDto = new MeasurementDto
        {
            StationId = stationId,
            PM25 = 100,
            PM10 = 150,
            Temperature = 20.0f
        };

        // Act
        var createdMeasurement = await _measurementService.CreateMeasurementAsync(measurementDto);

        // Assert
        Assert.Equal(100, createdMeasurement.PM25);
        Assert.Equal(150, createdMeasurement.PM10);
    }
}
