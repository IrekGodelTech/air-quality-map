using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeasurementsController : ControllerBase
{
    private readonly IMeasurementService _measurementService;

    public MeasurementsController(IMeasurementService measurementService)
    {
        _measurementService = measurementService;
    }

    [HttpGet("station/{stationId}")]
    public async Task<ActionResult<IEnumerable<MeasurementDto>>> GetMeasurementsByStation(int stationId)
    {
        var measurements = await _measurementService.GetMeasurementsByStationAsync(stationId);
        return Ok(measurements);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MeasurementDto>> GetMeasurement(int id)
    {
        var measurement = await _measurementService.GetMeasurementByIdAsync(id);
        if (measurement is null)
        {
            return NotFound();
        }

        return Ok(measurement);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<MeasurementDto>> CreateMeasurement(MeasurementDto dto)
    {
        try
        {
            var measurement = await _measurementService.CreateMeasurementAsync(dto);
            return CreatedAtAction(nameof(GetMeasurement), new { id = measurement.Id }, measurement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeasurement(int id, MeasurementDto dto)
    {
        var updated = await _measurementService.UpdateMeasurementAsync(id, dto);
        if (updated is null)
        {
            return NotFound();
        }

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeasurement(int id)
    {
        var deleted = await _measurementService.DeleteMeasurementAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
