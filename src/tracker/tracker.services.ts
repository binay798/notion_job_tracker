/* eslint-disable curly */
import { ChatCompletionMessageParam } from 'openai/resources';
import { openai } from '../config/deepseek.config';
import { HEADINGS } from '../config/global.constants';
import { notion } from '../config/notion.config';
import { DEFAULT_RESUME } from '../utils/getDefaultResume';
import { isEmpty } from 'lodash';
import { chunkByCharactersSafe, tools } from './tracker.utils';
import { JobApplicationProperties } from '../types/jobTracker.types';
import logger from '../utils/logger';

export const generateResumeService = async (dto: { page_id: string; properties: JobApplicationProperties }) => {
  // const data = await notion.pages.retrieve({ page_id: pageId });
  // // @ts-ignore
  // // const applicationStatus = data.properties[HEADINGS.applicationStatus].status.name;
  // // @ts-ignore
  // const isProcessed = data.properties[HEADINGS.processed].checkbox;
  // if (isProcessed) {
  //   logger.info('Already Processed');

  //   return;
  // }
  // // @ts-ignore
  // const jd = data.properties[HEADINGS.jobDescription].rich_text.map((el) => el.plain_text).join(' ');
  // // @ts-ignore
  // const companyName = data.properties[HEADINGS.company].title.map((el) => el.text.content);
  // // @ts-ignore
  // const role = data.properties[HEADINGS.roleTitle].rich_text.map((el) => el.plain_text);
  // logger.info('Processing');
  const jd = dto.properties['Job Description'].rich_text?.map((el) => el.plain_text).join(' ');
  const companyName = dto.properties.Company.title.map((el) => el.plain_text).join(' ');
  const role = dto.properties['Role Title'].rich_text.map((el) => el.plain_text).join(' ');
  logger.info('🔥 START GENERATING HTML');
  const { html, email, phone } = await generateResumeHtml(jd);
  if (isEmpty(html)) {
    // @ts-ignore
    await notion.pages.update({
      page_id: dto.page_id,
      // @ts-ignore
      properties: {
        // @ts-ignore
        ...dto.properties,
        [HEADINGS.jobDescription]: {
          rich_text: chunkByCharactersSafe(jd, 1500).map((el) => ({ text: { content: el } })),
        },
        [HEADINGS.resumeHtml]: {
          rich_text: [{ text: { content: 'Error generating html' } }],
        },
        [HEADINGS.processed]: {
          checkbox: false,
        },
        [HEADINGS.applicationStatus]: {
          status: { name: 'Applying' },
        },
      },
    });

    return;
  }
  logger.info('🔥 GENERATED HTML');
  logger.info('🔥 START GENERATING COVER LETTER');
  const coverLetter = await generateCoverLetter(html, jd, companyName, role);
  let contactInfo = '';
  if (email) {
    contactInfo = contactInfo + email;
  }
  if (phone) {
    contactInfo = contactInfo + ' ' + phone;
  }
  logger.info('🔥 GENERATED COVER LETTER');
  // @ts-ignore
  await notion.pages.update({
    page_id: dto.page_id,
    // properties: [{ [HEADINGS.resumeHtml]: { rich_text: [{ text: { content: html } }] } }],
    // @ts-ignore
    properties: {
      // @ts-ignore
      ...dto.properties,
      [HEADINGS.jobDescription]: {
        rich_text: chunkByCharactersSafe(jd, 1500).map((el) => ({ text: { content: el } })),
      },
      [HEADINGS.resumeHtml]: {
        rich_text: chunkByCharactersSafe(html, 1500).map((el) => ({ text: { content: el } })),
      },
      [HEADINGS.processed]: {
        checkbox: true,
      },
      [HEADINGS.inJobMailOrPhone]: {
        rich_text: [{ text: { content: contactInfo } }],
      },
      [HEADINGS.applicationStatus]: {
        status: { name: 'Generated' },
      },
      [HEADINGS.coverLetter]: {
        rich_text: chunkByCharactersSafe(coverLetter, 1500).map((el) => ({ text: { content: el } })),
      },
    },
  });
};

const generateResumeHtml = async (jobDescription: string) => {
  const currentResume = DEFAULT_RESUME;
  let extractedHtml = '';
  let contactInfo: { email: string; phone: string } = { email: '', phone: '' };

  const systemPrompt = `
  Act as an Expert Technical Recruiter and ATS Optimization Specialist.

  Your task is to rewrite and tailor the user's current resume to perfectly match the provided Job Description for a Software Engineer role. 

  Please adhere strictly to the following ATS guidelines and optimization strategies:

  1. Keyword Alignment: Analyze the provided job description and naturally integrate the core technical and soft-skill keywords into the  skills section, and experience bullets.
  2. Impact-Driven Bullets: Rewrite work experience using the "Action Verb + Task + Result/Metric" format. Specifically, highlight the candidate's 3+ years of experience in full-stack development, system architecture, and debugging critical issues.
  3. Technical Emphasis: Where applicable to the job description, emphasize established backend infrastructure expertise, including Go, Node.js, AWS, and high-performance databases (PostgreSQL, Redis, Cassandra).
  4. Education & Research: Ensure the Master of ICT (Research) from the Melbourne Institute of Technology, the capstone project on GitOps-based network automation, and the Bachelor's degree are formatted clearly and professionally.
  5. ATS Strict Formatting: Provide the output in a clean, single-column HTML format. Use standard section headers ( Skills, Professional Experience, Education, Projects) and avoid all tables, columns, or complex graphical elements.
  6. Font family must be "Times New Roman", Times, serif. My name and associated links should be text aligned centered. My name should be a little bigger.
  7. My name in header should be 35px and uppercase. 
  8. Output should be in html format and **don't change any styles of my current resume html**.
  9. Generate maximum of 3 distinct resume bullet points for Professional experience section using the Action + Context + Result (Metric) formula.
        Strict Rules:
          * Start every bullet with a strong past-tense action verb (e.g., Architected, Engineered, Optimized).
          * Do NOT use passive filler phrases like "Responsible for," "Tasked with," or "Worked on."
          * Naturally integrate the specific technologies used into the flow of the sentence.
          * Keep each bullet to a single, concise sentence (maximum two lines).
          * Make the points relevant to job description
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

const generateCoverLetter = async (resume: string, jobDescription: string, companyName: string, role: string) => {
  const systemPrompt = `

  You are an expert technical career coach and a professional software engineer. Your task is to write highly tailored, compelling cover letters based on the user's provided details and target job description.

  You must strictly adhere to the following structural guidelines and best practices:

  Structure & Tone:

  Keep it concise: Write exactly 4 short paragraphs. The total length must easily fit on one page.

  Tone: Professional, confident, and metric-driven. Do not make it read like a generic template. Avoid buzzword stuffing, but seamlessly mirror key terms from the job description.

  Content Requirements:

  Paragraph 1 (Hook and Role Fit): Draw the hiring manager in with a strong hook. State the exact position title, the company name, excitement for the role, and immediately mention a specific skill or recent experience that directly aligns with the core need in the job description.

  Paragraph 2 (Skill Proof and Impact): Showcase 1 or 2 of the user's most relevant real-world projects or experiences. Focus heavily on quantifiable impact (e.g., percentages, user growth, systems efficiency) and show how their technical work tied directly to business or user value.

  Paragraph 3 (Tools and Collaboration): Highlight the relevant technical stack (languages, frameworks, databases) that matches the job description. Also, highlight non-technical skills, specifically focusing on cross-functional teamwork, Agile collaboration, or leadership.

  Paragraph 4 (Why this Company & Confident Close): Explain exactly why the user is applying to this specific company (referencing their mission, products, or industry). Conclude with a confident call to action, mentioning excitement for next steps, and include placeholders for phone number, email, and portfolio/GitHub links.
  
  `;
  const userPrompt = `
  Please generate my software engineering cover letter based on the details below.
  My Details:
  Binay Shrestha
  458 Peats Ferry RD, Asquith 2077, Sydney, NSW
  0466330266
  
  Target Role: ${role}
  Key Projects & Measurable Impact: [Insert 1-2 projects, e.g., "Built a full-stack Node.js API that reduced data retrieval time by 40%"]
  Target Company Details:
  Company Name: ${companyName}
  Job Description:
  ${jobDescription}
  My Resume:
  ${resume}
  `;
  // @ts-ignore
  const response = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'deepseek-v4-flash',
    thinking: { type: 'enabled' },
    reasoning_effort: 'high',
    stream: false,
  });
  const text = response.choices[0].message.content ?? '';

  return text;
};

export const getAllToBeProcessedJob = async () => {
  logger.info('✅ INITIALIZATION');
  // const databaseId = '3830d70e-79c6-807b-836e-dbd90102fa37';
  const datasourceId = '3830d70e-79c6-809f-bbe3-000b38ac047d';
  const response = await notion.dataSources.query({
    data_source_id: datasourceId,
    page_size: 3,
    filter: { property: HEADINGS.processed, checkbox: { equals: false } },
  });
  logger.info('✅ GOT UNPROCESSED JOBS');
  // @ts-ignore
  const results = response?.results?.map((el) => ({ page_id: el.id, properties: el.properties }));
  if (isEmpty(results)) {
    logger.info('✅ NO RESULTS');

    return;
  }
  const promises = results.map((el, id) => {
    logger.info('✅ STARTED PROCESSING ', id + 1, ' JOB');

    return generateResumeService(el).catch((err) => logger.error(err));
  });
  await Promise.all(promises);
};

// getAllToBeProcessedJob();
