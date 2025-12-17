using AirQualityMap.Api.Data;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Tests.Fixtures;

namespace AirQualityMap.Api.Tests.Data;

public class DataModelTests
{
    [Fact]
    public async Task User_WithUniqueUsername_CanBeCreated()
    {
        var dbContext = InMemoryDbContextFactory.CreateDbContext();
        var user = TestDataBuilder.CreateTestUser(username: "uniqueuser");

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var savedUser = dbContext.Users.FirstOrDefault(u => u.Username == "uniqueuser");
        Assert.NotNull(savedUser);
    }

    [Fact]
    public async Task User_WithDuplicateUsername_IsNotEnforcedInMemory()
    {
        // Note: In-memory databases do not enforce unique constraints by default.
        // This test documents the actual behavior. In production with PostgreSQL,
        // a DbUpdateException would be thrown.
        var dbContext = InMemoryDbContextFactory.CreateDbContext();
        var user1 = TestDataBuilder.CreateTestUser(id: 1, username: "duplicateuser");
        var user2 = TestDataBuilder.CreateTestUser(id: 2, username: "duplicateuser", email: "different@example.com");

        dbContext.Users.Add(user1);
        await dbContext.SaveChangesAsync();
        dbContext.Users.Add(user2);
        
        // In-memory allows this; PostgreSQL would throw
        await dbContext.SaveChangesAsync();

        var users = dbContext.Users.Where(u => u.Username == "duplicateuser").ToList();
        Assert.Equal(2, users.Count);
    }

    [Fact]
    public async Task Station_WithValidData_CanBeCreated()
    {
        var dbContext = InMemoryDbContextFactory.CreateDbContext();
        var user = TestDataBuilder.CreateTestUser(id: 1);
        var station = TestDataBuilder.CreateTestStation(id: 1, userId: 1);

        dbContext.Users.Add(user);
        dbContext.Stations.Add(station);
        await dbContext.SaveChangesAsync();

        var savedStation = dbContext.Stations.Find(1);
        Assert.NotNull(savedStation);
        Assert.Equal(1, savedStation.UserId);
    }

    [Fact]
    public async Task User_WithAssociatedStations_CascadeDeletesStations()
    {
        var dbContext = InMemoryDbContextFactory.CreateDbContext();
        var user = TestDataBuilder.CreateTestUser(id: 1);
        var station1 = TestDataBuilder.CreateTestStation(id: 1, userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 2, userId: 1);

        dbContext.Users.Add(user);
        dbContext.Stations.AddRange(station1, station2);
        await dbContext.SaveChangesAsync();

        var userToDelete = dbContext.Users.Find(1);
        Assert.NotNull(userToDelete);
        dbContext.Users.Remove(userToDelete);
        await dbContext.SaveChangesAsync();

        var remainingStations = dbContext.Stations.Where(s => s.UserId == 1).ToList();
        Assert.Empty(remainingStations);
    }

    [Fact]
    public async Task User_CanHaveMultipleStations()
    {
        var dbContext = InMemoryDbContextFactory.CreateDbContext();
        var user = TestDataBuilder.CreateTestUser(id: 1);
        var station1 = TestDataBuilder.CreateTestStation(id: 1, userId: 1);
        var station2 = TestDataBuilder.CreateTestStation(id: 2, userId: 1);
        var station3 = TestDataBuilder.CreateTestStation(id: 3, userId: 1);

        dbContext.Users.Add(user);
        dbContext.Stations.AddRange(station1, station2, station3);
        await dbContext.SaveChangesAsync();

        var userWithStations = dbContext.Users
            .Where(u => u.Id == 1)
            .Select(u => new { u.Id, StationCount = u.Stations.Count })
            .FirstOrDefault();

        Assert.NotNull(userWithStations);
        Assert.Equal(3, userWithStations.StationCount);
    }

    [Fact]
    public void Station_CanStoreCoordinates()
    {
        var latitude = 40.7128;
        var longitude = -74.0060;
        var station = TestDataBuilder.CreateTestStation(latitude: latitude, longitude: longitude);

        Assert.Equal(latitude, station.Latitude);
        Assert.Equal(longitude, station.Longitude);
    }
}
