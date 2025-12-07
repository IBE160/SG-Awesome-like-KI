// tests/e2e/assign-content.spec.ts
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

test.describe('Content Assignment and Reassignment Flow', () => {
  const userEmail = `test-assign-${uuidv4()}@example.com`;
  const userPassword = 'password123';
  const testFileName = `assign-test-${uuidv4().substring(0, 4)}.txt`;
  const testFileContent = 'This document is for testing assignment and reassignment.';
  const testFilePath = path.join(__dirname, testFileName);

  const className1 = `Class Alpha ${uuidv4().substring(0, 4)}`;
  const className2 = `Class Beta ${uuidv4().substring(0, 4)}`;
  const sectionName = `Section Gamma ${uuidv4().substring(0, 4)}`;

  let classId1: string;
  let classId2: string;
  let sectionId: string;

  // --- Setup and Teardown for the dummy file ---
  test.beforeAll(async () => {
    await fs.writeFile(testFilePath, testFileContent);
  });

  test.afterAll(async () => {
    await fs.unlink(testFilePath);
  });
  // --- End Setup and Teardown ---

  // Helper to register and login
  const registerAndLogin = async (page: any) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Registration successful!/i)).toBeVisible({ timeout: 10000 });

    await page.goto('/login');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/classes');
    await expect(page.getByRole('heading', { name: /Your Classes/i })).toBeVisible();
  };

  test('should allow assigning content during upload and reassigning it later', async ({ page, request }) => {
    // 1. Register and Login
    await registerAndLogin(page);

    // 2. Create Classes and Section via API for a clean setup
    const class1Res = await request.post('/api/classes', { data: { name: className1 } });
    expect(class1Res.ok()).toBeTruthy();
    const class1Data = await class1Res.json();
    classId1 = class1Data.class.id;

    const class2Res = await request.post('/api/classes', { data: { name: className2 } });
    expect(class2Res.ok()).toBeTruthy();
    const class2Data = await class2Res.json();
    classId2 = class2Data.class.id;

    const sectionRes = await request.post(`/api/classes/${classId2}/sections`, { data: { name: sectionName } });
    expect(sectionRes.ok()).toBeTruthy();
    const sectionData = await sectionRes.json();
    sectionId = sectionData.section.id;

    // 3. Upload a document and assign it to Class Alpha
    await page.goto('/upload');
    await page.locator('input[data-testid="dropzone-input"]').setInputFiles(testFilePath);
    await expect(page.getByText(`Name: ${testFileName}`)).toBeVisible();

    // Assign to the first class
    await page.selectOption('#class-select', classId1);
    await page.getByRole('button', { name: /Upload Document/i }).click();

    await expect(page.getByText(/Document Uploaded Successfully!/i)).toBeVisible({ timeout: 15000 });
    const documentIdText = await page.getByText(/Document ID:/).textContent();
    const documentId = documentIdText?.split(': ')[1];
    expect(documentId).toBeDefined();

    // 4. Verify Initial Assignment
    await page.goto(`/classes/${classId1}`);
    await expect(page.getByRole('heading', { name: className1 })).toBeVisible();
    await expect(page.getByText(testFileName)).toBeVisible();

    // Check that the other class is empty
    await page.goto(`/classes/${classId2}`);
    await expect(page.getByRole('heading', { name: className2 })).toBeVisible();
    await expect(page.getByText(testFileName)).not.toBeVisible();
    await expect(page.getByText('No documents found in this class.')).toBeVisible();

    // 5. Reassign the Document to Section Gamma in Class Beta
    await page.goto('/assign-content');
    await expect(page.getByRole('heading', { name: /Assign Content/i })).toBeVisible();
    
    // Find the document and open the assignment dialog
    const documentRow = page.getByRole('row', { name: new RegExp(testFileName) });
    await expect(documentRow).toBeVisible();
    await documentRow.getByRole('button', { name: /Reassign/i }).click();

    // In the dialog, select the new class and section
    await page.selectOption('select[name="classId"]', classId2);
    // Wait for the sections dropdown to update
    await page.waitForResponse(resp => resp.url().includes(`/api/classes/${classId2}/sections`) && resp.status() === 200);
    await page.selectOption('select[name="sectionId"]', sectionId);
    
    await page.getByRole('button', { name: /Save Assignment/i }).click();
    await expect(page.getByText(/Assignment updated successfully/i)).toBeVisible();

    // The document should now be updated in the list
    await expect(documentRow.getByText(className2)).toBeVisible();
    await expect(documentRow.getByText(sectionName)).toBeVisible();

    // 6. Verify Reassignment
    // Check that it's gone from the first class
    await page.goto(`/classes/${classId1}`);
    await expect(page.getByText(testFileName)).not.toBeVisible();
    await expect(page.getByText('No documents found in this class.')).toBeVisible();

    // Check that it's visible in the second class
    await page.goto(`/classes/${classId2}`);
    await expect(page.getByText(testFileName)).toBeVisible();

    // Check that it's visible in the section view
    await page.goto(`/sections/${sectionId}`);
    await expect(page.getByRole('heading', { name: sectionName })).toBeVisible();
    await expect(page.getByText(testFileName)).toBeVisible();

    // 7. Logout
    await page.goto('/classes');
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('/login');
  });
});
