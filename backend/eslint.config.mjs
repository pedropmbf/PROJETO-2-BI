import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test-report/**', 'generated/**', 'prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Type safety — warn ao invés de error para não travar
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // SonarJS — manter padrões críticos como error, demais como warn
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],

      // Hardening de produção — informativo no contexto acadêmico
      'sonarjs/x-powered-by': 'warn',
      'sonarjs/cors': 'warn',
    },
  },
  {
    // Testes podem usar any, secrets fake, expressões repetidas etc
    files: ['src/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/hardcoded-secret-signatures': 'off',
      'sonarjs/hardcoded-secret': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/pseudo-random': 'off',
    },
  },
];
