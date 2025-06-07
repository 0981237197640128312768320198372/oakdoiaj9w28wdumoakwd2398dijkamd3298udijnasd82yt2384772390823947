export const OWNER_ID = 'U29bcda65594a6b00e4215cf03bef3351';

export async function notifyLineMessage(userId: string, message: string) {
  try {
    const response = await fetch(`/api/v3/line/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send LINE notification:', errorData);
    }
  } catch (error) {
    console.error('Error sending LINE notification:', error);
  }
}
