import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test.describe('Blackbox Sistem Rekomendasi Salon', () => {
  test('BB-01 beranda menampilkan identitas salon, login, dan CTA konsultasi', async ({ page }) => {
    await page.goto(`${baseUrl}/`);

    await expect(page.getByText('Jharmy Salon').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Mulai Konsultasi/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Login/ })).toBeVisible();
    await expect(page.getByText('Konsultasi treatment salon')).toBeVisible();
  });

  test('BB-02 tamu dapat konsultasi wajah dan mendapat rekomendasi Facial', async ({ page }) => {
    await page.goto(`${baseUrl}/quiz`);

    await page.getByLabel('Nama pelanggan').fill('Siti Rahma');
    await page.getByLabel('Nomor WhatsApp').fill('081234567890');
    await page.getByLabel('Jenis kulit wajah').selectOption('Kulit berminyak');
    await page.getByLabel('Komedo').check();
    await page.getByLabel('Kulit kusam').check();
    await page.getByLabel('Membersihkan wajah').check();
    await page.getByRole('button', { name: /Lihat Rekomendasi/ }).click();

    await expect(page).toHaveURL(/\/recommendations$/);
    await expect(page.getByText('Rekomendasi untuk Siti Rahma')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Facial' })).toBeVisible();
    await expect(page.getByText(/Similarity|Rincian Perhitungan|Contoh hitung/i)).toHaveCount(0);
  });

  test('BB-03 pelanggan login dapat melihat riwayat konsultasi di dashboard', async ({ page }) => {
    const email = `dina-${Date.now()}@example.com`;

    await page.goto(`${baseUrl}/login`);

    await page.getByRole('button', { name: /Daftar Akun/ }).click();
    await page.getByLabel('Nama pelanggan').fill('Dina Laras');
    await page.getByLabel('Nomor WhatsApp').fill('089876543210');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('pelanggan123');
    await page.getByRole('button', { name: /Daftar & Masuk/ }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole('link', { name: /Konsultasi Baru/ }).click();
    await page.getByRole('button', { name: 'Rambut' }).click();
    await page.getByLabel('Rambut kering').check();
    await page.getByLabel('Nutrisi rambut').check();
    await page.getByRole('button', { name: /Lihat Rekomendasi/ }).click();

    await expect(page.getByRole('heading', { name: 'Hair Spa' })).toBeVisible();
    await page.getByRole('link', { name: /Dashboard/ }).first().click();
    await expect(page.getByText('Halo, Dina Laras')).toBeVisible();
    await expect(page.getByText('Hair Spa')).toBeVisible();
  });

  test('BB-04 admin login dapat membuka dashboard, treatment, atribut, dan pelanggan', async ({ page }) => {
    await page.goto(`${baseUrl}/login?role=admin`);
    await page.getByRole('button', { name: /^Masuk$/ }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText('Selamat datang, Admin')).toBeVisible();

    await page.getByRole('link', { name: /Kelola Treatment/ }).click();
    await expect(page).toHaveURL(/\/admin\/inventory$/);
    await expect(page.getByText('Kelola Treatment').first()).toBeVisible();
    await expect(page.getByText('Facial')).toBeVisible();

    await page.getByRole('link', { name: /Kelola Atribut/ }).click();
    await expect(page).toHaveURL(/\/admin\/attributes$/);
    await expect(page.getByText('Kelola Atribut').first()).toBeVisible();
    await expect(page.getByText('A1')).toBeVisible();

    await page.getByRole('link', { name: /Data Pelanggan/ }).click();
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByText('Kelola Konsultasi')).toBeVisible();
  });

  test('BB-05 akses langsung rekomendasi meminta data konsultasi terlebih dahulu', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/recommendations`);

    await expect(page.getByText('Belum Ada Data Konsultasi')).toBeVisible();
    await expect(page.getByRole('link', { name: /Mulai Konsultasi/ })).toBeVisible();
    await expect(errors).toHaveLength(0);
  });
});
