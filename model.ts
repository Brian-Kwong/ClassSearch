/*
The following node script generates a basic model to fetch and vectorize icon metadata from Iconify's API
*/

import { pipeline } from "@huggingface/transformers";
import lancedb from "@lancedb/lancedb";

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

async function makeEmbeddings() {
  const iconData = await fetchIconMetadata();
  const model = await pipeline(
    "feature-extraction",
    "sentence-transformers/all-MiniLM-L6-v2",
  );
  const texts = iconData.map((icon) => `${icon.name} ${icon.aliases}`);
  const embeddings = await Promise.all(
    texts.map((text) => model(text, { pooling: "mean", normalize: true })),
  );
  const mappedEmbeddings = iconData.map((icon, idx) => ({
    ...icon,
    text: `${icon.name} ${icon.aliases}`,
    // eslint-disable-next-line security/detect-object-injection
    vector: Array.from(embeddings[idx].data),
  }));
  return mappedEmbeddings;
}

async function createVectorDB(_dbPath: string = "data/local-db") {
  const mappedEmbeddings = await makeEmbeddings();
  const db = await lancedb.connect(_dbPath);
  const existingTables = await db.tableNames();
  if (existingTables.includes("icons")) {
    await db.dropTable("icons");
  }
  await db.createTable("icons", mappedEmbeddings);
  console.log("Vector database created with icons table.");
}

// Only run if this file is executed directly
if (
  import.meta.url === process.argv[1] ||
  import.meta.url === `file://${process.argv[1]}`
) {
  await createVectorDB("data/local-db");
}

export default createVectorDB;
