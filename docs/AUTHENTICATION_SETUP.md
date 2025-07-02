# Authentication Module Setup Guide

## Overview
The DFS Manager Portal now has a complete authentication system implemented with email/password login, registration, password reset, and protected routes.

## Key Components

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)
- Centralized authentication state management
- User profile management with role-based permissions
- Automatic session restoration on page refresh
- Error handling and audit logging

### 2. Login Page (`src/pages/LoginPage.tsx`)
- Email/password authentication
- Registration form
- Password reset functionality
- Responsive design with proper UX

### 3. Protected Route System (`src/components/ProtectedRoute.tsx`)
- Route protection based on authentication status
- Role-based access control
- Loading states and error handling
- Automatic redirects to login

### 4. Authentication Flow Pages
- **OnAuthSuccessPage**: Handles successful email verification
- **ResetPasswordPage**: Secure password reset with token validation

## Features Implemented

### ✅ Core Authentication
- [x] Email/password login
- [x] User registration with email verification
- [x] Password reset functionality
- [x] Secure logout
- [x] Session persistence
- [x] Automatic token refresh

### ✅ Security Features
- [x] Protected routes
- [x] Role-based access control (Admin, Manager, Employee)
- [x] Authentication state management
- [x] Error handling and validation
- [x] Audit logging for security events

### ✅ User Experience
- [x] Loading states
- [x] Error messages and feedback
- [x] Responsive design
- [x] Form validation
- [x] Toast notifications
- [x] Automatic redirects

## API Integration

The system uses the EasySite authentication APIs:

```javascript
// Login
const { error } = await window.ezsite.apis.login({ email, password });

// Register
const { error } = await window.ezsite.apis.register({ email, password });

// Logout
const { error } = await window.ezsite.apis.logout();

// Get User Info
const { data, error } = await window.ezsite.apis.getUserInfo();

// Reset Password
const { error } = await window.ezsite.apis.resetPassword({ token, password });

// Send Reset Email
const { error } = await window.ezsite.apis.sendResetPwdEmail({ email });
```

## Database Tables

The system uses the following database tables:

1. **User Table** (Built-in) - Core user information
2. **user_profiles** (ID: 11725) - Extended user profiles with roles and permissions
3. **audit_logs** (ID: 12706) - Security and activity logging

## Configuration

### Authentication URLs
- **Site URL**: `${window.location.origin}`
- **Post-auth redirect**: `${window.location.origin}/onauthsuccess`
- **Password reset**: `${window.location.origin}/resetpassword`

### Role Hierarchy
1. **Administrator** - Full system access
2. **Management** - Manager-level permissions
3. **Employee** - Basic user permissions
4. **Guest** - No access (non-authenticated)

## Usage Examples

### Protecting Routes
```jsx
// Basic protection
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requireRole="Admin">
  <AdminComponent />
</ProtectedRoute>

<ProtectedRoute requireRole="Manager">
  <ManagerComponent />
</ProtectedRoute>
```

### Using Authentication Context
```jsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    userProfile, 
    isAuthenticated, 
    login, 
    logout, 
    hasPermission,
    isAdmin,
    isManager 
  } = useAuth();

  // Check permissions
  if (hasPermission('edit', 'products')) {
    // Show edit button
  }

  // Check roles
  if (isAdmin()) {
    // Show admin features
  }
}
```

## Security Notes

1. **Never store sensitive data in localStorage**
2. **All routes are protected by default except login/register**
3. **User sessions are managed automatically**
4. **Audit logs track all authentication events**
5. **Failed login attempts are logged for security monitoring**

## Testing the Authentication

1. **Registration**: Create a new account
2. **Email Verification**: Check email and verify account
3. **Login**: Sign in with credentials
4. **Protected Routes**: Try accessing protected pages
5. **Logout**: Sign out and verify redirect
6. **Password Reset**: Test forgot password flow

## Troubleshooting

### Common Issues
1. **Authentication not working**: Check if EasySite APIs are loaded
2. **Redirect loops**: Verify route protection configuration
3. **Profile not loading**: Check user_profiles table data
4. **Permission errors**: Verify role assignments

### Debug Tips
- Check browser console for authentication logs
- Verify network requests in DevTools
- Check audit_logs table for security events
- Test with different user roles

## Status: ✅ COMPLETE

The authentication module is fully installed, configured, and ready for production use.
