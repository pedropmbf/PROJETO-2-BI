import { test, expect } from '@playwright/test';

/**
 * CT-16 — Fluxo E2E: Registro → Explorar → Adicionar à biblioteca → Mudar status
 *
 * Cobre UC01 (cadastro), UC04 (busca RAWG), UC06 (adicionar à biblioteca), UC07 (atualizar status),
 * UC26 (excluir conta — cleanup ao final).
 */
test('CT-16: registro, explorar, adicionar à biblioteca, mudar status', async ({ page }) => {
  const stamp = Date.now();
  const username = `e2e_${stamp}`;
  const email = `e2e_${stamp}@test.com`;
  const password = 'senha123';

  // 1. Registrar
  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Senha').fill(password);
  await page.getByRole('button', { name: 'Criar Conta' }).click();

  // 2. Redirecionado para /explore
  await expect(page).toHaveURL(/\/explore$/, { timeout: 10_000 });

  // 3. Buscar jogo
  await page.getByPlaceholder(/Buscar jogo/i).fill('zelda');
  await page.getByRole('button', { name: 'Buscar' }).click();

  // 4. Aguardar resultados aparecerem (botões "+ Biblioteca")
  const addButton = page.getByRole('button', { name: '+ Biblioteca' }).first();
  await expect(addButton).toBeVisible({ timeout: 15_000 });
  await addButton.click();

  // 5. Confirmação de adição
  await expect(page.getByText(/adicionado ao backlog/i)).toBeVisible({ timeout: 10_000 });

  // 6. Ir para biblioteca e validar que o jogo aparece
  await page.goto('/library');
  const statusSelect = page.locator('select').first();
  await expect(statusSelect).toBeVisible({ timeout: 10_000 });
  await expect(statusSelect).toHaveValue('backlog');

  // 7. Mudar status para "playing"
  await statusSelect.selectOption('playing');
  await page.reload();
  await expect(page.locator('select').first()).toHaveValue('playing');

  // 8. Cleanup — excluir conta (cascade limpa userGames)
  await page.goto('/profile');
  page.once('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') await dialog.accept('EXCLUIR');
    else await dialog.accept();
  });
  await page.getByRole('button', { name: /Excluir minha conta/i }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
});
