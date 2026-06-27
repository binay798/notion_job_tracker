/* eslint-disable curly */
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources';
import { openai } from '../config/deepseek.config';
import { HEADINGS } from '../config/global.constants';
import { notion } from '../config/notion.config';
import { DEFAULT_RESUME } from '../utils/getDefaultResume';
import { isEmpty } from 'lodash';

export const generateResumeService = async (dto: { pageId: string; updatedProperties: string[]; type: string }) => {
  const pageId = dto.pageId;
  if (dto.type === 'page.properties_updated') {
    const data = await notion.pages.retrieve({ page_id: pageId });
    // @ts-ignore
    const applicationStatus = data.properties[HEADINGS.applicationStatus].status.name;
    // @ts-ignore
    const isProcessed = data.properties[HEADINGS.processed].checkbox;
    if (isProcessed && applicationStatus === 'Applied') {
      return;
    }
    // @ts-ignore
    const jd = data.properties[HEADINGS.jobDescription].rich_text.map((el) => el.plain_text).join(' ');

    const { html, email, phone } = await generateResumeHtml(jd);
    // @ts-ignore
    await notion.pages.update({
      page_id: pageId,
      // properties: [{ [HEADINGS.resumeHtml]: { rich_text: [{ text: { content: html } }] } }],
      properties: {
        // @ts-ignore
        ...data.properties,
        [HEADINGS.resumeHtml]: {
          rich_text: chunkByCharactersSafe(html, 1500).map((el) => ({ text: { content: el } })),
        },
        [HEADINGS.processed]: {
          checkbox: true,
        },
        [HEADINGS.inJobMailOrPhone]: {
          rich_text: [{ text: { content: `${email ?? ''} ${phone ?? ''}` } }],
        },
        [HEADINGS.applicationStatus]: {
          status: { name: 'Applied' },
        },
      },
    });
  }
};

const generateResumeHtml = async (jobDescription: string) => {
  const currentResume = DEFAULT_RESUME;
  let extractedHtml = '';
  let contactInfo: { email: string; phone: string } = { email: '', phone: '' };

  const systemPrompt = `
  Act as an Expert Technical Recruiter and ATS Optimization Specialist.

  Your task is to rewrite and tailor the user's current resume to perfectly match the provided Job Description for a Software Engineer role. 

  Please adhere strictly to the following ATS guidelines and optimization strategies:

  1. Keyword Alignment: Analyze the provided job description and naturally integrate the core technical and soft-skill keywords into the professional summary, skills section, and experience bullets.
  2. Impact-Driven Bullets: Rewrite work experience using the "Action Verb + Task + Result/Metric" format. Specifically, highlight the candidate's 3+ years of experience in full-stack development, system architecture, and debugging critical issues.
  3. Technical Emphasis: Where applicable to the job description, emphasize established backend infrastructure expertise, including Go, Node.js, AWS, and high-performance databases (PostgreSQL, Redis, Cassandra).
  4. Education & Research: Ensure the Master of ICT (Research) from the Melbourne Institute of Technology, the capstone project on GitOps-based network automation, and the Bachelor's degree are formatted clearly and professionally.
  5. ATS Strict Formatting: Provide the output in a clean, single-column HTML format. Use standard section headers (Professional Summary, Skills, Professional Experience, Education, Projects) and avoid all tables, columns, or complex graphical elements.
  6. Font family must be "Times New Roman", Times, serif. My name and associated links should be text aligned centered. My name should be a little bigger.
  `;
  const userPrompt = `
  Here is my current resume and the target job description I am applying for. Please rewrite my resume based on your system instructions.

  My Current Resume:
  ${currentResume}

  Target Job Description:
  ${jobDescription}
  `;
  // @ts-ignore
  const response = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'deepseek-v4-flash',
    thinking: { type: 'enabled' },
    reasoning_effort: 'low',
    stream: false,
    tools: tools,
    // tool_choice: { type: 'function', function: { name: 'extract_contact_info' } },
  });
  const message = response.choices[0].message;
  const toolCalls = response.choices[0].message.tool_calls;
  if (isEmpty(toolCalls)) {
    const text = response.choices[0].message.content ?? '';
    const pattern = /(<!DOCTYPE html>[\s\S]*?<\/html>|<html[\s\S]*?<\/html>)/i;

    const match = text.match(pattern);

    if (match) {
      extractedHtml = match[0];
    }
  } else {
    if (toolCalls) {
      const toolCall = toolCalls[0];
      // @ts-ignore
      const argumentsJson = JSON.parse(toolCall.function.arguments) as { email: string; phone: string };
      contactInfo = argumentsJson;

      const followUpMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
        message, // The exact assistant message object containing the tool_calls
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          // @ts-ignore
          name: toolCall.function.name,
          // @ts-ignore
          content: JSON.stringify(toolCall.function), // The result of your local function
        },
      ];
      const finalResponse = await openai.chat.completions.create({
        model: 'deepseek-v4-flash',
        messages: followUpMessages,
        // No need to pass tools again if you just want the final text
      });
      const text = finalResponse.choices[0].message.content ?? '';
      const pattern = /(<!DOCTYPE html>[\s\S]*?<\/html>|<html[\s\S]*?<\/html>)/i;

      const match = text.match(pattern);

      if (match) {
        extractedHtml = match[0];
      }
    }
  }

  return { html: extractedHtml, ...contactInfo };
};

function chunkByCharactersSafe(text: string, maxChars = 100) {
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

const tools: ChatCompletionTool[] = [
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
            description: 'The contact email address found in the text. Return null if not found.',
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
