# User Role Management System

## Overview
The DFS Manager application now has a comprehensive database-connected user role management system that allows administrators to assign roles and manage permissions for all users.

## Database Tables

### 1. User Roles Table (ID: 24054)
- **role_name**: System identifier for the role (admin, manager, employee)
- **role_display_name**: Human-readable name for the role
- **role_description**: Description of what the role can do
- **permissions_json**: JSON object containing detailed permissions for each module
- **is_active**: Whether the role is currently active
- **is_system_role**: Whether this is a system-defined role (cannot be deleted)

### 2. User Profile Table (ID: 24040)
- **user_id**: Reference to the built-in User table
- **username**: Unique username for the user
- **full_name**: User's full name
- **role**: User role (admin, manager, employee, etc.)
- **phone**: User's phone number
- **department**: User's department
- **status**: User status (active, inactive, suspended)
- **avatar_url**: User profile picture

## Default Roles

### Administrator (admin)
- **Full system access** with all permissions
- Can manage users, create/edit/delete all content
- Access to all modules including settings and user management

### Manager (manager)
- **Station management** with limited administrative access
- Can view users but not create/edit/delete them
- Can manage products, sales, employees, vendors, orders, salary, inventory, delivery
- Cannot access system settings

### Employee (employee)
- **Basic access** for daily operations
- Can view products, create sales reports, view orders, inventory, and delivery
- Cannot access user management, employee management, or settings

## Features

### Role Assignment
- Administrators can assign roles to users through the User Management interface
- Real-time role updates with immediate permission changes
- User status management (active, inactive, suspended)

### Permission System
- Granular permissions for each module (view, create, edit, delete)
- JSON-based permission storage for flexibility
- Real-time permission checking throughout the application

### User Management Interface
- Tabbed interface with separate sections for Users and Roles & Permissions
- Search and filter functionality
- Role assignment dropdowns
- Status management controls

## Components

### AuthContext
- Enhanced authentication context with role and permission checking
- Functions: `hasRole()`, `hasPermission()`, `isAdmin()`, `isManager()`, `isActive()`
- Automatic role data loading and caching

### ProtectedRoute
- Route protection based on roles and permissions
- Support for specific permission requirements
- User-friendly access denied messages

### UserRoleManager
- Complete role management interface
- Create, edit, and delete custom roles
- Permission matrix for easy role configuration

## Usage Examples

### Checking Permissions in Components
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { hasPermission, isAdmin } = useAuth();
  
  // Check if user can edit products
  if (hasPermission('products', 'edit')) {
    // Show edit buttons
  }
  
  // Check if user is admin
  if (isAdmin()) {
    // Show admin features
  }
};
```

### Protecting Routes
```typescript
// Require admin access
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminPanel />
  </ProtectedRoute>
} />

// Require specific permission
<Route path="/products" element={
  <ProtectedRoute requiredPermission={{ module: 'products', action: 'view' }}>
    <ProductList />
  </ProtectedRoute>
} />
```

## Security Features

### Account Status Management
- Users can be set to active, inactive, or suspended
- Inactive/suspended users are automatically denied access
- Real-time status checking on every request

### Role-Based Access Control
- All routes and features protected by role requirements
- Granular permission checking for CRUD operations
- Automatic redirect to login for unauthenticated users

### Database Integration
- All role data stored in PostgreSQL database
- Real-time updates without application restart
- Persistent role assignments across sessions

## Administration

### Setting Up the First Admin
1. The system automatically creates default roles on first load
2. Users can be assigned admin role through the User Management interface
3. At least one admin user should always exist in the system

### Managing Users
1. Navigate to User Management (admin access required)
2. Use the Users tab to view, create, edit, and delete users
3. Use the Roles & Permissions tab to manage roles and permissions
4. Assign roles using the dropdown menus in the user list

### Creating Custom Roles
1. Go to User Management > Roles & Permissions
2. Click "Create Role" to define new roles
3. Set permissions for each module (view, create, edit, delete)
4. Assign the new role to users as needed

## Troubleshooting

### User Can't Access Features
1. Check user status (must be 'active')
2. Verify role assignment
3. Check role permissions for the specific module
4. Ensure role is marked as active

### Role Changes Not Taking Effect
1. User may need to log out and log back in
2. Check that role permissions are correctly configured
3. Verify database connection is working

### Database Connection Issues
1. Check that tables 24040 (user_profile) and 24054 (user_roles) exist
2. Verify default roles are created
3. Check database connectivity in application logs