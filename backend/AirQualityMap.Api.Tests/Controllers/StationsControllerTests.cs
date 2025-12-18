using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace AirQualityMap.Api.Tests.Controllers;

public class StationsControllerTests
{
    private readonly Mock<IStationService> _mockStationService;
    private readonly StationsController _stationsController;

    public StationsControllerTests()
    {
        _mockStationService = new Mock<IStationService>();
        _stationsController = new StationsController(_mockStationService.Object);
    }

    private void SetupUserContext(int userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, "testuser")
        };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);
        _stationsController.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetStations_ReturnsAllStations()
    {
        var station1 = TestDataBuilder.CreateTestStation(id: 1, name: "Station 1", userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 2, name: "Station 2", userId: 1);
        var stations = new[] { 
            new StationDto { Id = 1, Name = "Station 1", Description = station1.Description, Latitude = station1.Latitude, Longitude = station1.Longitude, MeasurementEndpoint = station1.MeasurementEndpoint, CreatedAt = station1.CreatedAt },
            new StationDto { Id = 2, Name = "Station 2", Description = station2.Description, Latitude = station2.Latitude, Longitude = station2.Longitude, MeasurementEndpoint = station2.MeasurementEndpoint, CreatedAt = station2.CreatedAt }
        };

        _mockStationService.Setup(s => s.GetAllStationsAsync())
            .ReturnsAsync(stations);

        var result = await _stationsController.GetStations();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedStations = Assert.IsAssignableFrom<IEnumerable<StationDto>>(okResult.Value);
        Assert.Equal(2, returnedStations.Count());
    }

    [Fact]
    public async Task GetStation_WithValidId_ReturnsStation()
    {
        var station = TestDataBuilder.CreateTestStation(id: 42, name: "Test Station", userId: 1);
        var stationDto = new StationDto
        {
            Id = 42,
            Name = "Test Station",
            Description = station.Description,
            Latitude = station.Latitude,
            Longitude = station.Longitude,
            MeasurementEndpoint = station.MeasurementEndpoint,
            CreatedAt = station.CreatedAt
        };

        _mockStationService.Setup(s => s.GetStationByIdAsync(42))
            .ReturnsAsync(stationDto);

        var result = await _stationsController.GetStation(42);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedStation = Assert.IsType<StationDto>(okResult.Value);
        Assert.Equal(42, returnedStation.Id);
        Assert.Equal("Test Station", returnedStation.Name);
    }

    [Fact]
    public async Task CreateStation_WithValidData_CreatesStation()
    {
        SetupUserContext(1);

        var stationDto = new StationDto
        {
            Name = "New Station",
            Description = "A new monitoring station",
            Latitude = 40.7128,
            Longitude = -74.0060,
            MeasurementEndpoint = "https://api.example.com/measurements"
        };

        var createdDto = new StationDto
        {
            Id = 1,
            Name = "New Station",
            Description = "A new monitoring station",
            Latitude = 40.7128,
            Longitude = -74.0060,
            MeasurementEndpoint = "https://api.example.com/measurements",
            CreatedAt = DateTime.UtcNow
        };

        _mockStationService.Setup(s => s.CreateStationAsync(stationDto, 1))
            .ReturnsAsync(createdDto);

        var result = await _stationsController.CreateStation(stationDto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(StationsController.GetStation), createdResult.ActionName);
    }

    [Fact]
    public async Task UpdateStation_WithValidDataAndOwner_UpdatesStation()
    {
        SetupUserContext(1);

        var updateDto = new StationDto
        {
            Name = "Updated Name",
            Description = "Updated Description",
            Latitude = 41.0000,
            Longitude = -75.0000,
            MeasurementEndpoint = "https://api.example.com/updated"
        };

        var updatedDto = new StationDto
        {
            Id = 1,
            Name = "Updated Name",
            Description = "Updated Description",
            Latitude = 41.0000,
            Longitude = -75.0000,
            MeasurementEndpoint = "https://api.example.com/updated",
            CreatedAt = DateTime.UtcNow
        };

        _mockStationService.Setup(s => s.UpdateStationAsync(1, updateDto, 1))
            .ReturnsAsync(updatedDto);

        var result = await _stationsController.UpdateStation(1, updateDto);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteStation_WithValidIdAndOwner_DeletesStation()
    {
        SetupUserContext(1);

        _mockStationService.Setup(s => s.DeleteStationAsync(1, 1))
            .ReturnsAsync(true);

        var result = await _stationsController.DeleteStation(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteStation_WithDifferentOwner_ReturnsForbid()
    {
        SetupUserContext(2);

        _mockStationService.Setup(s => s.DeleteStationAsync(1, 2))
            .ReturnsAsync(false);

        var result = await _stationsController.DeleteStation(1);

        Assert.IsType<ForbidResult>(result);
    }
}
