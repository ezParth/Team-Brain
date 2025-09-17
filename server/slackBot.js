import { App } from "@slack/bolt";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Listen to all messages
slackApp.event("message", async ({ event }) => {
  if (event.subtype === "bot_message") return; // ignore bot messages

  await axios.post(`${process.env.PATHWAY_URL}/ingest`, {
    text: event.text,
    user: event.user,
    ts: event.ts,
  });
});

// Custom command for queries
slackApp.command("/askbrain", async ({ command, ack, respond }) => {
  await ack();
  const response = await axios.post("http://localhost:5000/api/query", {
    question: command.text,
  });
  await respond(response.data.answer);
});

(async () => {
  await slackApp.start();
  console.log("⚡ Slack bot running!");
})();
