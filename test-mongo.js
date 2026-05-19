require('dotenv').config({ path: './backend/ai-skill-gym/.env' });
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-skill-gym";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}

run().catch(console.error);