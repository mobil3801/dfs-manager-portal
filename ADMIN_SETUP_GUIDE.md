# Admin Setup Guide for DFS Manager Portal

## Overview
This guide will help you set up the admin user account and access all admin features including User Management, Audit Logs, SMS Management, and Alert Settings.

## Admin Features Available
✅ **User Management** - Manage user accounts, roles, and permissions
✅ **Audit Logs** - View and manage system audit logs  
✅ **SMS Management** - Configure SMS alerts and notifications
✅ **Alert Settings** - Set up automated alerts and notifications
✅ **Database Monitoring** - Monitor database performance
✅ **System Logs** - View and manage system logs
✅ **Security Settings** - Configure security policies
✅ **Site Management** - Manage stations and locations

## Step 1: Database Setup
The database tables have been automatically created with the necessary structure for all admin features.

## Step 2: Create Admin User Account

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Create a new user with email: `admin@dfs-portal.com`
4. Set a secure password
5. Confirm the user's email address

### Option B: Using the Application
1. Go to the login page: `/login`
2. Click "Sign Up" if available
3. Register with email: `admin@dfs-portal.com`
4. Verify the email through the verification link

## Step 3: Assign Administrator Role

Run this SQL command in your Supabase SQL Editor:

```sql
-- Find the user ID for admin@dfs-portal.com
SELECT id, email FROM auth.users WHERE email = 'admin@dfs-portal.com';

-- Insert or update the user profile with Administrator role
INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
SELECT 
    u.id,
    u.email,
    'Super Administrator',
    (SELECT id FROM roles WHERE role_code = 'Administrator'),
    true
FROM auth.users u 
WHERE u.email = 'admin@dfs-portal.com'
ON CONFLICT (id) DO UPDATE SET
    role_id = (SELECT id FROM roles WHERE role_code = 'Administrator'),
    full_name = 'Super Administrator',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;
```

## Step 4: Verify Admin Access

1. **Login**: Go to `/login` and sign in with `admin@dfs-portal.com`
2. **Check Navigation**: You should see an "Admin" dropdown in the navigation bar
3. **Access Features**: Click on the Admin dropdown to access:
   - Admin Dashboard (`/admin`)
   - User Management (`/admin/users`)
   - Audit Logs (`/admin/audit`)
   - SMS Management (`/admin/sms`)
   - Alert Settings (`/admin/alerts`)
   - And all other admin features

## Admin Navigation Structure

The admin features are accessible through:

### Main Navigation
- **Admin Dropdown Menu** - Comprehensive list of all admin features
- **More Menu** - Additional navigation options

### Admin Dashboard (`/admin`)
The admin dashboard provides:
- System overview and statistics
- Quick access to all admin features
- Real-time system health monitoring
- User activity summaries

### Admin Features

#### User Management (`/admin/users`)
- View all system users
- Create new user accounts
- Edit user information and roles
- Manage user permissions
- Role assignment and management

#### Audit Logs (`/admin/audit`)
- System activity monitoring
- User action tracking
- Security event logging
- Detailed audit trail

#### SMS Management (`/admin/sms`)
- ClickSend SMS service configuration
- Send test SMS messages
- View SMS message history
- Configure SMS settings and credentials

#### Alert Settings (`/admin/alerts`)
- Create automated alert rules
- Configure notification methods
- Set up alert thresholds
- Manage alert recipients
- View alert history

## Troubleshooting

### Issue: "Access Denied" when accessing admin features
1. Verify the user has the Administrator role assigned
2. Check the role_id in user_profiles table matches the Administrator role
3. Ensure the user is properly authenticated

### Issue: Admin dropdown not visible
1. Clear browser cache and cookies
2. Verify the user has admin permissions
3. Check browser console for any JavaScript errors

### Issue: Features not loading
1. Check network connectivity
2. Verify all database tables exist
3. Check browser developer tools for API errors

## Database Tables Reference

The following tables support the admin features:

- `user_profiles` - User account information and role assignments
- `roles` - System roles and permissions
- `audit_logs` - System audit trail
- `sms_history` - SMS message history
- `sms_config` - SMS service configuration
- `alert_settings` - Alert configuration
- `alert_history` - Alert trigger history

## Security Best Practices

1. **Strong Passwords**: Use secure passwords for admin accounts
2. **Regular Monitoring**: Check audit logs regularly
3. **Role Management**: Only assign admin roles to trusted users
4. **SMS Security**: Keep SMS API credentials secure
5. **Alert Monitoring**: Review alert settings periodically

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database connectivity
3. Review the audit logs for any authentication issues
4. Check the system status in the admin dashboard

The DFS Manager Portal admin system is now fully configured and ready for production use!
