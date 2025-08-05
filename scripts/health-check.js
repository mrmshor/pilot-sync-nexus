#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 בודק תקינות פרויקט Capacitor...\n')

const checks = [
  {
    name: 'package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'צור קובץ package.json'
  },
  {
    name: 'capacitor.config.ts exists', 
    check: () => fs.existsSync('capacitor.config.ts'),
    fix: 'צור קובץ capacitor.config.ts'
  },
  {
    name: 'vite.config.ts exists',
    check: () => fs.existsSync('vite.config.ts'), 
    fix: 'צור קובץ vite.config.ts'
  },
  {
    name: 'src directory exists',
    check: () => fs.existsSync('src'),
    fix: 'צור תיקיית src'
  },
  {
    name: 'dist directory exists',
    check: () => fs.existsSync('dist'),
    fix: 'הרץ: npm run build'
  },
  {
    name: 'ios directory exists',
    check: () => fs.existsSync('ios'),
    fix: 'הרץ: npx cap add ios'
  },
  {
    name: 'node_modules exists',
    check: () => fs.existsSync('node_modules'),
    fix: 'הרץ: npm install'
  },
  {
    name: 'Capacitor dependencies in package.json',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        return pkg.dependencies?.['@capacitor/core'] || pkg.devDependencies?.['@capacitor/cli']
      } catch {
        return false
      }
    },
    fix: 'הוסף: npm install @capacitor/core @capacitor/cli'
  }
]

let passed = 0
let failed = 0

checks.forEach(({ name, check, fix }) => {
  const result = check()
  if (result) {
    console.log(`✅ ${name}`)
    passed++
  } else {
    console.log(`❌ ${name} - תיקון: ${fix}`)
    failed++
  }
})

console.log(`\n📊 תוצאות: ${passed} עברו, ${failed} נכשלו`)

if (failed === 0) {
  console.log('🎉 הפרויקט תקין!')
} else {
  console.log('⚠️  יש בעיות שדורשות תיקון')
}