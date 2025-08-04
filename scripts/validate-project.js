#!/usr/bin/env node

/**
 * 🔍 Project Validation Script
 * בדיקה מקיפה של תקינות הפרויקט לפני build
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Starting comprehensive project validation...\n');

const errors = [];
const warnings = [];

// 1. Check critical files exist
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/types/index.ts',
  'src/services/index.ts',
  'package.json',
  'tsconfig.json',
  'vite.config.ts'
];

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`Critical file missing: ${file}`);
  } else {
    console.log(`  ✅ ${file}`);
  }
});

// 2. Check TypeScript imports
console.log('\n📦 Checking TypeScript imports...');
function checkImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory() && !file.name.startsWith('.')) {
      checkImports(path.join(dir, file.name));
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const filePath = path.join(dir, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for @/ imports
      const imports = content.match(/from ['"]@\/.*['"]/g) || [];
      imports.forEach(imp => {
        const importPath = imp.match(/from ['"]@\/(.*)['"]/)[1];
        const fullPath = path.join('src', importPath);
        
        // Check if it's a file or directory with index
        const possiblePaths = [
          fullPath + '.ts',
          fullPath + '.tsx',
          path.join(fullPath, 'index.ts'),
          path.join(fullPath, 'index.tsx')
        ];
        
        const exists = possiblePaths.some(p => fs.existsSync(p));
        if (!exists) {
          errors.push(`Broken import in ${filePath}: ${imp}`);
        }
      });
    }
  });
}

try {
  checkImports('src');
  console.log('  ✅ All imports validated');
} catch (error) {
  errors.push(`Import validation failed: ${error.message}`);
}

// 3. Check Tauri configuration
console.log('\n🦀 Checking Tauri configuration...');
if (fs.existsSync('src-tauri/tauri.conf.json')) {
  try {
    const tauriConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
    
    // Tauri icons are disabled intentionally
    if (tauriConfig.bundle?.icon && tauriConfig.bundle.icon.length > 0) {
      warnings.push('Tauri bundle.icon should be empty array to disable icons');
    }
    
    if (!tauriConfig.productName) {
      errors.push('Missing productName in Tauri config');
    }
    
    console.log('  ✅ Tauri configuration valid');
  } catch (error) {
    errors.push(`Tauri config validation failed: ${error.message}`);
  }
} else {
  warnings.push('Tauri configuration not found (web-only build)');
}

// 4. Check package.json dependencies
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = ['react', 'react-dom', '@tanstack/react-query'];
  requiredDeps.forEach(dep => {
    if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
      errors.push(`Missing required dependency: ${dep}`);
    }
  });
  
  console.log('  ✅ Package dependencies validated');
} catch (error) {
  errors.push(`Package.json validation failed: ${error.message}`);
}

// 5. Results summary
console.log('\n' + '='.repeat(50));
console.log('🎯 VALIDATION RESULTS');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 ✅ ALL CHECKS PASSED! Project is ready for build.');
  process.exit(0);
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(error => console.log(`  ❌ ${error}`));
  console.log('\n🚫 Build should NOT proceed until all errors are fixed!');
  process.exit(1);
}

console.log('\n✅ No critical errors found. Build can proceed.');
process.exit(0);