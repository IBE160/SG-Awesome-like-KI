// tests/e2e/summary-generation.spec.ts
import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

test.describe('Summary Generation Flow', () => {
  const userEmail = `summary-test-${randomUUID()}@example.com`;
  const userPassword = 'password123';
  const testFileName = 'summary_document.txt';
  const testFileContent = 'This is a document about various animals. It talks about lions, tigers, and bears. Lions are large cats found in Africa. Tigers are striped cats found in Asia. Bears are omnivores found in many parts of the world.';
  const testFilePath = path.join(__dirname, testFileName);

  // --- Setup and Teardown for the dummy file ---
  test.beforeAll(async () => {
    await fs.writeFile(testFilePath, testFileContent);
  });

  test.afterAll(async () => {
    await fs.unlink(testFilePath);
  });
  // --- End Setup and Teardown ---

  // Helper function to register and login a user
  const registerAndLogin = async (page: any, email: string, password: string) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Registration successful!/i)).toBeVisible();

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/classes'); // Adjust based on actual post-login redirect
  };

  test('should allow user to upload document and generate a summary', async ({ page, request }) => {
    // 1. Register and Login
    await registerAndLogin(page, userEmail, userPassword);

    // 2. Create a class for assignment later via API (optional for this test, but good practice)
    const testClassName = `Summary Class ${randomUUID().substring(0, 8)}`;
    const createClassResponse = await request.post('/api/classes', {
      data: { name: testClassName },
    });
    expect(createClassResponse.ok()).toBeTruthy();
    const createdClass = await createClassResponse.json();
    const classId = createdClass.class.id;
    expect(classId).toBeDefined();

    // 3. Upload a document
    await page.goto('/upload');
    await page.locator('input[data-testid="dropzone-input"]').setInputFiles(testFilePath);

    await page.waitForSelector('text=File ready for upload:', { timeout: 10000 });
    expect(page.getByText(`Name: ${testFileName}`)).toBeVisible();

    // Select the created class
    await page.selectOption('#class-select', classId);

    await page.getByRole('button', { name: /Upload Document/i }).click();

    await expect(page.getByText(/File uploaded and processed successfully!/i)).toBeVisible();
    await expect(page.getByText(/Document Uploaded Successfully!/i)).toBeVisible();
    
    // Assuming SummaryGenerator is rendered on this post-upload success page
    await expect(page.getByRole('button', { name: /Generate Summary/i })).toBeVisible();

    // 4. Generate Summary
    // Mock the API response for /api/generate to control the summary content
    await page.route('**/api/generate', async route => {
      const json = {
        content: { summary: 'This is a concise summary about lions, tigers, and bears.' },
        generatedContentId: 'mock-summary-id',
        status: 'success'
      };
      await route.fulfill({ json, status: 200 });
    });

    await page.getByRole('button', { name: /Generate Summary/i }).click();

    // 5. Verify loading state
    await expect(page.getByText(/Generating your summary, please wait/i)).toBeVisible();
    // Wait for the loading message to disappear, implying generation is complete
    await expect(page.getByText(/Generating your summary, please wait/i)).not.toBeVisible();

    // 6. Verify generated summary content
    await expect(page.getByRole('heading', { name: /Generated Summary/i })).toBeVisible();
    await expect(page.getByText('This is a concise summary about lions, tigers, and bears.')).toBeVisible();
    
    // 7. Logout (cleanup)
    await page.goto('/classes');
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('/login');
  });

  test('should display an error message if summary generation fails', async ({ page, request }) => {
    // 1. Register and Login
    await registerAndLogin(page, userEmail, userPassword);

    // 2. Create a class (optional)
    const testClassName = `Summary Error Class ${randomUUID().substring(0, 8)}`;
    await request.post('/api/classes', { data: { name: testClassName } });

    // 3. Upload a document
    await page.goto('/upload');
    await page.locator('input[data-testid="dropzone-input"]').setInputFiles(testFilePath);
    await page.waitForSelector('text=File ready for upload:', { timeout: 10000 });
    await page.getByRole('button', { name: /Upload Document/i }).click();
    await expect(page.getByText(/Document Uploaded Successfully!/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate Summary/i })).toBeVisible();

    // 4. Generate Summary - Mock API response to fail
    await page.route('**/api/generate', async route => {
      const json = { error: 'Failed to connect to AI service' };
      await route.fulfill({ json, status: 500 });
    });

    await page.getByRole('button', { name: /Generate Summary/i }).click();

    // 5. Verify loading state (should appear and then disappear)
    await expect(page.getByText(/Generating your summary, please wait/i)).toBeVisible();
    await expect(page.getByText(/Generating your summary, please wait/i)).not.toBeVisible();

    // 6. Verify error message content
    await expect(page.getByText('An error occurred')).toBeVisible();
    await expect(page.getByText('Failed to connect to AI service')).toBeVisible();

    // 7. Logout (cleanup)
    await page.goto('/classes');
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('/login');
  });
});