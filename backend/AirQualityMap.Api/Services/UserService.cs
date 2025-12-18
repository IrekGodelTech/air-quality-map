using Microsoft.EntityFrameworkCore;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Service for managing user accounts with Entity Framework Core.
/// </summary>
public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateUserAsync(string username, string email, string password)
    {
        if (await UsernameExistsAsync(username))
        {
            throw new InvalidOperationException($"Username '{username}' already exists.");
        }

        if (await EmailExistsAsync(email))
        {
            throw new InvalidOperationException($"Email '{email}' already exists.");
        }

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<bool> VerifyPasswordAsync(int userId, string password)
    {
        var user = await GetUserByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public async Task<User?> UpdateUserAsync(int id, string? username, string? email)
    {
        var user = await GetUserByIdAsync(id);
        if (user is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(username) && username != user.Username)
        {
            if (await UsernameExistsAsync(username))
            {
                throw new InvalidOperationException($"Username '{username}' already exists.");
            }
            user.Username = username;
        }

        if (!string.IsNullOrWhiteSpace(email) && email != user.Email)
        {
            if (await EmailExistsAsync(email))
            {
                throw new InvalidOperationException($"Email '{email}' already exists.");
            }
            user.Email = email;
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await GetUserByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }
}
