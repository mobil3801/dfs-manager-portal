// Utility to create an admin user - for development/initial setup
import { AuthUtils } from './authUtils';

export const createAdminUser = async () => {
  try {
    // Default admin credentials - change in production
    const email = 'admin@dfsmanager.com';
    const password = 'Admin123!'; // Strong default password
    const name = 'System Administrator';

    // Check if admin already exists
    const { data: existingUsers, error: checkError } = await window.ezsite.apis.tablePage(
      '24015', // users table
      {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'email', op: 'Equal', value: email }]
      }
    );

    if (checkError) {
      console.error('Error checking for existing admin:', checkError);
      return { error: 'Failed to check for existing admin user' };
    }

    if (existingUsers?.List?.length) {
      console.log('Admin user already exists');
      return { message: 'Admin user already exists' };
    }

    // Create admin user
    const salt = await AuthUtils.generateSalt();
    const passwordHash = await AuthUtils.hashPassword(password, salt);

    const { error: createError } = await window.ezsite.apis.tableCreate(
      '24015', // users table
      {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        salt: salt,
        name: name,
        is_active: true,
        created_at: new Date().toISOString(),
        email_verified: true,
        verification_token: ''
      }
    );

    if (createError) {
      console.error('Error creating admin user:', createError);
      return { error: 'Failed to create admin user' };
    }

    // Get the created user to get the ID
    const { data: newUser, error: getUserError } = await window.ezsite.apis.tablePage(
      '24015', // users table
      {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'email', op: 'Equal', value: email }]
      }
    );

    if (getUserError || !newUser?.List?.length) {
      console.error('Error getting created user:', getUserError);
      return { error: 'User created but failed to get user info' };
    }

    const userId = newUser.List[0].id;

    // Create admin profile
    const { error: profileError } = await window.ezsite.apis.tableCreate(
      '11725', // user_profiles table
      {
        user_id: userId,
        role: 'Administrator',
        station: 'ALL',
        employee_id: 'ADMIN001',
        phone: '',
        hire_date: new Date().toISOString(),
        is_active: true,
        detailed_permissions: JSON.stringify({
          admin: true,
          all_stations: true,
          user_management: true,
          system_settings: true
        })
      }
    );

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return { error: 'User created but failed to create profile' };
    }

    console.log('Admin user created successfully');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login');

    return { 
      success: true, 
      message: 'Admin user created successfully',
      credentials: { email, password }
    };

  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return { error: 'An unexpected error occurred' };
  }
};

export default createAdminUser;
