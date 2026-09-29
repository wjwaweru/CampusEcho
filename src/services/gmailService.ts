import { getAccessToken } from './googleAuth';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  isUnread: boolean;
  labels: string[];
}

// Fallback sample campus emails when user hasn't signed into Gmail yet
export const SAMPLE_CAMPUS_EMAILS: GmailMessage[] = [
  {
    id: 'sample-1',
    threadId: 'th-1',
    subject: 'Urgent: Revision to Science Complex Lab 3 Timetable Allocation',
    from: 'Academic Registrar <registrar.academic@must.ac.ke>',
    to: 'Brian Mwangi <brian.mwangi@student.must.ac.ke>',
    date: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    snippet:
      'Dear Comrade, please be advised that the double-booking between BCS 3101 and BBIT 2204 in Lab 3 on Monday is currently under review by the timetable committee...',
    body: `Dear Comrade Brian Mwangi,

Please be advised that the timetable overlap reported in Science Complex Lab 3 for Monday morning (10:00 AM - 1:00 PM) has been flagged by CampusEcho's collision detection system.

The Academic Timetable Committee is meeting this afternoon to reassign BBIT 2204 to Computing Block Lab 2 so that both practical sessions can proceed without disruption.

Please check your CampusEcho timetable dashboard for the finalized room allocation.

Sincerely,
Dr. Jane Kariuki
Academic Registrar & Timetable Coordinator
Meru University of Science & Technology`,
    isUnread: true,
    labels: ['INBOX', 'IMPORTANT', 'UNREAD'],
  },
  {
    id: 'sample-2',
    threadId: 'th-2',
    subject: 'Confirmation: End of Semester Examination Timetable Published',
    from: 'Directorate of Examinations <exams@must.ac.ke>',
    to: 'All Students <comrades@must.ac.ke>',
    date: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    snippet:
      'The draft examination schedule for Semester 1 of the 2026/2027 Academic Year is now accessible on CampusEcho and the student portal...',
    body: `Notice to all MUST Comrades,

The draft examination schedule for Semester 1 (2026/2027 Academic Year) has been officially released.

Key Dates:
- Revision Week: Starting 12th October 2026
- Examinations Commencement: 19th October 2026

Please verify your course units and notify the examination officer of any course code clashes immediately.

Directorate of Examinations
Meru University of Science & Technology`,
    isUnread: false,
    labels: ['INBOX'],
  },
  {
    id: 'sample-3',
    threadId: 'th-3',
    subject: 'GDSC MUST Chapter: Cloud & AI Hackathon Invitations',
    from: 'GDSC Lead <gdsc@must.ac.ke>',
    to: 'Brian Mwangi <brian.mwangi@student.must.ac.ke>',
    date: new Date(Date.now() - 3600 * 1000 * 40).toISOString(),
    snippet:
      'Join us this Saturday in the Innovation Wing for the Annual Google Developer Student Clubs Hackathon. Swag packs and cloud credits guaranteed...',
    body: `Hey Comrade Brian,

The Google Developer Student Clubs (GDSC) MUST chapter invites you to our flagship Cloud Study Jam & Hackathon this weekend.

Venue: Innovation Wing - Lab 5
Time: 9:00 AM - 4:00 PM

Bring your laptop and teammate. Refreshments will be provided.

Best regards,
GDSC Lead, MUST Chapter`,
    isUnread: false,
    labels: ['INBOX'],
  },
];

// Helper to decode Base64 / URL-safe Base64
function decodeBase64(str: string): string {
  try {
    const clean = str.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(clean);
    return decodeURIComponent(
      Array.prototype.map
        .call(decoded, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return str;
    }
  }
}

// Parse message details from Gmail API format
function parseGmailPayload(msgData: any): GmailMessage {
  const headers = msgData.payload?.headers || [];
  const getHeader = (name: string) => {
    const h = headers.find((header: any) => header.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || 'Unknown Sender';
  const to = getHeader('To') || '';
  const dateStr = getHeader('Date') || msgData.internalDate;
  const isUnread = (msgData.labelIds || []).includes('UNREAD');

  let body = '';
  if (msgData.payload?.parts && msgData.payload.parts.length > 0) {
    const textPart = msgData.payload.parts.find(
      (p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
    );
    if (textPart?.body?.data) {
      body = decodeBase64(textPart.body.data);
    } else {
      body = msgData.snippet || '';
    }
  } else if (msgData.payload?.body?.data) {
    body = decodeBase64(msgData.payload.body.data);
  } else {
    body = msgData.snippet || '';
  }

  // Strip raw HTML tags for clean display if text/html
  if (body.includes('<') && body.includes('>')) {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    body = doc.body.textContent || body;
  }

  return {
    id: msgData.id,
    threadId: msgData.threadId,
    subject,
    from,
    to,
    date: dateStr,
    snippet: msgData.snippet || '',
    body: body.trim(),
    isUnread,
    labels: msgData.labelIds || [],
  };
}

export const gmailService = {
  // List messages from user's live Gmail inbox
  async listMessages(query: string = '', maxResults: number = 20): Promise<GmailMessage[]> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google. Please sign in with Google to view live emails.');
    }

    const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${qParam}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gmail API Error (${res.status})`);
    }

    const listData = await res.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Fetch details for each message concurrently (up to 20)
    const detailPromises = listData.messages.map(async (m: { id: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          return parseGmailPayload(detailData);
        }
        return null;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(detailPromises);
    return results.filter((item): item is GmailMessage => item !== null);
  },

  // Send email via Gmail API
  async sendEmail(params: { to: string; subject: string; body: string; threadId?: string }): Promise<any> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google. Please sign in with Google first.');
    }

    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
    const messageParts = [
      `To: ${params.to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      params.body,
    ];
    const rawMessage = messageParts.join('\r\n');

    // URL-safe Base64 encode
    const base64Encoded = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const payload: any = { raw: base64Encoded };
    if (params.threadId) {
      payload.threadId = params.threadId;
    }

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send email (${res.status})`);
    }

    return await res.json();
  },

  // Trash message (Destructive: requires user confirmation before calling)
  async trashMessage(id: string): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to move message to trash');
    }

    return true;
  },

  // Mark message as read
  async markAsRead(id: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) return;

    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        removeLabelIds: ['UNREAD'],
      }),
    });
  },

  // Mark message as unread
  async markAsUnread(id: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) return;

    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds: ['UNREAD'],
      }),
    });
  },
};
