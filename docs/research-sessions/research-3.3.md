# ADR-XXX: Choice of PDF Parsing and Text Extraction Solution

## Status

Accepted

## Context

The "AI Study Buddy" project requires robust PDF parsing and text extraction capabilities to process study materials (text/PDF) and prepare them for AI model input. Key functional requirements include 95% text extraction accuracy, preservation of paragraph structure, correct interpretation of multi-column documents and tables, and output in plain text, structured JSON, and Markdown. Non-functional requirements include processing a 10-20 page PDF in under 10 seconds and handling batch uploads efficiently.

The project is a small-scale prototype for 4-5 users, with critical constraints of no budget, low backend skills, and a 4-week timeline, deployed on a Next.js/Vercel stack.

## Decision Drivers

The decision was driven by the following priorities and requirements:

*   **High Priority:** Performance (under 10s for 10-20 pages), Cost efficiency (free for prototype), Developer productivity (ease of implementation).
*   **Functional:** Accurate text extraction, layout preservation (multi-column, tables), cleaning/normalization.
*   **Constraints:** No budget, low backend skills, Vercel deployment.

## Considered Options

1.  **`pdf2json` (Node.js Library):**
    *   **Pros:** Free, provides detailed JSON output for custom parsing.
    *   **Cons:** High development effort for post-processing, potential Vercel compatibility issues, complex JSON output for direct LLM input.
2.  **`pdf-parse` (Node.js Library):**
    *   **Pros:** Free, simpler to use, better Vercel compatibility.
    *   **Cons:** Significant layout loss, less accurate for complex documents.
3.  **Cloud-based AI Service (e.g., Google Cloud Vision AI, AWS Textract):**
    *   **Pros:** Managed service, high accuracy, built-in OCR, simple API, free for prototype usage, high developer productivity.
    *   **Cons:** Vendor lock-in, potential costs at scale, network latency.

## Decision

We will use a **Cloud-based AI Service** (e.g., Google Cloud Vision AI or AWS Textract) for PDF parsing and text extraction. This decision prioritizes developer productivity and high-quality results for the prototype, leveraging the free tiers of these services.

## Consequences

**Positive:**

*   **High Developer Productivity:** Significantly reduces development time and complexity for PDF processing, allowing the team to focus on core AI Study Buddy features.
*   **Superior Accuracy & Features:** Best-in-class text extraction, robust layout preservation (multi-column, tables), and built-in OCR capabilities for scanned documents.
*   **Cost-Effective for Prototype:** The generous free tiers of these services will cover the usage for the prototype phase, aligning with the "no budget" constraint.
*   **Simplified Deployment:** As an external API, it avoids library-specific compatibility issues with the Vercel serverless environment.
*   **Optimal AI Input:** Provides clean, structured output that is ideal for preprocessing before feeding into AI models.

**Negative:**

*   **Vendor Lock-in:** Introduces a dependency on a specific cloud provider.
*   **Cost at Scale:** While free for the prototype, production usage beyond free tier limits would incur costs.
*   **Network Latency:** Introduces an external API call.

**Neutral:**

*   The choice does not preclude future integration of other PDF processing methods or libraries if project requirements or scale change significantly.

## Implementation Notes

*   **Provider Selection:** Choose a specific cloud provider (e.g., Google Cloud Vision AI or AWS Textract) based on existing team familiarity or other project integrations.
*   **Cloud Project Setup:** Set up a project in the chosen cloud environment, enable the relevant API (e.g., Vision AI API), and configure API credentials (e.g., a service account key).
*   **Vercel Serverless Function:** Develop a Vercel serverless function that will:
    *   Receive PDF content (e.g., as a base64 encoded string or a URL to a cloud storage object).
    *   Call the selected Cloud AI service API to process the PDF.
    *   Parse the API response to extract text and structural information.
    *   Return the processed data in the required plain text, structured JSON, and Markdown formats.
*   **Frontend Integration:** Integrate this serverless function with the Next.js frontend for PDF uploads and display of extracted content.

## References

*   [Google Cloud Vision AI Documentation](https://cloud.google.com/vision/docs) (or equivalent for AWS Textract)
*   [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions/overview)
