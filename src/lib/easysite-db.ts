// EasySite Database Service
// Direct integration with EasySite's built-in database system

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
  PRODUCT_LOGS: 11756,
  AUDIT_LOGS: 12706,
  USERS: 24015,
  EXPENSES: 18494,
  SMS_CONFIG: 24201,
  SMS_LOGS: 24202,
  FILE_UPLOADS: 26928,
  PRODUCT_CHANGELOG: 24010,
  SMS_SETTINGS: 24060,
  SMS_CONTACTS: 24061,
  SMS_HISTORY: 24062,
  USER_ROLES: 24054,
  MODULE_ACCESS: 25712,
  PRODUCT_CATEGORIES: 14389,
  AFTER_DELIVERY_TANK_REPORTS: 12331,
  DAILY_SALES_REPORTS_ENHANCED: 12356
} as const;

// Database operations
export class EasySiteDB {
  private static async waitForAPI(maxAttempts = 50): Promise<boolean> {
    let attempts = 0;
    while (attempts < maxAttempts) {
      if ((window as any).ezsite?.apis) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    return false;
  }

  static async tablePage(tableId: number, params: any) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.tablePage(tableId, params);
      if (response.error) {
        console.error(`Table page error for table ${tableId}:`, response.error);
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Table page operation failed:', error);
      throw error;
    }
  }

  static async tableCreate(tableId: number, data: any) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.tableCreate(tableId, data);
      if (response.error) {
        console.error(`Table create error for table ${tableId}:`, response.error);
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Table create operation failed:', error);
      throw error;
    }
  }

  static async tableUpdate(tableId: number, data: any) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.tableUpdate(tableId, data);
      if (response.error) {
        console.error(`Table update error for table ${tableId}:`, response.error);
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Table update operation failed:', error);
      throw error;
    }
  }

  static async tableDelete(tableId: number, params: any) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.tableDelete(tableId, params);
      if (response.error) {
        console.error(`Table delete error for table ${tableId}:`, response.error);
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Table delete operation failed:', error);
      throw error;
    }
  }

  static async upload(filename: string, file: File) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.upload({
        filename,
        file
      });

      if (response.error) {
        console.error('File upload error:', response.error);
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error('File upload operation failed:', error);
      throw error;
    }
  }

  static async getUploadUrl(storeFileId: number) {
    if (!(await this.waitForAPI())) {
      throw new Error('EasySite APIs not available');
    }

    try {
      const response = await (window as any).ezsite.apis.getUploadUrl(storeFileId);

      if (response.error) {
        console.error('Get upload URL error:', response.error);
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error('Get upload URL operation failed:', error);
      throw error;
    }
  }
}

// Authentication service
export class EasySiteAuth {
  static async login(email: string, password: string) {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Authentication system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.login({ email, password });
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  static async register(email: string, password: string) {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Registration system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.register({ email, password });
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  static async logout() {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Authentication system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.logout();
      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  static async getUserInfo() {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Authentication system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.getUserInfo();
      return response;
    } catch (error) {
      console.error('Get user info failed:', error);
      throw error;
    }
  }

  static async sendResetPwdEmail(email: string) {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Authentication system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.sendResetPwdEmail({ email });
      return response;
    } catch (error) {
      console.error('Send reset password email failed:', error);
      throw error;
    }
  }

  static async resetPassword(token: string, password: string) {
    if (!(await EasySiteDB.waitForAPI())) {
      throw new Error('Authentication system not available');
    }

    try {
      const response = await (window as any).ezsite.apis.resetPassword({ token, password });
      return response;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }
}

// Export the main services
export const databaseService = {
  // Generic database operations
  async query(tableId: number, params: any) {
    return EasySiteDB.tablePage(tableId, params);
  },

  async create(tableId: number, data: any) {
    return EasySiteDB.tableCreate(tableId, data);
  },

  async update(tableId: number, data: any) {
    return EasySiteDB.tableUpdate(tableId, data);
  },

  async delete(tableId: number, params: any) {
    return EasySiteDB.tableDelete(tableId, params);
  },

  // Products
  async getProducts() {
    const response = await EasySiteDB.tablePage(TABLE_IDS.PRODUCTS, {
      PageNo: 1,
      PageSize: 1000,
      OrderByField: 'id',
      IsAsc: false
    });
    return response.data?.List || [];
  },

  async createProduct(product: any) {
    const response = await EasySiteDB.tableCreate(TABLE_IDS.PRODUCTS, product);
    return response.data;
  },

  async updateProduct(id: number, updates: any) {
    const response = await EasySiteDB.tableUpdate(TABLE_IDS.PRODUCTS, { id, ...updates });
    return response.data;
  },

  async deleteProduct(id: number) {
    await EasySiteDB.tableDelete(TABLE_IDS.PRODUCTS, { id });
  },

  // Employees
  async getEmployees() {
    const response = await EasySiteDB.tablePage(TABLE_IDS.EMPLOYEES, {
      PageNo: 1,
      PageSize: 1000,
      OrderByField: 'id',
      IsAsc: false
    });
    return response.data?.List || [];
  },

  async createEmployee(employee: any) {
    const response = await EasySiteDB.tableCreate(TABLE_IDS.EMPLOYEES, employee);
    return response.data;
  },

  async updateEmployee(id: number, updates: any) {
    const response = await EasySiteDB.tableUpdate(TABLE_IDS.EMPLOYEES, { id, ...updates });
    return response.data;
  },

  async deleteEmployee(id: number) {
    await EasySiteDB.tableDelete(TABLE_IDS.EMPLOYEES, { id });
  },

  // File operations
  async uploadFile(file: File, filename?: string) {
    const finalFilename = filename || file.name;
    const response = await EasySiteDB.upload(finalFilename, file);
    return response;
  },

  async getFileUrl(storeFileId: number) {
    const response = await EasySiteDB.getUploadUrl(storeFileId);
    return response.data;
  }
};

// Auth service wrapper  
export const authService = {
  async signIn(email: string, password: string) {
    return EasySiteAuth.login(email, password);
  },

  async signUp(email: string, password: string) {
    return EasySiteAuth.register(email, password);
  },

  async signOut() {
    return EasySiteAuth.logout();
  },

  async getUser() {
    const response = await EasySiteAuth.getUserInfo();
    return response.data;
  },

  async getSession() {
    const user = await this.getUser();
    return user ? { user } : null;
  }
};

console.log('✅ EasySite database service initialized');