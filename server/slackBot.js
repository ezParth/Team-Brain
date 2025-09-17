import pkg from "@slack/bolt";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { App } = pkg;

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Listen to all messages
slackApp.event("message", async ({ event }) => {
  try {
    if (event.subtype === "bot_message") return;

    await axios.post(`${process.env.PATHWAY_URL}/ingest`, {
      text: event.text,
      user: event.user,
      ts: event.ts,
    });
  } catch (error) {
    console.error("Error ingesting message into Pathway:", error.message);
  }
});

// Custom command for queries
slackApp.command("/askbrain", async ({ command, ack, respond }) => {
  try {
    await ack();

    const response = await axios.post("http://localhost:5000/api/query", {
      question: command.text,
    });

    await respond(response.data.answer || "🤖 No answer found.");
  } catch (error) {
    console.error("Error querying AI:", error.message);
    await respond("⚠️ Something went wrong querying the Team Brain.");
  }
});

// 🔹 Start Slack App
(async () => {
  await slackApp.start(process.env.PORT || 3001);
  console.log("⚡ Slack bot running!");
})();
