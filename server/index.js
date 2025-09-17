import express from "express";
import { App } from "@slack/bolt";
import axios from "axios";

const app = express();

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

slackApp.event("message", async ({ event }) => {
  // Send Slack message to Pathway for ingestion
  await axios.post("http://localhost:8000/ingest", {
    text: event.text,
    user: event.user,
    ts: event.ts,
  });
});

(async () => {
  await slackApp.start();
  console.log("⚡ Slack bot running!");
})();
