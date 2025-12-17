using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AirQualityMap.Api.Tests.Controllers;

public class StationsControllerTests
{
    private readonly AppDbContext _dbContext;
    private readonly StationsController _stationsController;

    public StationsControllerTests()
    {
        _dbContext = InMemoryDbContextFactory.CreateDbContext();
        _stationsController = new StationsController(_dbContext);
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
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        var station1 = TestDataBuilder.CreateTestStation(id: 1, name: "Station 1", userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 2, name: "Station 2", userId: 1);
        _dbContext.Stations.AddRange(station1, station2);
        await _dbContext.SaveChangesAsync();

        var result = await _stationsController.GetStations();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var stations = Assert.IsAssignableFrom<IEnumerable<StationDto>>(okResult.Value);
        Assert.Equal(2, stations.Count());
    }

    [Fact]
    public async Task GetStation_WithValidId_ReturnsStation()
    {
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        var station = TestDataBuilder.CreateTestStation(id: 42, name: "Test Station", userId: 1);
        _dbContext.Stations.Add(station);
        await _dbContext.SaveChangesAsync();

        var result = await _stationsController.GetStation(42);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedStation = Assert.IsType<StationDto>(okResult.Value);
        Assert.Equal(42, returnedStation.Id);
        Assert.Equal("Test Station", returnedStation.Name);
    }

    [Fact]
    public async Task CreateStation_WithValidData_CreatesStation()
    {
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        SetupUserContext(1);

        var stationDto = new StationDto
        {
            Name = "New Station",
            Description = "A new monitoring station",
            Latitude = 40.7128,
            Longitude = -74.0060,
            MeasurementEndpoint = "https://api.example.com/measurements"
        };

        var result = await _stationsController.CreateStation(stationDto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(StationsController.GetStation), createdResult.ActionName);
    }

    [Fact]
    public async Task UpdateStation_WithValidDataAndOwner_UpdatesStation()
    {
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        var station = TestDataBuilder.CreateTestStation(id: 1, name: "Original Name", userId: 1);
        _dbContext.Stations.Add(station);
        await _dbContext.SaveChangesAsync();
        SetupUserContext(1);

        var updateDto = new StationDto
        {
            Name = "Updated Name",
            Description = "Updated Description",
            Latitude = 41.0000,
            Longitude = -75.0000,
            MeasurementEndpoint = "https://api.example.com/updated"
        };

        var result = await _stationsController.UpdateStation(1, updateDto);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteStation_WithValidIdAndOwner_DeletesStation()
    {
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        var station = TestDataBuilder.CreateTestStation(id: 1, userId: 1);
        _dbContext.Stations.Add(station);
        await _dbContext.SaveChangesAsync();
        SetupUserContext(1);

        var result = await _stationsController.DeleteStation(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteStation_WithDifferentOwner_ReturnsForbid()
    {
        var user = TestDataBuilder.CreateTestUser(id: 1);
        _dbContext.Users.Add(user);
        var station = TestDataBuilder.CreateTestStation(id: 1, userId: 1);
        _dbContext.Stations.Add(station);
        await _dbContext.SaveChangesAsync();
        SetupUserContext(2);

        var result = await _stationsController.DeleteStation(1);

        Assert.IsType<ForbidResult>(result);
    }
}
