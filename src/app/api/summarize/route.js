import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.length < 10) {
      return new Response('Text is too short or empty.', { status: 400 });
    }

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an elite academic assistant. Analyze the following lecture text meticulously. 
      Extract core definitions, mathematical formulas, critical conceptual frameworks, and high-impact lecture takeaways. 
      Structure your output flawlessly using Markdown headings (##, ###) and clear, short, highly scannable bullet points. 
      Eliminate all generic filler text and conversational greetings.`,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Summarize API Error:', error);
    return new Response(`Internal Server Error: ${error.message || error.toString()}`, { status: 500 });
  }
}
