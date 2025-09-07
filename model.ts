/*
The following node script generates a basic model to fetch and vectorize icon metadata from Iconify's API
*/

import { pipeline } from "@huggingface/transformers";
import lancedb from "vectordb";

async function fetchIconMetadata() {
  const metadata: Record<string, { name: string; aliases: string }[]> = {
  const iconSets = ["ic"]; // Feel free to add any icon set yoy would like
  for (const set of iconSets) {
    if (typeof set === "string" && iconSets.includes(set)) {
      const response = await fetch(
        `https://api.iconify.design/collection?prefix=${set}&info`,
      );
      const data = await response.json();
      if (data) {
        switch (set) {
          case "mdi":
            metadata["mdi"] = (data.uncategorized || [])
              .concat(Object.values(data.categories).flat() || [])
              .map((icon: string) => ({ name: icon, aliases: "" }))
              .concat(
                data.aliases
                  ? Object.entries(data.aliases).map(([alias, name]) => ({
                      name,
                      aliases: alias as string,
                    }))
                  : [],
              );
            break;
          case "fa6-solid":
            metadata["fa6-solid"] = (data.uncategorized || [])
              .concat(Object.values(data.categories).flat() || [])
              .map((icon: string) => ({ name: icon, aliases: "" }))
              .concat(
                data.aliases
                  ? Object.entries(data.aliases).map(([alias, name]) => ({
                      name,
                      aliases: alias as string,
                    }))
                  : [],
              );
            break;
          case "ph":
            metadata["ph"] = (data.uncategorized || [])
              .concat(Object.values(data.categories).flat() || [])
              .map((icon: string) => ({ name: icon, aliases: "" }))
              .concat(
                data.aliases
                  ? Object.entries(data.aliases).map(([alias, name]) => ({
                      name,
                      aliases: alias as string,
                    }))
                  : [],
              );
            break;
          case "lucide":
            metadata["lucide"] = (data.uncategorized || [])
              .concat(Object.values(data.categories).flat() || [])
              .map((icon: string) => ({ name: icon, aliases: "" }))
              .concat(
                data.aliases
                  ? Object.entries(data.aliases).map(([alias, name]) => ({
                      name,
                      aliases: alias as string,
                    }))
                  : [],
              );
            break;
          case "ic":
            metadata["ic"] = (data.uncategorized || [])
              .concat(Object.values(data.categories).flat() || [])
              .map((icon: string) => ({ name: icon, aliases: "" }))
              .concat(
                data.aliases
                  ? Object.entries(data.aliases).map(([alias, name]) => ({
                      name,
                      aliases: alias as string,
                    }))
                  : [],
              );
            break;
          default:
            break;
        }
      }
    }
  }
  const iconSet = Object.entries(metadata).flatMap(([lib, icons]) =>
    icons.map(({ name, aliases }) => ({
      lib,
      name: name.toLowerCase(),
      aliases: aliases.toLowerCase(),
      text: `${name} ${aliases}`.toLowerCase(),
    })),
  );
  return iconSet;
}


const embeddingFunction = {
  sourceColumn: "text",
  embed: async (courses: string[]) => {
    const model = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2",
    );
    const results: number[][] = [];
    for (const course of courses) {
      const embedding = await model(course, { pooling: "mean", normalize: true });
      results.push(Array.from(embedding.data));
    }
    return results;
  },
}


async function createVectorDB(dbUrl = "data/local-db") {
  const iconData = await fetchIconMetadata();
  const db = await lancedb.connect(dbUrl);
  // Check if the icon table already exists If so drop it
  const existingTables = await db.tableNames();
  if (existingTables.includes("icons")) {
    await db.dropTable("icons");
  }
  await db.createTable("icons", iconData, embeddingFunction);
  console.info("Vector DB created and populated with icon metadata.");
}

// Only run if this file is executed directly
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  await createVectorDB("dist-electron/data/local-db");
}

export default createVectorDB;
