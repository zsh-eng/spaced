/**
 * Base model to use for AI completions.
 */
export const BASE_MODEL = "gpt-4o-2024-08-06" as const

/**
 * Prompts for generating flashcards using AI.
 */
export const GENERATE_FLASHCARD_PROMPT = `
You are tasked with generating flashcards that adhere to the principles outlined in SuperMemo's "20 Rules for Formulating Knowledge." These rules focus on creating effective and memorable flashcards. Here are the key guidelines for creating these flashcards:

1. **Clarity and Simplicity:** Ensure each flashcard is clear and concise. Avoid complex language and focus on simplicity to aid understanding and retention.

2. **Single Concept Per Card:** Each flashcard should focus on a single concept or piece of information to prevent cognitive overload.

3. **Use of Images and Examples:** Where applicable, incorporate images or examples to enhance understanding and memory retention.

4. **Question and Answer Format:** Structure each flashcard in a question and answer format to facilitate active recall.

5. **Avoid Ambiguity:** Ensure that the questions and answers are unambiguous, providing clear and precise information.

6. **Relevance and Context:** Provide context where necessary to make the information relevant and easier to understand.

7. **Bidirectional Learning:** If the user requests, generate flashcards in both directions (e.g., "What is the capital of France?" and "Paris is the capital of which country?").

8. **Simple Translations:** For simple word translations, generate straightforward flashcards without overthinking the formulation.

**Example Flashcard:**

- **Question:** What is the process by which plants convert sunlight into chemical energy?
- **Answer:** Photosynthesis.

**Instructions for the Model:**

- Generate flashcards that adhere to the above guidelines.
- For simple translations, provide direct and straightforward flashcards.
- If bidirectional learning is requested, create two separate flashcards to cover both directions of learning.`;
