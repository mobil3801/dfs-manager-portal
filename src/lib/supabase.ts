// Supabase configuration and client setup
const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE';

// Simplified Supabase client using direct API calls
class SimpleSupabaseClient {
  private url: string;
  private key: string;
  private authToken: string | null = null;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
    this.supabaseUrl = url;

    // Try to get existing session from localStorage
    this.loadSession();
  }

  supabaseUrl: string;

  private loadSession() {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.access_token && new Date(session.expires_at * 1000) > new Date()) {
          this.authToken = session.access_token;
        }
      }
    } catch (error) {
      console.warn('Failed to load session:', error);
    }
  }

  private saveSession(session: any) {
    try {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      this.authToken = session.access_token;
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  }

  private clearSession() {
    try {
      localStorage.removeItem('supabase.auth.token');
      this.authToken = null;
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  private getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'X-Client-Info': 'dfs-manager-portal'
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Auth methods
  auth = {
    signUp: async (credentials: {email: string;password: string;options?: any;}) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
          method: 'POST',
          headers: this.getHeaders(false),
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            data: credentials.options?.data
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        if (data.session) {
          this.saveSession(data.session);
        }

        return { data: data.user, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },

    signInWithPassword: async (credentials: {email: string;password: string;}) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: this.getHeaders(false),
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: { user: null, session: null }, error: data };
        }

        this.saveSession(data);

        return {
          data: {
            user: data.user,
            session: data
          },
          error: null
        };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.message } };
      }
    },

    signOut: async () => {
      try {
        if (this.authToken) {
          await fetch(`${this.url}/auth/v1/logout`, {
            method: 'POST',
            headers: this.getHeaders(true)
          });
        }

        this.clearSession();
        return { error: null };
      } catch (error: any) {
        this.clearSession(); // Clear anyway
        return { error: { message: error.message } };
      }
    },

    getSession: async () => {
      try {
        if (!this.authToken) {
          return { data: { session: null }, error: null };
        }

        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: 'GET',
          headers: this.getHeaders(true)
        });

        if (!response.ok) {
          this.clearSession();
          return { data: { session: null }, error: null };
        }

        const user = await response.json();
        const sessionStr = localStorage.getItem('supabase.auth.token');
        const session = sessionStr ? JSON.parse(sessionStr) : null;

        if (session && new Date(session.expires_at * 1000) > new Date()) {
          return {
            data: {
              session: {
                ...session,
                user
              }
            },
            error: null
          };
        } else {
          this.clearSession();
          return { data: { session: null }, error: null };
        }
      } catch (error: any) {
        return { data: { session: null }, error: { message: error.message } };
      }
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/recover`, {
          method: 'POST',
          headers: this.getHeaders(false),
          body: JSON.stringify({
            email,
            ...(options?.redirectTo && { redirect_to: options.redirectTo })
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return { error: data };
        }

        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },

    updateUser: async (attributes: {password?: string;}) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: 'PUT',
          headers: this.getHeaders(true),
          body: JSON.stringify(attributes)
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simple implementation - just return unsubscribe function
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  };

  // Database methods
  from(table: string) {
    return new QueryBuilder(this, table);
  }

  // Storage methods (simplified)
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'apikey': this.key
            },
            body: formData
          });

          const data = await response.json();

          if (!response.ok) {
            return { data: null, error: data };
          }

          return { data, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },

      download: async (path: string) => {
        try {
          const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
            headers: this.getHeaders(true)
          });

          if (!response.ok) {
            return { data: null, error: await response.json() };
          }

          const blob = await response.blob();
          return { data: blob, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },

      getPublicUrl: (path: string) => {
        return {
          data: {
            publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}`
          }
        };
      }
    })
  };
}

class QueryBuilder {
  private client: SimpleSupabaseClient;
  private table: string;
  private selectFields = '*';
  private filters: Array<{field: string;operator: string;value: any;}> = [];
  private orderBy: Array<{field: string;ascending: boolean;}> = [];
  private limitCount?: number;
  private offsetCount?: number;

  constructor(client: SimpleSupabaseClient, table: string) {
    this.client = client;
    this.table = table;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }

  gt(field: string, value: any) {
    this.filters.push({ field, operator: 'gt', value });
    return this;
  }

  like(field: string, value: any) {
    this.filters.push({ field, operator: 'like', value });
    return this;
  }

  order(field: string, options: {ascending?: boolean;} = {}) {
    this.orderBy.push({ field, ascending: options.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single() {
    this.limitCount = 1;
    return this;
  }

  private buildQuery() {
    const params = new URLSearchParams();
    params.set('select', this.selectFields);

    this.filters.forEach((filter) => {
      params.set(filter.field, `${filter.operator}.${filter.value}`);
    });

    if (this.orderBy.length > 0) {
      const orderStr = this.orderBy.map((o) => `${o.field}.${o.ascending ? 'asc' : 'desc'}`).join(',');
      params.set('order', orderStr);
    }

    if (this.limitCount) {
      params.set('limit', this.limitCount.toString());
    }

    if (this.offsetCount) {
      params.set('offset', this.offsetCount.toString());
    }

    return params.toString();
  }

  async execute() {
    try {
      const query = this.buildQuery();
      const url = `${this.client.supabaseUrl}/rest/v1/${this.table}?${query}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: (this.client as any).getHeaders(true)
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data };
      }

      // For single() calls, return the first item
      if (this.limitCount === 1 && Array.isArray(data)) {
        return { data: data[0] || null, error: null };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Make QueryBuilder thenable so it can be awaited directly
  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    return this.execute().then(onFulfilled, onRejected);
  }

  // Insert method
  async insert(values: any) {
    try {
      const response = await fetch(`${this.client.supabaseUrl}/rest/v1/${this.table}`, {
        method: 'POST',
        headers: {
          ...(this.client as any).getHeaders(true),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(Array.isArray(values) ? values : [values])
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async update(values: any) {
    try {
      const query = this.buildQuery();
      const url = `${this.client.supabaseUrl}/rest/v1/${this.table}?${query}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...(this.client as any).getHeaders(true),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async delete() {
    try {
      const query = this.buildQuery();
      const url = `${this.client.supabaseUrl}/rest/v1/${this.table}?${query}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: (this.client as any).getHeaders(true)
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }
}

// Create and export the Supabase client
export const supabase = new SimpleSupabaseClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onauthsuccess`,
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetpassword`
    });
  },

  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password });
  }
};

// Database helper functions
export const db = {
  select: async (table: string, query?: any) => {
    let request = supabase.from(table).select(query || '*');
    return await request;
  },

  insert: async (table: string, data: any) => {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    return { data: result, error };
  },

  update: async (table: string, id: string, data: any) => {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
    return { data: result, error };
  },

  delete: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  }
};

// Storage helper functions
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    return await supabase.storage.from(bucket).upload(path, file);
  },

  download: async (bucket: string, path: string) => {
    return await supabase.storage.from(bucket).download(path);
  },

  getPublicUrl: (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path);
  }
};

export default supabase;