import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';

test.describe('Blackbox Sistem Rekomendasi Salon', () => {
  test('BB-01 beranda menampilkan identitas salon dan CTA konsultasi', async ({ page }) => {
    await page.goto(`${baseUrl}/`);

    await expect(page.getByText('Jharmy Salon').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Mulai Konsultasi/ }).first()).toBeVisible();
    await expect(page.getByText('Sistem rekomendasi treatment salon')).toBeVisible();
  });

  test('BB-02 profil contoh artikel menghasilkan Facial sebagai rekomendasi utama', async ({ page }) => {
    await page.goto(`${baseUrl}/quiz`);

    await expect(page.getByText('Profil Kebutuhan Pelanggan')).toBeVisible();
    await page.getByRole('button', { name: /Dapatkan Rekomendasi/ }).click();

    await expect(page).toHaveURL(/\/recommendations$/);
    await expect(page.getByText('Rekomendasi Treatment')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Facial' })).toBeVisible();
    await expect(page.getByText('1.00').first()).toBeVisible();
    await expect(page.getByText('A1, A5, A6, A7, A15')).toBeVisible();
  });

  test('BB-03 pengguna mengisi profil rambut dan mendapat rekomendasi Hair Spa', async ({ page }) => {
    await page.goto(`${baseUrl}/quiz`);

    await page.getByRole('button', { name: 'Rambut' }).click();
    await page.getByLabel('Komedo').uncheck();
    await page.getByLabel('Kulit kusam').uncheck();
    await page.getByLabel('Rambut kering').check();
    await page.getByLabel('Nutrisi rambut').check();
    await page.getByRole('button', { name: /Dapatkan Rekomendasi/ }).click();

    await expect(page).toHaveURL(/\/recommendations$/);
    await expect(page.getByRole('heading', { name: 'Hair Spa' })).toBeVisible();
    await expect(page.getByText('0.87').first()).toBeVisible();
  });

  test('BB-04 halaman admin dashboard dan inventory dapat diakses', async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);
    await expect(page.getByText('Selamat datang, Admin')).toBeVisible();
    await expect(page.getByText('Akurasi Uji')).toBeVisible();

    await page.getByRole('link', { name: /Kelola Treatment/ }).click();
    await expect(page).toHaveURL(/\/admin\/inventory$/);
    await expect(page.getByText('Kelola Treatment').first()).toBeVisible();
    await expect(page.getByText('Facial')).toBeVisible();
    await expect(page.getByText('Menampilkan 8 dari 8 treatment')).toBeVisible();
  });

  test('BB-05 akses langsung rekomendasi memakai profil contoh artikel', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/recommendations`);

    await expect(page.getByText('Menggunakan contoh profil pada artikel')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Facial' })).toBeVisible();
    await expect(errors).toHaveLength(0);
  });
});
