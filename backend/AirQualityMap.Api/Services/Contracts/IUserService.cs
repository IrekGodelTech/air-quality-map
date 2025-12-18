using AirQualityMap.Api.Models;

namespace AirQualityMap.Api.Services.Contracts;

/// <summary>
/// Service interface for managing user accounts with CRUD and authentication operations.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Retrieves a user by ID.
    /// </summary>
    Task<User?> GetUserByIdAsync(int id);
    
    /// <summary>
    /// Retrieves a user by username.
    /// </summary>
    Task<User?> GetUserByUsernameAsync(string username);
    
    /// <summary>
    /// Retrieves a user by email.
    /// </summary>
    Task<User?> GetUserByEmailAsync(string email);
    
    /// <summary>
    /// Creates a new user with hashed password.
    /// </summary>
    Task<User> CreateUserAsync(string username, string email, string password);
    
    /// <summary>
    /// Verifies a user's password against the stored hash.
    /// </summary>
    Task<bool> VerifyPasswordAsync(int userId, string password);
    
    /// <summary>
    /// Updates user profile information (username, email).
    /// </summary>
    Task<User?> UpdateUserAsync(int id, string? username, string? email);
    
    /// <summary>
    /// Changes a user's password.
    /// </summary>
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    
    /// <summary>
    /// Checks if a username already exists.
    /// </summary>
    Task<bool> UsernameExistsAsync(string username);
    
    /// <summary>
    /// Checks if an email already exists.
    /// </summary>
    Task<bool> EmailExistsAsync(string email);
}
