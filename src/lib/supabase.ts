// EasySite Database Integration - Replaces Supabase
// This file provides a Supabase-compatible API using EasySite's built-in database

// EasySite database configuration
console.log('🔄 Loading EasySite database system...');

// Check if EasySite APIs are available
const checkEasySiteAvailability = async (maxAttempts = 50): Promise<boolean> => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    if ((window as any).ezsite?.apis) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  return false;
};

// Table IDs for EasySite database
export const TABLE_IDS = {
  PRODUCTS: 11726,
  EMPLOYEES: 11727,
  VENDORS: 11729,
  ORDERS: 11730,
  LICENSES_CERTIFICATES: 11731,
  DAILY_SALES_REPORTS: 11728,
  SALARY_RECORDS: 11788,
  DELIVERY_RECORDS: 12196,
  STATIONS: 12599,
  USER_PROFILES: 11725,
  FILE_UPLOADS: 26928,
  USERS: 24015,
  MODULE_ACCESS: 25712
} as const;

// Mock Supabase client using EasySite APIs
export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: {email: string;password: string;}) {
      try {
        await checkEasySiteAvailability();
        const response = await (window as any).ezsite.apis.login({ email, password });

        if (response.error) {
          return { data: null, error: new Error(response.error) };
        }

        const userInfo = await (window as any).ezsite.apis.getUserInfo();
        return {
          data: {
            user: userInfo.data ? {
              id: userInfo.data.ID.toString(),
              email: userInfo.data.Email,
              created_at: userInfo.data.CreateTime
            } : null,
            session: userInfo.data ? { user: userInfo.data } : null
          },
          error: null
        };
      } catch (error) {
        return { data: null, error };
      }
    },

    async signUp({ email, password }: {email: string;password: string;}) {
      try {
        await checkEasySiteAvailability();
        const response = await (window as any).ezsite.apis.register({ email, password });

        if (response.error) {
          return { data: null, error: new Error(response.error) };
        }

        return {
          data: {
            user: { email, id: 'pending-verification' },
            session: null
          },
          error: null
        };
      } catch (error) {
        return { data: null, error };
      }
    },

    async signOut() {
      try {
        await checkEasySiteAvailability();
        await (window as any).ezsite.apis.logout();
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    async getSession() {
      try {
        await checkEasySiteAvailability();
        const userInfo = await (window as any).ezsite.apis.getUserInfo();

        return {
          data: {
            session: userInfo.data ? {
              user: {
                id: userInfo.data.ID.toString(),
                email: userInfo.data.Email,
                created_at: userInfo.data.CreateTime
              }
            } : null
          },
          error: null
        };
      } catch (error) {
        return { data: { session: null }, error: null };
      }
    },

    async getUser() {
      try {
        await checkEasySiteAvailability();
        const userInfo = await (window as any).ezsite.apis.getUserInfo();

        return {
          data: {
            user: userInfo.data ? {
              id: userInfo.data.ID.toString(),
              email: userInfo.data.Email,
              created_at: userInfo.data.CreateTime
            } : null
          },
          error: null
        };
      } catch (error) {
        return { data: { user: null }, error: null };
      }
    },

    onAuthStateChange() {
      // EasySite handles auth state internally
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  from(tableName: string) {
    const getTableId = (name: string): number => {
      const mapping: Record<string, number> = {
        'products': TABLE_IDS.PRODUCTS,
        'employees': TABLE_IDS.EMPLOYEES,
        'vendors': TABLE_IDS.VENDORS,
        'orders': TABLE_IDS.ORDERS,
        'licenses': TABLE_IDS.LICENSES_CERTIFICATES,
        'licenses_certificates': TABLE_IDS.LICENSES_CERTIFICATES,
        'daily_sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'salary_records': TABLE_IDS.SALARY_RECORDS,
        'salaries': TABLE_IDS.SALARY_RECORDS,
        'delivery_records': TABLE_IDS.DELIVERY_RECORDS,
        'deliveries': TABLE_IDS.DELIVERY_RECORDS,
        'stations': TABLE_IDS.STATIONS,
        'user_profiles': TABLE_IDS.USER_PROFILES,
        'file_uploads': TABLE_IDS.FILE_UPLOADS,
        'users': TABLE_IDS.USERS,
        'module_access': TABLE_IDS.MODULE_ACCESS
      };

      return mapping[name] || 0;
    };

    const tableId = getTableId(tableName);

    return {
      select() {
        return {
          async eq(column: string, value: any) {
            try {
              await checkEasySiteAvailability();
              const response = await (window as any).ezsite.apis.tablePage(tableId, {
                PageNo: 1,
                PageSize: 1000,
                Filters: [{ name: column, op: 'Equal', value }]
              });

              return {
                data: response.data?.List || [],
                error: response.error ? new Error(response.error) : null
              };
            } catch (error) {
              return { data: [], error };
            }
          },

          async single() {
            try {
              await checkEasySiteAvailability();
              const response = await (window as any).ezsite.apis.tablePage(tableId, {
                PageNo: 1,
                PageSize: 1
              });

              return {
                data: response.data?.List?.[0] || null,
                error: response.error ? new Error(response.error) : null
              };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },

      async insert(data: any[]) {
        return {
          select() {
            return {
              async single() {
                try {
                  await checkEasySiteAvailability();
                  const response = await (window as any).ezsite.apis.tableCreate(tableId, data[0]);
                  return {
                    data: response.data || null,
                    error: response.error ? new Error(response.error) : null
                  };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          }
        };
      },

      update(data: any) {
        return {
          eq(column: string, value: any) {
            return {
              select() {
                return {
                  async single() {
                    try {
                      await checkEasySiteAvailability();
                      const updateData = { [column]: value, ...data };
                      const response = await (window as any).ezsite.apis.tableUpdate(tableId, updateData);
                      return {
                        data: response.data || null,
                        error: response.error ? new Error(response.error) : null
                      };
                    } catch (error) {
                      return { data: null, error };
                    }
                  }
                };
              }
            };
          }
        };
      },

      delete() {
        return {
          async eq(column: string, value: any) {
            try {
              await checkEasySiteAvailability();
              await (window as any).ezsite.apis.tableDelete(tableId, { [column]: value });
              return { error: null };
            } catch (error) {
              return { error };
            }
          }
        };
      }
    };
  },

  storage: {
    from() {
      return {
        async upload(path: string, file: File) {
          try {
            await checkEasySiteAvailability();
            const response = await (window as any).ezsite.apis.upload({
              filename: file.name,
              file: file
            });

            if (response.error) {
              return { data: null, error: new Error(response.error) };
            }

            return { data: { path }, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },

        getPublicUrl(path: string) {
          return { data: { publicUrl: `/api/files/${path}` } };
        }
      };
    }
  }
};

// Legacy compatibility exports
export const supabaseUrl = 'https://easysite.local';
export const supabaseAnonKey = 'easysite-builtin-key';

console.log('✅ EasySite database integration loaded successfully');