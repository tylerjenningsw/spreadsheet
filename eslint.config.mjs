import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettier from '@vue/eslint-config-prettier'

export default defineConfigWithVueTs(
  // Essential Vue 3 rules
  pluginVue.configs['flat/recommended'],

  // TypeScript recommended rules
  vueTsConfigs.recommended,

  // Prettier integration (should be last)
  prettier,

  // Custom rules
  {
    rules: {
      // Detect unused variables and functions
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always'
          }
        }
      ],

      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  },

  // Ignore patterns
  {
    ignores: ['dist/', 'node_modules/', '*.d.ts', 'coverage/', '.git/']
  }
)
