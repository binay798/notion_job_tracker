/* eslint-disable curly */
import { ChatCompletionTool } from 'openai/resources';

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'extract_contact_info',
      description: 'Extracts the contact email and phone number from a job description.',
      strict: true, // Enables DeepSeek's Strict Mode for exact schema matching
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: ['string', 'null'],
            description: 'The contact email address found in the text except my own email. Return null if not found.',
          },
          phone: {
            type: ['string', 'null'],
            description: 'The contact phone number found in the text. Return null if not found.',
          },
        },
        required: ['email', 'phone'],
        additionalProperties: false, // Required when using strict: true
      },
    },
  },
];

export function chunkByCharactersSafe(text: string, maxChars = 100) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const chunks = [];
  let currentChunk = '';
  const words = text.split(' ');

  for (const word of words) {
    // If a single word is somehow longer than the max limit, split the word itself
    if (word.length > maxChars) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());

      const giantWordChunks = word.match(new RegExp(`.{1,${maxChars}}`, 'g'));
      if (giantWordChunks) {
        chunks.push(...giantWordChunks.slice(0, -1));
        currentChunk = giantWordChunks[giantWordChunks.length - 1] + ' ';
        continue;
      }
    }

    // Check if adding the next word exceeds the character limit
    if ((currentChunk + word).length > maxChars) {
      chunks.push(currentChunk.trim()); // Save the current chunk
      currentChunk = word + ' '; // Start a new chunk with the current word
    } else {
      currentChunk += word + ' '; // Keep adding to the current chunk
    }
  }

  // Push any remaining text in the final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
