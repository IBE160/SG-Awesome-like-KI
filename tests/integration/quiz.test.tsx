// tests/integration/quiz.test.ts
// This file will contain integration tests for the QuizInterface component.
// Due to known Jest configuration issues with Next.js client components and shadcn/ui dependencies,
// these tests are written with the expectation that running them might require further Jest setup.

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuizTestPage from "@/app/quiz-test/page"; // Import the page that uses the QuizProvider and QuizInterface
import { QuizProvider } from "@/lib/context/QuizContext";

// Mocking the QuizProvider for isolated testing if needed,
// but for integration tests, we'll use the actual provider from QuizTestPage.

describe("Quiz Interface Integration Tests", () => {
  beforeEach(() => {
    // Clear any previous state if necessary for isolated tests
    // This might not be strictly needed for QuizTestPage which re-initializes mock data
  });

  it("should render the quiz interface with the first question", async () => {
    render(<QuizTestPage />);

    // Check if the page title is rendered
    expect(screen.getByRole("heading", { name: /Quiz Test Page/i })).toBeInTheDocument();

    // Check if the first question is rendered
    expect(screen.getByText(/Question 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/What is the capital of France?/i)).toBeInTheDocument();

    // Check if options for the first question are rendered
    expect(screen.getByLabelText(/Berlin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Paris/i)).toBeInTheDocument();
  });

  it("should allow selecting an answer and submitting it, then show correct feedback", async () => {
    render(<QuizTestPage />);

    // Select the correct answer for the first question
    fireEvent.click(screen.getByLabelText(/Paris/i));
    expect(screen.getByLabelText(/Paris/i)).toBeChecked();

    // Submit the answer
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));

    // Wait for feedback to appear
    await waitFor(() => {
      expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
    });

    // Check that Next Question button is enabled
    expect(screen.getByRole("button", { name: /Next Question/i })).toBeEnabled();
  });

  it("should allow selecting an answer and submitting it, then show incorrect feedback", async () => {
    render(<QuizTestPage />);

    // Select an incorrect answer for the first question
    fireEvent.click(screen.getByLabelText(/Berlin/i));
    expect(screen.getByLabelText(/Berlin/i)).toBeChecked();

    // Submit the answer
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));

    // Wait for feedback to appear
    await waitFor(() => {
      expect(screen.getByText(/Incorrect./i)).toBeInTheDocument();
      expect(screen.getByText(/The correct answer was: Paris/i)).toBeInTheDocument();
    });

    // Check that Next Question button is enabled
    expect(screen.getByRole("button", { name: /Next Question/i })).toBeEnabled();
  });

  it("should navigate to the next question after submitting an answer", async () => {
    render(<QuizTestPage />);

    // Answer first question correctly
    fireEvent.click(screen.getByLabelText(/Paris/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());

    // Go to next question
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Check if the second question is rendered
    expect(screen.getByText(/Question 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Which planet is known as the Red Planet?/i)).toBeInTheDocument();
  });

  it("should display quiz completed screen and final score after all questions", async () => {
    render(<QuizTestPage />);

    // Answer all questions (4 questions in mock data)
    // Q1: Correct (Paris)
    fireEvent.click(screen.getByLabelText(/Paris/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q2: Correct (Mars)
    fireEvent.click(screen.getByLabelText(/Mars/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q3: Correct (Pacific Ocean)
    fireEvent.click(screen.getByLabelText(/Pacific Ocean/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q4: Correct (Leonardo da Vinci) - this will be the last question
    fireEvent.click(screen.getByLabelText(/Leonardo da Vinci/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());

    // Click Finish Quiz button
    fireEvent.click(screen.getByRole("button", { name: /Finish Quiz/i }));

    // Expect quiz completed screen
    await waitFor(() => {
      expect(screen.getByText(/Quiz Completed!/i)).toBeInTheDocument();
      expect(screen.getByText(/You scored 4 out of 4/i)).toBeInTheDocument();
    });
  });

  it("should reset the quiz when 'Retake Quiz' is clicked", async () => {
    render(<QuizTestPage />);

    // Complete the quiz
    // Q1
    fireEvent.click(screen.getByLabelText(/Paris/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q2
    fireEvent.click(screen.getByLabelText(/Mars/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q3
    fireEvent.click(screen.getByLabelText(/Pacific Ocean/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));

    // Q4
    fireEvent.click(screen.getByLabelText(/Leonardo da Vinci/i));
    fireEvent.click(screen.getByRole("button", { name: /Submit Answer/i }));
    await waitFor(() => expect(screen.getByText(/Correct!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Finish Quiz/i }));


    await waitFor(() => {
      expect(screen.getByText(/Quiz Completed!/i)).toBeInTheDocument();
    });

    // Click Retake Quiz
    fireEvent.click(screen.getByRole("button", { name: /Retake Quiz/i }));

    // Expect to be back at the first question
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 4/i)).toBeInTheDocument();
      expect(screen.getByText(/What is the capital of France?/i)).toBeInTheDocument();
      expect(screen.queryByText(/Quiz Completed!/i)).not.toBeInTheDocument();
    });
  });
});