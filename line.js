import express from 'express';
import { middleware } from '@line/bot-sdk';

// Configuration
const config = {
  channelAccessToken:
    'h7MV7LzUVSbZx3AjzoplgBd01Ot1ZYMF97KTlMK4Uz5BB0dAzb7VTio1gdbD0axwP6Yd+/epWEquWPK5u3YRe4IjIX85hTck/uvv6K2O9jyz3vCDMRWCnPg3yqHmTMxtJ1V0+b2wzLtbZWpAV91lBgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '9ba029b0cda97ee17ad3ec9dc4cc8d2b',
};

// Set up Express app
const app = express();

// Webhook endpoint
app.post('/webhook', middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// Event handler
async function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    console.log(`User ID received: ${userId}`);
  }
}

// Start the server
const port = 3333;
app.listen(port, () => {
  console.log(`LINE bot is running on port ${port}`);
});
