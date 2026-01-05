using AirQualityMap.Api.Data;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;

namespace AirQualityMap.Api.Tests.Services;

/// <summary>
/// Integration tests for the UserService class covering user management operations.
/// These tests use an in-memory database to validate service behavior with actual EF Core operations.
/// </summary>
public class UserServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _context = InMemoryDbContextFactory.CreateDbContext();
        _userService = new UserService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task CreateUserAsync_WithValidData_CreatesUser()
    {
        // Arrange
        var username = "newuser";
        var email = "new@example.com";
        var password = "SecurePassword123!";

        // Act
        var user = await _userService.CreateUserAsync(username, email, password);

        // Assert
        Assert.NotNull(user);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
        Assert.NotEqual(password, user.PasswordHash); // Password should be hashed
        Assert.True(BCrypt.Net.BCrypt.Verify(password, user.PasswordHash));
        Assert.True(user.Id > 0);
        Assert.True((DateTime.UtcNow - user.CreatedAt).TotalSeconds < 5);
    }

    [Fact]
    public async Task CreateUserAsync_WithDuplicateUsername_ThrowsInvalidOperationException()
    {
        // Arrange
        var username = "duplicateuser";
        await _userService.CreateUserAsync(username, "first@example.com", "Password123!");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.CreateUserAsync(username, "second@example.com", "Password456!")
        );
        Assert.Contains("Username", exception.Message);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task CreateUserAsync_WithDuplicateEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var email = "duplicate@example.com";
        await _userService.CreateUserAsync("firstuser", email, "Password123!");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.CreateUserAsync("seconduser", email, "Password456!")
        );
        Assert.Contains("Email", exception.Message);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("testuser", "test@example.com", "Password123!");

        // Act
        var foundUser = await _userService.GetUserByIdAsync(user.Id);

        // Assert
        Assert.NotNull(foundUser);
        Assert.Equal(user.Id, foundUser.Id);
        Assert.Equal(user.Username, foundUser.Username);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithNonExistentUser_ReturnsNull()
    {
        // Act
        var foundUser = await _userService.GetUserByIdAsync(999);

        // Assert
        Assert.Null(foundUser);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var username = "findme";
        var user = await _userService.CreateUserAsync(username, "findme@example.com", "Password123!");

        // Act
        var foundUser = await _userService.GetUserByUsernameAsync(username);

        // Assert
        Assert.NotNull(foundUser);
        Assert.Equal(user.Id, foundUser.Id);
        Assert.Equal(username, foundUser.Username);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WithNonExistentUser_ReturnsNull()
    {
        // Act
        var foundUser = await _userService.GetUserByUsernameAsync("nonexistent");

        // Assert
        Assert.Null(foundUser);
    }

    [Fact]
    public async Task GetUserByEmailAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var email = "findme@example.com";
        var user = await _userService.CreateUserAsync("emailuser", email, "Password123!");

        // Act
        var foundUser = await _userService.GetUserByEmailAsync(email);

        // Assert
        Assert.NotNull(foundUser);
        Assert.Equal(user.Id, foundUser.Id);
        Assert.Equal(email, foundUser.Email);
    }

    [Fact]
    public async Task GetUserByEmailAsync_WithNonExistentEmail_ReturnsNull()
    {
        // Act
        var foundUser = await _userService.GetUserByEmailAsync("nonexistent@example.com");

        // Assert
        Assert.Null(foundUser);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WithCorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "CorrectPassword123!";
        var user = await _userService.CreateUserAsync("verifyuser", "verify@example.com", password);

        // Act
        var result = await _userService.VerifyPasswordAsync(user.Id, password);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WithIncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("verifyuser", "verify@example.com", "CorrectPassword123!");

        // Act
        var result = await _userService.VerifyPasswordAsync(user.Id, "WrongPassword456!");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task VerifyPasswordAsync_WithNonExistentUser_ReturnsFalse()
    {
        // Act
        var result = await _userService.VerifyPasswordAsync(999, "AnyPassword");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateUserAsync_WithNewUsername_UpdatesUsername()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("oldusername", "update@example.com", "Password123!");
        var newUsername = "newusername";

        // Act
        var updatedUser = await _userService.UpdateUserAsync(user.Id, newUsername, null);

        // Assert
        Assert.NotNull(updatedUser);
        Assert.Equal(newUsername, updatedUser.Username);
        Assert.Equal(user.Email, updatedUser.Email); // Email unchanged
    }

    [Fact]
    public async Task UpdateUserAsync_WithNewEmail_UpdatesEmail()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("updateuser", "old@example.com", "Password123!");
        var newEmail = "new@example.com";

        // Act
        var updatedUser = await _userService.UpdateUserAsync(user.Id, null, newEmail);

        // Assert
        Assert.NotNull(updatedUser);
        Assert.Equal(newEmail, updatedUser.Email);
        Assert.Equal(user.Username, updatedUser.Username); // Username unchanged
    }

    [Fact]
    public async Task UpdateUserAsync_WithDuplicateUsername_ThrowsInvalidOperationException()
    {
        // Arrange
        await _userService.CreateUserAsync("existinguser", "existing@example.com", "Password123!");
        var user = await _userService.CreateUserAsync("updateuser", "update@example.com", "Password123!");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.UpdateUserAsync(user.Id, "existinguser", null)
        );
        Assert.Contains("Username", exception.Message);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task UpdateUserAsync_WithDuplicateEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        await _userService.CreateUserAsync("existinguser", "existing@example.com", "Password123!");
        var user = await _userService.CreateUserAsync("updateuser", "update@example.com", "Password123!");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.UpdateUserAsync(user.Id, null, "existing@example.com")
        );
        Assert.Contains("Email", exception.Message);
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task UpdateUserAsync_WithNonExistentUser_ReturnsNull()
    {
        // Act
        var result = await _userService.UpdateUserAsync(999, "newusername", "new@example.com");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithCorrectCurrentPassword_ChangesPassword()
    {
        // Arrange
        var oldPassword = "OldPassword123!";
        var newPassword = "NewPassword456!";
        var user = await _userService.CreateUserAsync("changepassuser", "changepass@example.com", oldPassword);

        // Act
        var result = await _userService.ChangePasswordAsync(user.Id, oldPassword, newPassword);

        // Assert
        Assert.True(result);
        
        // Verify new password works
        var verifyNew = await _userService.VerifyPasswordAsync(user.Id, newPassword);
        Assert.True(verifyNew);
        
        // Verify old password no longer works
        var verifyOld = await _userService.VerifyPasswordAsync(user.Id, oldPassword);
        Assert.False(verifyOld);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithIncorrectCurrentPassword_ReturnsFalse()
    {
        // Arrange
        var user = await _userService.CreateUserAsync("changepassuser", "changepass@example.com", "CorrectPassword123!");

        // Act
        var result = await _userService.ChangePasswordAsync(user.Id, "WrongPassword", "NewPassword456!");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithNonExistentUser_ReturnsFalse()
    {
        // Act
        var result = await _userService.ChangePasswordAsync(999, "OldPassword", "NewPassword");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UsernameExistsAsync_WithExistingUsername_ReturnsTrue()
    {
        // Arrange
        var username = "existinguser";
        await _userService.CreateUserAsync(username, "existing@example.com", "Password123!");

        // Act
        var exists = await _userService.UsernameExistsAsync(username);

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task UsernameExistsAsync_WithNonExistentUsername_ReturnsFalse()
    {
        // Act
        var exists = await _userService.UsernameExistsAsync("nonexistent");

        // Assert
        Assert.False(exists);
    }

    [Fact]
    public async Task EmailExistsAsync_WithExistingEmail_ReturnsTrue()
    {
        // Arrange
        var email = "existing@example.com";
        await _userService.CreateUserAsync("existinguser", email, "Password123!");

        // Act
        var exists = await _userService.EmailExistsAsync(email);

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task EmailExistsAsync_WithNonExistentEmail_ReturnsFalse()
    {
        // Act
        var exists = await _userService.EmailExistsAsync("nonexistent@example.com");

        // Assert
        Assert.False(exists);
    }
}
