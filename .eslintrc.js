module.exports = {
  // ... existing config ...
  rules: {
    // ... existing rules ...
    '@typescript-eslint/no-explicit-any': 'off', // Allow any types for API responses
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }]
  }
} 