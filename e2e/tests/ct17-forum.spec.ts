import { test, expect } from '@playwright/test';

/**
 * CT-17 — Fluxo E2E: Registro → Criar post no fórum → Comentar
 *
 * Cobre UC01 (cadastro), UC12 (criar post), UC15 (comentar), UC26 (excluir conta cleanup).
 */
test('CT-17: registro, criar post no fórum, comentar', async ({ page }) => {
  const stamp = Date.now();
  const username = `e2e_${stamp}`;
  const email = `e2e_${stamp}@test.com`;
  const password = 'senha123';
  const postTitle = `Post E2E ${stamp}`;
  const postContent = 'Esse post foi criado pelo teste end-to-end.';
  const commentText = `Comentário E2E ${stamp}`;

  // 1. Registrar
  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Senha').fill(password);
  await page.getByRole('button', { name: 'Criar Conta' }).click();
  await expect(page).toHaveURL(/\/explore$/, { timeout: 10_000 });

  // 2. Ir para o fórum
  await page.goto('/forum');
  await page.getByRole('button', { name: /Novo Post/i }).click();

  // 3. Preencher e publicar
  await page.getByPlaceholder('Título do post').fill(postTitle);
  await page.getByPlaceholder('Conteúdo...').fill(postContent);
  await page.getByRole('button', { name: 'Publicar' }).click();

  // 4. O post deve aparecer na lista
  const postLink = page.getByRole('link', { name: new RegExp(postTitle) });
  await expect(postLink).toBeVisible({ timeout: 10_000 });
  await postLink.click();

  // 5. Comentar
  await page.getByPlaceholder(/Escreva um comentário/i).fill(commentText);
  await page.getByRole('button', { name: 'Comentar' }).click();

  // 6. Comentário visível sem reload
  await expect(page.getByText(commentText)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Comentários \(1\)/)).toBeVisible();

  // 7. Cleanup — excluir conta (cascade limpa post + comentário)
  await page.goto('/profile');
  page.once('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') await dialog.accept('EXCLUIR');
    else await dialog.accept();
  });
  await page.getByRole('button', { name: /Excluir minha conta/i }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
});
