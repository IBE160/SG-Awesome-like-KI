import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Profile Management Flow', () => {
  const userEmail = `test-${uuidv4()}@example.com`;
  const userPassword = 'password123';
  const newFullName = `Updated Name ${uuidv4().substring(0, 8)}`;

  // It's good practice to ensure a clean state before each test if possible
  // For E2E, this often means creating a fresh user.

  test('should allow a user to register, log in, update their profile, and log out', async ({ page }) => {
    // 1. Register a new user
    await page.goto('/register');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');

    // Assuming a successful registration redirects to login or dashboard
    // Wait for successful registration message or redirect
    await expect(page.locator('text=Registration successful')).toBeVisible(); // Adjust based on actual UI message
    await page.waitForURL('/login'); // Assuming it redirects to login after registration

    // 2. Log in with the new user
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');

    // Assuming successful login redirects to a dashboard or profile page
    await page.waitForURL('/'); // Adjust based on actual post-login redirect

    // 3. Navigate to the profile page
    // Assuming there's a navigation link to profile
    await page.click('text=Profile'); // Adjust selector as needed

    // Wait for the profile page to load
    await expect(page.locator('h1', { hasText: 'Profile Settings' })).toBeVisible();

    // 4. Update the user's full name
    const fullNameInput = page.locator('label:has-text("Full Name") + input'); // Adjust selector
    await expect(fullNameInput).toBeVisible();
    await fullNameInput.fill(newFullName);
    await page.click('button[type="submit"]'); // Click the update button

    // Wait for success message
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible();

    // 5. Verify the update persisted (e.g., by refreshing the page or navigating away and back)
    await page.reload(); // Reload the page to ensure persistence
    await expect(fullNameInput).toHaveValue(newFullName);

    // 6. Log out
    // Assuming there's a logout button
    await page.click('text=Logout'); // Adjust selector
    await page.waitForURL('/login'); // Adjust based on actual post-logout redirect
    await expect(page.locator('h1', { hasText: 'Login' })).toBeVisible();
  });
});
