import { Client } from "@notionhq/client";
import cron from "node-cron";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Replace with your real database IDs
const MASTER_DB = "27185bb9f77081398313d328407e8ffa";
const CLIENT_DBS = {
  "Duck & Waffle": "27185bb9f77081b7ac51ca6098f9fefc"
  //,"Belleza Villa": "client-db-id-2"
};

async function syncClients() {
  console.log("Running Notion sync job...");

  const master = await notion.databases.query({
    database_id: MASTER_DB,
  });

  for (const page of master.results) {
    const client = page.properties.Client.select?.name;
    const clientDB = CLIENT_DBS[client];
    if (!clientDB) continue;

    const title = page.properties.Name.title[0]?.plain_text || "Untitled";
    const date = page.properties.Date.date?.start;

    await notion.pages.create({
      parent: { database_id: clientDB },
      properties: {
        Name: { title: [{ text: { content: title } }] },
        Date: { date: { start: date } },
      },
    });
    console.log(`Synced: ${title} → ${client}`);
  }
}

cron.schedule("*/30 * * * *", syncClients);
syncClients(); // run immediately once
