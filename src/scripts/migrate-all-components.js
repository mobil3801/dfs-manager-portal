#!/usr/bin/env node

// Migration script to replace window.ezsite.apis with Supabase service calls
const fs = require('fs');
const path = require('path');

// Files to migrate
const filesToMigrate = [
  'src/pages/Products/ProductList.tsx',
  'src/pages/Products/ProductForm.tsx',
  'src/pages/Employees/EmployeeList.tsx',
  'src/pages/Employees/EmployeeForm.tsx',
  'src/pages/Sales/SalesReportList.tsx',
  'src/pages/Sales/SalesReportForm.tsx',
  'src/pages/Vendors/VendorList.tsx',
  'src/pages/Vendors/VendorForm.tsx',
  'src/pages/Orders/OrderList.tsx',
  'src/pages/Orders/OrderForm.tsx',
  'src/pages/Licenses/LicenseList.tsx',
  'src/pages/Licenses/LicenseForm.tsx',
  'src/pages/Salary/SalaryList.tsx',
  'src/pages/Salary/SalaryForm.tsx',
  'src/pages/Delivery/DeliveryList.tsx',
  'src/pages/Delivery/DeliveryForm.tsx',
  'src/pages/Inventory/InventoryAlerts.tsx',
  'src/pages/Inventory/AlertSettings.tsx',
  'src/pages/Inventory/GasDeliveryInventory.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/ResetPasswordPage.tsx',
  'src/contexts/AuthContext.tsx'
];

// Migration patterns
const migrationPatterns = [
  // Authentication
  {
    from: /window\.ezsite\.apis\.login\(/g,
    to: 'supabaseService.login('
  },
  {
    from: /window\.ezsite\.apis\.register\(/g,
    to: 'supabaseService.register('
  },
  {
    from: /window\.ezsite\.apis\.logout\(/g,
    to: 'supabaseService.logout('
  },
  {
    from: /window\.ezsite\.apis\.getUserInfo\(/g,
    to: 'supabaseService.getUserInfo('
  },
  {
    from: /window\.ezsite\.apis\.sendResetPwdEmail\(/g,
    to: 'supabaseService.sendResetPwdEmail('
  },
  {
    from: /window\.ezsite\.apis\.resetPassword\(/g,
    to: 'supabaseService.resetPassword('
  },
  
  // Database operations
  {
    from: /window\.ezsite\.apis\.tablePage\(/g,
    to: 'supabaseService.tablePage('
  },
  {
    from: /window\.ezsite\.apis\.tableCreate\(/g,
    to: 'supabaseService.tableCreate('
  },
  {
    from: /window\.ezsite\.apis\.tableUpdate\(/g,
    to: 'supabaseService.tableUpdate('
  },
  {
    from: /window\.ezsite\.apis\.tableDelete\(/g,
    to: 'supabaseService.tableDelete('
  },
  
  // File upload
  {
    from: /window\.ezsite\.apis\.upload\(/g,
    to: 'supabaseService.upload('
  },
  
  // Email
  {
    from: /window\.ezsite\.apis\.sendEmail\(/g,
    to: 'supabaseService.sendEmail('
  }
];

// Import statements to add
const importsToAdd = [
  "import { supabaseService } from '@/services/supabaseService';",
  "import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';",
  "import { useRealtimeData } from '@/hooks/use-supabase-realtime';"
];

// Auth context replacements
const authContextReplacements = [
  {
    from: /import { useAuth } from '@\/contexts\/AuthContext';/g,
    to: "import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';"
  },
  {
    from: /const { ([^}]+) } = useAuth\(\);/g,
    to: 'const { $1 } = useSupabaseAuth();'
  },
  {
    from: /userProfile/g,
    to: 'profile'
  }
];

function migrateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Add imports if not already present
    importsToAdd.forEach(importStatement => {
      if (!content.includes(importStatement)) {
        // Find the last import statement
        const importMatch = content.match(/import[^;]+;/g);
        if (importMatch) {
          const lastImport = importMatch[importMatch.length - 1];
          const index = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, index) + '\n' + importStatement + content.slice(index);
          hasChanges = true;
        }
      }
    });

    // Apply migration patterns
    migrationPatterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        hasChanges = true;
      }
    });

    // Apply auth context replacements
    authContextReplacements.forEach(replacement => {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        hasChanges = true;
      }
    });

    // Replace table IDs with table names
    const tableIdReplacements = {
      "'11726'": "'products'",
      "'11727'": "'employees'", 
      "'11729'": "'vendors'",
      "'11730'": "'orders'",
      "'11731'": "'licenses_certificates'",
      "'11788'": "'salary_records'",
      "'11728'": "'daily_sales_reports'",
      "'12356'": "'daily_sales_reports_enhanced'",
      "'12196'": "'delivery_records'",
      "'12599'": "'stations'"
    };

    Object.entries(tableIdReplacements).forEach(([oldId, newName]) => {
      if (content.includes(oldId)) {
        content = content.replace(new RegExp(oldId, 'g'), newName);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Migrated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting API migration to Supabase...\n');
  
  filesToMigrate.forEach(filePath => {
    migrateFile(filePath);
  });
  
  console.log('\n✨ Migration completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env.local file with Supabase credentials');
  console.log('2. Run the database setup script in Supabase');
  console.log('3. Test the application thoroughly');
  console.log('4. Remove any remaining window.ezsite.apis references');
}

if (require.main === module) {
  main();
}