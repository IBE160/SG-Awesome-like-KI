// tests/e2e/content-management.spec.ts
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises'; // Import fs.promises for async file operations

test.describe('Content Management Flow', () => {
  const userEmail = `test-${uuidv4()}@example.com`;
  const userPassword = 'password123';
  const testFileName = 'test_document.txt';
  const testFileContent = 'This is some test content for the document.';
  const testFilePath = path.join(__dirname, testFileName); // Path to the dummy file
  const testClassName = `My Test Class ${uuidv4().substring(0, 8)}`;

  // --- Setup and Teardown for the dummy file ---
  test.beforeAll(async () => {
    // Create the dummy file before all tests run
    await fs.writeFile(testFilePath, testFileContent);
  });

  test.afterAll(async () => {
    // Delete the dummy file after all tests run
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

  test('should allow user to upload document, generate content, and assign it', async ({ page, request }) => {
    // 1. Register and Login
    await registerAndLogin(page, userEmail, userPassword);

    // 2. Create a class for assignment later via API
    const createClassResponse = await request.post('/api/classes', {
      data: { name: testClassName },
    });
    expect(createClassResponse.ok()).toBeTruthy();
    const createdClass = await createClassResponse.json();
    const classId = createdClass.class.id;
    expect(classId).toBeDefined();

    // 3. Upload a document
    await page.goto('/upload');
    // Use setInputFiles to upload the dummy file
    await page.locator('input[data-testid="dropzone-input"]').setInputFiles(testFilePath);

    await page.waitForSelector('text=File ready for upload:', { timeout: 10000 });
    expect(page.getByText(`Name: ${testFileName}`)).toBeVisible();

    // Select the created class (optional for upload, but good for E2E)
    await page.selectOption('#class-select', classId);

    await page.getByRole('button', { name: /Upload Document/i }).click();

    await expect(page.getByText(/File uploaded and processed successfully!/i)).toBeVisible();
    await expect(page.getByText(/Document Uploaded Successfully!/i)).toBeVisible();
    expect(page.getByRole('button', { name: /Generate Summary/i })).toBeVisible();
    expect(page.getByRole('button', { name: /Generate Quiz/i })).toBeVisible();

    const documentId = (await page.getByText(/Document ID: (.*)/i).textContent())?.match(/Document ID: (.*)/)?.[1];
    expect(documentId).toBeDefined();

    // 4. Generate Summary
    await page.getByRole('button', { name: /Generate Summary/i }).click();
    // Assuming the API call immediately resolves and there's no visible loading state for now
    // In a real scenario, you might expect a toast or a temporary loading state
    // await expect(page.getByText(/Generating summary for document:/i)).toBeVisible({timeout:10000}); // Check console log message (from mock in dev environment)

    // Wait for a short period to allow API call to resolve (in real scenario, this would be a success message)
    await page.waitForTimeout(1000);

    // 5. Navigate to Unorganized Content and verify the generated summary is there
    await page.goto('/unorganized-content');
    await expect(page.getByText('Unorganized Generated Content')).toBeVisible();
    await expect(page.getByText(`From: ${testFileName}`)).toBeVisible();
    await expect(page.getByText(/Summary of /i)).toBeVisible(); // Assuming summary placeholder starts with this

    // 6. Assign the unorganized content
    await page.getByRole('button', { name: /Assign/i }).first().click(); // Click assign button for the first unorganized content
    await page.selectOption('select', classId); // Select the class from dropdown
    await page.getByRole('button', { name: /Confirm Assign/i }).click();

    await expect(page.getByText(/Content assigned successfully!/i)).toBeVisible();
    await expect(page.getByText('No unorganized content found.')).toBeVisible(); // Should be gone from list

    // 7. Logout
    await page.goto('/classes'); // Go to a page with LogoutButton
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('/login');
    await expect(page.getByRole('heading', { name: /Login/i })).toBeVisible();
  });
});