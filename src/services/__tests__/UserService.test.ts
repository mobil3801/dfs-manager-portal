import { describe, it, expect, beforeEach } from '@jest/globals';

// Example service for testing
class UserService {
  private users: Array<{ id: number; name: string; email: string }> = [];

  addUser(name: string, email: string): { id: number; name: string; email: string } {
    const user = {
      id: this.users.length + 1,
      name,
      email
    };
    this.users.push(user);
    return user;
  }

  getUserById(id: number): { id: number; name: string; email: string } | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): Array<{ id: number; name: string; email: string }> {
    return [...this.users];
  }

  updateUser(id: number, updates: Partial<{ name: string; email: string }>): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return true;
  }

  deleteUser(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  clear(): void {
    this.users = [];
  }
}

describe('UserService Integration Tests', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('User Management Workflow', () => {
    it('should handle complete user lifecycle', () => {
      // Add users
      const user1 = userService.addUser('John Doe', 'john@example.com');
      const user2 = userService.addUser('Jane Smith', 'jane@example.com');

      expect(user1.id).toBe(1);
      expect(user1.name).toBe('John Doe');
      expect(user2.id).toBe(2);

      // Get all users
      const allUsers = userService.getAllUsers();
      expect(allUsers).toHaveLength(2);

      // Get user by ID
      const foundUser = userService.getUserById(1);
      expect(foundUser).toEqual(user1);

      // Update user
      const updateResult = userService.updateUser(1, { name: 'John Updated' });
      expect(updateResult).toBe(true);
      
      const updatedUser = userService.getUserById(1);
      expect(updatedUser?.name).toBe('John Updated');
      expect(updatedUser?.email).toBe('john@example.com'); // Should remain unchanged

      // Delete user
      const deleteResult = userService.deleteUser(1);
      expect(deleteResult).toBe(true);

      const deletedUser = userService.getUserById(1);
      expect(deletedUser).toBeUndefined();

      // Verify remaining users
      const remainingUsers = userService.getAllUsers();
      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0]).toEqual(user2);
    });

    it('should handle edge cases', () => {
      // Try to get non-existent user
      expect(userService.getUserById(999)).toBeUndefined();

      // Try to update non-existent user
      expect(userService.updateUser(999, { name: 'New Name' })).toBe(false);

      // Try to delete non-existent user
      expect(userService.deleteUser(999)).toBe(false);

      // Empty list operations
      expect(userService.getAllUsers()).toEqual([]);
    });

    it('should maintain data integrity', () => {
      // Add multiple users
      userService.addUser('User 1', 'user1@example.com');
      userService.addUser('User 2', 'user2@example.com');
      userService.addUser('User 3', 'user3@example.com');

      const users = userService.getAllUsers();
      expect(users).toHaveLength(3);

      // Verify IDs are sequential
      expect(users[0].id).toBe(1);
      expect(users[1].id).toBe(2);
      expect(users[2].id).toBe(3);

      // Clear all users
      userService.clear();
      expect(userService.getAllUsers()).toHaveLength(0);
    });
  });
});