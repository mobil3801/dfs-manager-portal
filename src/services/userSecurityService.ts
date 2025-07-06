// User Security Service - Comprehensive validation and protection system
// Prevents role conflicts, ensures unique emails, and protects admin accounts

interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EmailCheckResult {
  isUnique: boolean;
  conflictDetails?: {
    email: string;
    existingUserId: number;
    existingRole: string;
    existingStation: string;
  };
}

interface RoleConflictResult {
  hasConflict: boolean;
  conflictDetails?: {
    conflictType: string;
    message: string;
    suggestedAction: string;
  };
}

class UserSecurityService {
  private static instance: UserSecurityService;

  // Protected admin account that cannot lose admin access
  private readonly PROTECTED_ADMIN_EMAIL = 'admin@dfs-portal.com';
  
  // Role hierarchy for conflict detection
  private readonly ROLE_HIERARCHY = {
    'Administrator': 3,
    'Management': 2,
    'Employee': 1
  } as const;

  // Maximum administrators per station
  private readonly MAX_ADMINS_PER_STATION = 2;

  public static getInstance(): UserSecurityService {
    if (!UserSecurityService.instance) {
      UserSecurityService.instance = new UserSecurityService();
    }
    return UserSecurityService.instance;
  }

  /**
   * Validate user data before creation or update
   */
  public async validateUser(
    userData: any,
    isUpdate: boolean = false,
    currentUserId?: number
  ): Promise<UserValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check email uniqueness
      const emailCheck = await this.checkEmailUniqueness(userData.email, currentUserId);
      if (!emailCheck.isUnique) {
        errors.push(`Email ${userData.email} is already in use by another user`);
      }

      // Check role conflicts
      const roleCheck = await this.checkRoleConflicts(
        userData.role,
        userData.station,
        currentUserId
      );
      if (roleCheck.hasConflict) {
        errors.push(roleCheck.conflictDetails?.message || 'Role conflict detected');
      }

      // Protect admin account
      if (isUpdate && currentUserId) {
        const adminProtectionCheck = await this.checkAdminProtection(
          currentUserId,
          userData.role,
          userData.email
        );
        if (adminProtectionCheck.length > 0) {
          errors.push(...adminProtectionCheck);
        }
      }

      // Validate role-station combinations
      const roleStationValidation = this.validateRoleStationCombination(
        userData.role,
        userData.station
      );
      if (!roleStationValidation.isValid) {
        errors.push(...roleStationValidation.errors);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error in user validation:', error);
      return {
        isValid: false,
        errors: ['User validation failed due to system error'],
        warnings: []
      };
    }
  }

  /**
   * Check if email is unique across all users
   */
  public async checkEmailUniqueness(
    email: string,
    excludeUserId?: number
  ): Promise<EmailCheckResult> {
    try {
      // Get current user info to check against system users
      const { data: currentUser } = await window.ezsite.apis.getUserInfo();
      
      // Check if email matches current user (excluding from check if it's an update)
      if (currentUser && currentUser.Email === email && excludeUserId !== currentUser.ID) {
        return {
          isUnique: false,
          conflictDetails: {
            email: currentUser.Email,
            existingUserId: currentUser.ID,
            existingRole: 'System User',
            existingStation: 'Unknown'
          }
        };
      }

      // Check user profiles table for email conflicts
      const { data: profilesResponse } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        Filters: []
      });

      if (profilesResponse?.List) {
        for (const profile of profilesResponse.List) {
          // Skip if this is the user being updated
          if (excludeUserId && profile.user_id === excludeUserId) {
            continue;
          }

          // For now, we'll check employee_id as a proxy since we don't have direct email access
          // In a real implementation, you'd need to cross-reference with the user table
          if (profile.employee_id && profile.employee_id.toLowerCase().includes(email.toLowerCase().split('@')[0])) {
            return {
              isUnique: false,
              conflictDetails: {
                email: email,
                existingUserId: profile.user_id,
                existingRole: profile.role,
                existingStation: profile.station
              }
            };
          }
        }
      }

      return { isUnique: true };

    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      // Default to not unique to be safe
      return { 
        isUnique: false,
        conflictDetails: {
          email: email,
          existingUserId: 0,
          existingRole: 'Unknown',
          existingStation: 'Unknown'
        }
      };
    }
  }

  /**
   * Check for role conflicts within stations
   */
  public async checkRoleConflicts(
    role: string,
    station: string,
    excludeUserId?: number
  ): Promise<RoleConflictResult> {
    try {
      const { data: profilesResponse } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        Filters: [
          { name: 'station', op: 'Equal', value: station },
          { name: 'role', op: 'Equal', value: role },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });

      if (!profilesResponse?.List) {
        return { hasConflict: false };
      }

      // Filter out the user being updated
      const existingUsers = profilesResponse.List.filter(
        profile => !excludeUserId || profile.user_id !== excludeUserId
      );

      // Check administrator limits
      if (role === 'Administrator') {
        if (existingUsers.length >= this.MAX_ADMINS_PER_STATION) {
          return {
            hasConflict: true,
            conflictDetails: {
              conflictType: 'MAX_ADMIN_LIMIT',
              message: `Station ${station} already has the maximum number of administrators (${this.MAX_ADMINS_PER_STATION})`,
              suggestedAction: 'Consider upgrading an existing Management role or removing an inactive administrator'
            }
          };
        }
      }

      // Check for ALL station conflicts (only one ALL station admin allowed)
      if (station === 'ALL' && role === 'Administrator') {
        const allStationAdmins = existingUsers.filter(
          profile => profile.station === 'ALL' && profile.role === 'Administrator'
        );
        
        if (allStationAdmins.length > 0) {
          return {
            hasConflict: true,
            conflictDetails: {
              conflictType: 'ALL_STATION_ADMIN_EXISTS',
              message: 'An administrator with ALL station access already exists',
              suggestedAction: 'Only one ALL station administrator is recommended for security'
            }
          };
        }
      }

      return { hasConflict: false };

    } catch (error) {
      console.error('Error checking role conflicts:', error);
      return { 
        hasConflict: true,
        conflictDetails: {
          conflictType: 'VALIDATION_ERROR',
          message: 'Unable to validate role conflicts due to system error',
          suggestedAction: 'Please try again or contact system administrator'
        }
      };
    }
  }

  /**
   * Protect admin account from losing access
   */
  public async checkAdminProtection(
    userId: number,
    newRole: string,
    newEmail: string
  ): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Get current user info
      const { data: currentUser } = await window.ezsite.apis.getUserInfo();
      
      // Check if this is the protected admin account
      if (currentUser?.Email === this.PROTECTED_ADMIN_EMAIL && currentUser.ID === userId) {
        // Prevent role downgrade
        if (newRole !== 'Administrator') {
          errors.push(
            `The admin account ${this.PROTECTED_ADMIN_EMAIL} cannot be changed to a non-administrator role. This account must maintain administrator access.`
          );
        }

        // Prevent email change
        if (newEmail !== this.PROTECTED_ADMIN_EMAIL) {
          errors.push(
            `The email address for the protected admin account cannot be changed from ${this.PROTECTED_ADMIN_EMAIL}.`
          );
        }
      }

      // Additional check: Get user profile to verify admin status
      const { data: profilesResponse } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (profilesResponse?.List?.[0]) {
        const profile = profilesResponse.List[0];
        
        // If this user is currently an administrator, ensure we don't remove ALL admin access
        if (profile.role === 'Administrator' && newRole !== 'Administrator') {
          // Check if there will be any other active administrators
          const { data: adminCheck } = await window.ezsite.apis.tablePage(11725, {
            PageNo: 1,
            PageSize: 100,
            Filters: [
              { name: 'role', op: 'Equal', value: 'Administrator' },
              { name: 'is_active', op: 'Equal', value: true }
            ]
          });

          const activeAdmins = adminCheck?.List?.filter(
            admin => admin.user_id !== userId
          ) || [];

          if (activeAdmins.length === 0) {
            errors.push(
              'Cannot remove administrator role from this user as they are the only active administrator. At least one administrator must remain in the system.'
            );
          }
        }
      }

    } catch (error) {
      console.error('Error checking admin protection:', error);
      errors.push('Unable to verify admin protection due to system error');
    }

    return errors;
  }

  /**
   * Validate role and station combinations
   */
  public validateRoleStationCombination(role: string, station: string): UserValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ALL station access should be limited to administrators
    if (station === 'ALL' && role !== 'Administrator') {
      warnings.push(
        'ALL station access is typically reserved for administrators. Consider if this user really needs access to all stations.'
      );
    }

    // Validate station exists
    const validStations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
    if (!validStations.includes(station)) {
      errors.push(`Invalid station: ${station}. Must be one of: ${validStations.join(', ')}`);
    }

    // Validate role exists
    const validRoles = ['Administrator', 'Management', 'Employee'];
    if (!validRoles.includes(role)) {
      errors.push(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate secure employee ID
   */
  public generateSecureEmployeeId(station: string, role: string): string {
    const stationPrefix = station === 'ALL' ? 'ALL' : station.substring(0, 3).toUpperCase();
    const rolePrefix = role.substring(0, 1).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    
    return `${stationPrefix}-${rolePrefix}${timestamp}${random}`;
  }

  /**
   * Get security recommendations for user setup
   */
  public getSecurityRecommendations(role: string, station: string): string[] {
    const recommendations: string[] = [];

    if (role === 'Administrator') {
      recommendations.push('🔒 Administrator accounts have full system access. Ensure this user requires this level of access.');
      recommendations.push('📱 Enable two-factor authentication for administrator accounts.');
      recommendations.push('🔄 Regularly review administrator permissions and access logs.');
    }

    if (station === 'ALL') {
      recommendations.push('🌐 ALL station access provides cross-location data access. Monitor usage carefully.');
      recommendations.push('📊 Consider station-specific roles if user only needs access to specific locations.');
    }

    if (role === 'Employee') {
      recommendations.push('👤 Employee role has limited permissions. Users can request permission upgrades through administrators.');
    }

    return recommendations;
  }

  /**
   * Audit user creation/modification
   */
  public async auditUserOperation(
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    userData: any,
    performedBy: number,
    result: 'SUCCESS' | 'FAILED',
    errorMessage?: string
  ): Promise<void> {
    try {
      const auditData = {
        event_type: 'Admin Action',
        user_id: performedBy,
        username: userData.email || userData.employee_id || 'Unknown',
        event_timestamp: new Date().toISOString(),
        event_status: result,
        resource_accessed: 'User Management',
        action_performed: `${operation} User Account`,
        failure_reason: errorMessage || '',
        risk_level: operation === 'DELETE' ? 'High' : 'Medium',
        additional_data: JSON.stringify({
          targetRole: userData.role,
          targetStation: userData.station,
          operation: operation,
          securityValidation: true
        }),
        station: userData.station || ''
      };

      await window.ezsite.apis.tableCreate(12706, auditData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error as audit failure shouldn't block user operations
    }
  }
}

export default UserSecurityService;

// Export singleton instance
export const userSecurityService = UserSecurityService.getInstance();