// Preload utility for critical routes
export const preloadCriticalRoutes = () => {
  // Preload the most commonly used routes after initial app load
  const criticalRoutes = [
  () => import('@/pages/Products/ProductList'),
  () => import('@/pages/Employees/EmployeeList'),
  () => import('@/pages/Sales/SalesReportList'),
  () => import('@/pages/Settings/AppSettings')];


  // Preload routes with a delay to not block initial rendering
  setTimeout(() => {
    criticalRoutes.forEach((importRoute) => {
      importRoute().catch((err) => {
        console.warn('Failed to preload route:', err);
      });
    });
  }, 2000);
};

// Preload admin routes when admin access is detected
export const preloadAdminRoutes = () => {
  const adminRoutes = [
  () => import('@/pages/Admin/AdminPanel'),
  () => import('@/pages/Admin/UserManagement'),
  () => import('@/pages/Admin/SiteManagement')];


  setTimeout(() => {
    adminRoutes.forEach((importRoute) => {
      importRoute().catch((err) => {
        console.warn('Failed to preload admin route:', err);
      });
    });
  }, 3000);
};