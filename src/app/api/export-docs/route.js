import { google } from 'googleapis';

export async function POST(req) {
  try {
    const { content, accessToken } = await req.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Missing access token' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!content) {
      return new Response(JSON.stringify({ error: 'Missing content' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const docs = google.docs({ version: 'v1', auth });

    // 1. Create a blank document
    const createRes = await docs.documents.create({
      requestBody: {
        title: 'Lecture Key Notes Study Guide',
      },
    });

    const documentId = createRes.data.documentId;

    // 2. Insert the summary content
    // Note: This is a simple insertion. For complex markdown to Google Docs formatting, 
    // more complex batchUpdate requests would be needed.
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      documentId, 
      url: `https://docs.google.com/document/d/${documentId}/edit` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Google Docs Export Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to export to Google Docs' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
