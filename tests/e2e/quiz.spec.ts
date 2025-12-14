import { test, expect } from '@playwright/test';

test.describe('Quiz Interface with Motivational Feedback and Explanations', () => {
  test('should display motivational feedback and explanations after quiz completion', async ({ page }) => {
    // 1. Mock the /api/generate response
    await page.route('**/api/generate', async (route) => {
      const json = {
        content: {
          motivational_feedback: 'Excellent work! Your dedication to learning is truly inspiring. Keep up the great effort!',
          quiz: [
            {
              question: 'What is the capital of France?',
              options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
              answer: 'Paris',
              explanation: 'Paris is renowned for its historical landmarks and cultural significance.',
            },
            {
              question: 'Which planet is known as the Red Planet?',
              options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
              answer: 'Mars',
              explanation: 'Mars gets its distinctive reddish hue from iron oxide (rust) on its surface.',
            },
            {
              question: 'What is the largest ocean on Earth?',
              options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
              answer: 'Pacific Ocean',
              explanation: 'The Pacific Ocean covers about one-third of the surface of the Earth.',
            },
          ],
        },
        message: null,
      };
      await route.fulfill({ json, status: 200 });
    });

    // 2. Navigate to the quiz page
    await page.goto('/quiz-test');

    // Wait for the quiz to load (or a specific element to appear)
    await expect(page.getByText('Question 1 of 3')).toBeVisible();

    // 3. Answer questions and verify explanations
    // Question 1
    await page.getByLabel('Paris').click();
    await page.getByRole('button', { name: 'Submit Answer' }).click();
    await expect(page.getByText('Paris is renowned for its historical landmarks and cultural significance.')).toBeVisible();
    await page.getByRole('button', { name: 'Next Question' }).click();

    // Question 2
    await expect(page.getByText('Question 2 of 3')).toBeVisible();
    await page.getByLabel('Mars').click();
    await page.getByRole('button', { name: 'Submit Answer' }).click();
    await expect(page.getByText('Mars gets its distinctive reddish hue from iron oxide (rust) on its surface.')).toBeVisible();
    await page.getByRole('button', { name: 'Next Question' }).click();

    // Question 3
    await expect(page.getByText('Question 3 of 3')).toBeVisible();
    await page.getByLabel('Pacific Ocean').click();
    await page.getByRole('button', { name: 'Submit Answer' }).click();
    await expect(page.getByText('The Pacific Ocean covers about one-third of the surface of the Earth.')).toBeVisible();
    await page.getByRole('button', { name: 'Finish Quiz' }).click();

    // 4. Verify motivational feedback on completion screen
    await expect(page.getByText('Quiz Completed!')).toBeVisible();
    await expect(page.getByText('You scored 3 out of 3')).toBeVisible();
    await expect(page.getByText('Excellent work! Your dedication to learning is truly inspiring. Keep up the great effort!')).toBeVisible();
  });

  test('should display default explanation when AI provides none', async ({ page }) => {
    // 1. Mock the /api/generate response with a missing explanation
    await page.route('**/api/generate', async (route) => {
      const json = {
        content: {
          motivational_feedback: 'You\'re doing great!',
          quiz: [
            {
              question: 'Question with no AI explanation?',
              options: ['Option A', 'Option B'],
              answer: 'Option A',
              explanation: 'Explanation not available.', // Backend fills this
            },
          ],
        },
        message: null,
      };
      await route.fulfill({ json, status: 200 });
    });

    await page.goto('/quiz-test');
    await expect(page.getByText('Question 1 of 1')).toBeVisible();

    // Answer the question
    await page.getByLabel('Option A').click();
    await page.getByRole('button', { name: 'Submit Answer' }).click();

    // Verify the default explanation is displayed
    await expect(page.getByText('Explanation not available.')).toBeVisible();
  });
});
