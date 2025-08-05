# DFS Manager Portal - Server Troubleshooting Guide

## Overview
This guide provides comprehensive troubleshooting steps for resolving server and application issues in the DFS Manager Portal. The system is built on React with Supabase integration for authentication and data management.

## Quick Server Status Check

### 1. Built-in Diagnostics
- Visit `/admin/server-diagnostics` in your browser
- Use the system status indicator in the top navigation bar
- Check the server health monitor on the dashboard

### 2. Manual Checks
```bash
# Check if the application is running
curl -I https://your-domain.com

# Test API connectivity
curl https://your-domain.com/api/health
```

## Common Server Issues and Solutions

### Issue 1: "Server not working" / Application won't load

**Symptoms:**
- White screen on loading
- Network timeout errors
- Unable to access the application

**Causes & Solutions:**

#### A. Build Issues
```bash
# Check build status
npm run build

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### B. Port Conflicts
```bash
# Check what's running on port 8080
lsof -i :8080

# Kill process if needed
kill -9 <process_id>

# Start with different port
PORT=3000 npm run dev
```

#### C. Environment Variables
```bash
# Verify environment variables
cat .env.local
cat .env.production

# Ensure required variables are set
NODE_ENV=production
VITE_APP_NAME="DFS Manager Portal"
```

### Issue 2: Database Connection Failures

**Symptoms:**
- "Failed to load" messages
- Authentication errors
- Data not displaying

**Solutions:**

#### A. Supabase Connection
1. Check Supabase credentials in `src/lib/supabase.ts`
2. Verify Supabase project status at https://app.supabase.com
3. Test connection manually:

```javascript
// In browser console
const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
console.log('Connection test:', { data, error });
```

#### B. Network Issues
1. Check firewall settings
2. Verify DNS resolution
3. Test with different network

#### C. Database Schema Issues
1. Run the diagnostics tool at `/admin/server-diagnostics`
2. Check if required tables exist:
   - user_profiles
   - stations
   - products
   - employees
   - audit_logs

### Issue 3: Authentication Problems

**Symptoms:**
- Can't log in
- Session expires immediately
- Redirect loops

**Solutions:**

#### A. Check Supabase Auth Configuration
1. Verify Site URL: `https://your-domain.com`
2. Check Redirect URLs: `https://your-domain.com/onauthsuccess`
3. Ensure Email templates are configured

#### B. Clear Auth State
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### C. Test Auth Functions
```javascript
// Test sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
});
```

### Issue 4: Performance Issues

**Symptoms:**
- Slow loading times
- High memory usage
- Application freezing

**Solutions:**

#### A. Check Resource Usage
1. Open Browser DevTools → Performance tab
2. Run diagnostics at `/admin/server-diagnostics`
3. Monitor network requests

#### B. Optimize Build
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Enable compression
VITE_ENABLE_COMPRESSION=true npm run build
```

#### C. Clear Application Cache
```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Diagnostic Tools

### 1. Built-in Server Diagnostics
- Location: `/admin/server-diagnostics`
- Features:
  - Frontend build check
  - Database connectivity test
  - Authentication system verification
  - Performance metrics
  - Environment validation

### 2. System Status Indicator
- Location: Top navigation bar
- Real-time monitoring of:
  - Database connection
  - Authentication service
  - Overall system health

### 3. Health Monitor Dashboard
- Location: Dashboard → Overview tab
- Monitors:
  - Database response times
  - Authentication status
  - Memory usage (if available)
  - Network connectivity

## Step-by-Step Troubleshooting Process

### Step 1: Initial Assessment
1. Access `/admin/server-diagnostics`
2. Review all diagnostic results
3. Note any failed checks
4. Check browser console for errors

### Step 2: Database Issues
If database checks fail:
1. Verify Supabase project status
2. Check network connectivity
3. Test with different browser/device
4. Review Supabase logs

### Step 3: Authentication Issues
If auth checks fail:
1. Clear browser storage
2. Try incognito/private browsing
3. Check Supabase Auth settings
4. Verify email/password combination

### Step 4: Performance Issues
If performance is poor:
1. Check memory usage
2. Disable browser extensions
3. Clear application cache
4. Test on different device

### Step 5: Network Issues
If network problems exist:
1. Check internet connection
2. Try different DNS servers
3. Test with mobile hotspot
4. Review firewall settings

## Emergency Recovery Steps

### Complete System Reset
```bash
# 1. Stop all services
pkill -f "node"

# 2. Clear all caches
rm -rf node_modules
rm -rf dist
rm -rf .next
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Rebuild application
npm run build

# 5. Restart services
npm run dev
```

### Database Recovery
```sql
-- Check table existence
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify user_profiles table
SELECT * FROM user_profiles LIMIT 1;

-- Check authentication tables
SELECT count(*) FROM auth.users;
```

### Authentication Reset
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Reset Site URL if needed
4. Regenerate API keys if necessary
5. Update application configuration

## Monitoring and Prevention

### 1. Set Up Monitoring
- Enable error reporting
- Configure performance monitoring
- Set up uptime monitoring
- Create alerting rules

### 2. Regular Maintenance
- Weekly diagnostic checks
- Monthly dependency updates
- Quarterly security reviews
- Regular backup verification

### 3. Best Practices
- Always test in staging first
- Keep dependencies updated
- Monitor error logs regularly
- Document configuration changes

## Getting Help

### Internal Resources
1. Server Diagnostics: `/admin/server-diagnostics`
2. System Status: Navigation bar indicator
3. Health Monitor: Dashboard overview
4. Error Logs: `/admin/logs`

### External Resources
1. Supabase Status: https://status.supabase.com
2. Supabase Docs: https://supabase.com/docs
3. React Docs: https://react.dev
4. Vite Docs: https://vitejs.dev

### Support Contacts
- System Administrator: [admin@your-company.com]
- Technical Support: [support@your-company.com]
- Emergency Contact: [emergency@your-company.com]

## Conclusion

This troubleshooting guide covers the most common server and application issues. Always start with the built-in diagnostic tools before attempting manual fixes. If issues persist after following this guide, contact technical support with:

1. Diagnostic results from `/admin/server-diagnostics`
2. Browser console errors
3. Steps already attempted
4. System configuration details

Remember: The system includes comprehensive monitoring and diagnostic tools to help identify and resolve issues quickly.