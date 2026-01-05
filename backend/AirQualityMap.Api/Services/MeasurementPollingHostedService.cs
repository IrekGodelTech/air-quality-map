using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Background service that periodically fetches measurements from external station endpoints.
/// Respects the configured polling interval from appsettings.json (MeasurementPolling:IntervalSeconds).
/// </summary>
public class MeasurementPollingHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MeasurementPollingHostedService> _logger;
    private readonly int _intervalSeconds;

    public MeasurementPollingHostedService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<MeasurementPollingHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;

        // Get the polling interval from configuration, default to 3600 seconds (1 hour)
        _intervalSeconds = configuration.GetValue("MeasurementPolling:IntervalSeconds", 3600);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Measurement polling service starting. Polling interval: {IntervalSeconds} seconds", _intervalSeconds);

        // Initial delay to allow application startup to complete
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Starting periodic measurement fetch");

                using (var scope = _serviceProvider.CreateScope())
                {
                    var externalMeasurementService = scope.ServiceProvider.GetRequiredService<IExternalMeasurementService>();
                    await externalMeasurementService.FetchAndSyncMeasurementsAsync();
                }

                _logger.LogInformation("Completed periodic measurement fetch. Next fetch in {IntervalSeconds} seconds", _intervalSeconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in measurement polling service");
            }

            // Wait for the configured interval before the next fetch
            await Task.Delay(TimeSpan.FromSeconds(_intervalSeconds), stoppingToken);
        }

        _logger.LogInformation("Measurement polling service stopped");
    }
}
