using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services.Contracts;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace AirQualityMap.Api.Tests.Controllers;

/// <summary>
/// Unit tests for the MeasurementsController covering CRUD operations for air quality measurements.
/// These tests validate controller behavior including authorization and error handling.
/// </summary>
public class MeasurementsControllerTests
{
    private readonly Mock<IMeasurementService> _mockMeasurementService;
    private readonly MeasurementsController _controller;

    public MeasurementsControllerTests()
    {
        _mockMeasurementService = new Mock<IMeasurementService>();
        _controller = new MeasurementsController(_mockMeasurementService.Object);
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
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetMeasurementsByStation_ReturnsAllMeasurementsForStation()
    {
        // Arrange
        var stationId = 1;
        var measurements = new List<MeasurementDto>
        {
            new() { Id = 1, StationId = stationId, PM25 = 35, PM10 = 50, Temperature = 22.5f, CreatedAt = DateTime.UtcNow },
            new() { Id = 2, StationId = stationId, PM25 = 40, PM10 = 55, Temperature = 23.0f, CreatedAt = DateTime.UtcNow }
        };

        _mockMeasurementService.Setup(s => s.GetMeasurementsByStationAsync(stationId))
            .ReturnsAsync(measurements);

        // Act
        var result = await _controller.GetMeasurementsByStation(stationId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMeasurements = Assert.IsAssignableFrom<IEnumerable<MeasurementDto>>(okResult.Value);
        Assert.Equal(2, returnedMeasurements.Count());
        _mockMeasurementService.Verify(s => s.GetMeasurementsByStationAsync(stationId), Times.Once);
    }

    [Fact]
    public async Task GetMeasurementsByStation_WithNoMeasurements_ReturnsEmptyList()
    {
        // Arrange
        var stationId = 999;
        _mockMeasurementService.Setup(s => s.GetMeasurementsByStationAsync(stationId))
            .ReturnsAsync(new List<MeasurementDto>());

        // Act
        var result = await _controller.GetMeasurementsByStation(stationId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMeasurements = Assert.IsAssignableFrom<IEnumerable<MeasurementDto>>(okResult.Value);
        Assert.Empty(returnedMeasurements);
    }

    [Fact]
    public async Task GetLastMeasurementByStation_WithExistingMeasurements_ReturnsLatestMeasurement()
    {
        // Arrange
        var stationId = 1;
        var lastMeasurement = new MeasurementDto
        {
            Id = 5,
            StationId = stationId,
            PM25 = 42,
            PM10 = 58,
            Temperature = 24.0f,
            CreatedAt = DateTime.UtcNow
        };

        _mockMeasurementService.Setup(s => s.GetLastMeasurementByStationAsync(stationId))
            .ReturnsAsync(lastMeasurement);

        // Act
        var result = await _controller.GetLastMeasurementByStation(stationId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMeasurement = Assert.IsType<MeasurementDto>(okResult.Value);
        Assert.Equal(5, returnedMeasurement.Id);
        Assert.Equal(42, returnedMeasurement.PM25);
    }

    [Fact]
    public async Task GetLastMeasurementByStation_WithNoMeasurements_ReturnsNotFound()
    {
        // Arrange
        var stationId = 999;
        _mockMeasurementService.Setup(s => s.GetLastMeasurementByStationAsync(stationId))
            .ReturnsAsync((MeasurementDto?)null);

        // Act
        var result = await _controller.GetLastMeasurementByStation(stationId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.NotNull(notFoundResult.Value);
    }

    [Fact]
    public async Task GetMeasurement_WithValidId_ReturnsMeasurement()
    {
        // Arrange
        var measurement = new MeasurementDto
        {
            Id = 42,
            StationId = 1,
            PM25 = 35,
            PM10 = 50,
            Temperature = 22.5f,
            CreatedAt = DateTime.UtcNow
        };

        _mockMeasurementService.Setup(s => s.GetMeasurementByIdAsync(42))
            .ReturnsAsync(measurement);

        // Act
        var result = await _controller.GetMeasurement(42);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedMeasurement = Assert.IsType<MeasurementDto>(okResult.Value);
        Assert.Equal(42, returnedMeasurement.Id);
    }

    [Fact]
    public async Task GetMeasurement_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockMeasurementService.Setup(s => s.GetMeasurementByIdAsync(999))
            .ReturnsAsync((MeasurementDto?)null);

        // Act
        var result = await _controller.GetMeasurement(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task CreateMeasurement_WithValidData_CreatesMeasurement()
    {
        // Arrange
        SetupUserContext(1);

        var measurementDto = new MeasurementDto
        {
            StationId = 1,
            PM25 = 35,
            PM10 = 50,
            Temperature = 22.5f
        };

        var createdMeasurement = new MeasurementDto
        {
            Id = 1,
            StationId = 1,
            PM25 = 35,
            PM10 = 50,
            Temperature = 22.5f,
            CreatedAt = DateTime.UtcNow
        };

        _mockMeasurementService.Setup(s => s.CreateMeasurementAsync(measurementDto))
            .ReturnsAsync(createdMeasurement);

        // Act
        var result = await _controller.CreateMeasurement(measurementDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(MeasurementsController.GetMeasurement), createdResult.ActionName);
        var returnedMeasurement = Assert.IsType<MeasurementDto>(createdResult.Value);
        Assert.Equal(1, returnedMeasurement.Id);
        _mockMeasurementService.Verify(s => s.CreateMeasurementAsync(measurementDto), Times.Once);
    }

    [Fact]
    public async Task CreateMeasurement_WithInvalidStationId_ReturnsBadRequest()
    {
        // Arrange
        SetupUserContext(1);

        var measurementDto = new MeasurementDto
        {
            StationId = 999,
            PM25 = 35,
            PM10 = 50
        };

        _mockMeasurementService.Setup(s => s.CreateMeasurementAsync(measurementDto))
            .ThrowsAsync(new InvalidOperationException("Station with ID 999 not found."));

        // Act
        var result = await _controller.CreateMeasurement(measurementDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateMeasurement_WithValidData_UpdatesMeasurement()
    {
        // Arrange
        SetupUserContext(1);

        var updateDto = new MeasurementDto
        {
            PM25 = 45,
            PM10 = 60,
            Temperature = 25.0f
        };

        var updatedMeasurement = new MeasurementDto
        {
            Id = 1,
            StationId = 1,
            PM25 = 45,
            PM10 = 60,
            Temperature = 25.0f,
            CreatedAt = DateTime.UtcNow
        };

        _mockMeasurementService.Setup(s => s.UpdateMeasurementAsync(1, updateDto))
            .ReturnsAsync(updatedMeasurement);

        // Act
        var result = await _controller.UpdateMeasurement(1, updateDto);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockMeasurementService.Verify(s => s.UpdateMeasurementAsync(1, updateDto), Times.Once);
    }

    [Fact]
    public async Task UpdateMeasurement_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        SetupUserContext(1);

        var updateDto = new MeasurementDto
        {
            PM25 = 45,
            PM10 = 60
        };

        _mockMeasurementService.Setup(s => s.UpdateMeasurementAsync(999, updateDto))
            .ReturnsAsync((MeasurementDto?)null);

        // Act
        var result = await _controller.UpdateMeasurement(999, updateDto);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteMeasurement_WithValidId_DeletesMeasurement()
    {
        // Arrange
        SetupUserContext(1);

        _mockMeasurementService.Setup(s => s.DeleteMeasurementAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteMeasurement(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockMeasurementService.Verify(s => s.DeleteMeasurementAsync(1), Times.Once);
    }

    [Fact]
    public async Task DeleteMeasurement_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        SetupUserContext(1);

        _mockMeasurementService.Setup(s => s.DeleteMeasurementAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteMeasurement(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
}
