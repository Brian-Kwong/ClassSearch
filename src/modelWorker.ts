import { parentPort } from "worker_threads";
import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import lancedb from "vectordb";
import path from "path";
import { fileURLToPath } from "url";
import { iconModelDBEntry } from "./components/types";
import createVectorDB from "../model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let searchPipeline: FeatureExtractionPipeline | null = null;
let lookupTable: lancedb.Table | null = null;

if (parentPort) {
  parentPort.on("message", async (message) => {
    if (message.type === "loadModel") {
      if (searchPipeline && lookupTable) {
        parentPort?.postMessage({ type: "modelLoaded" });
      } else {
        // Complex type to infer especially known issue with transformers.js
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        searchPipeline = (await pipeline(
          "feature-extraction",
          "sentence-transformers/all-MiniLM-L6-v2",
        )) as FeatureExtractionPipeline;
        const dbPath = path.join(__dirname, "..", "data", "local-db");
        try {
          const db = await lancedb.connect(dbPath);
          lookupTable = await db.openTable("icons");
        } catch {
          console.warn("Error opening lookup table: Recreating table ....");
          await createVectorDB();
          const db = await lancedb.connect(dbPath);
          lookupTable = await db.openTable("icons");
        }
        parentPort?.postMessage({ type: "modelLoaded" });
      }
    } else if (
      message.type === "semanticSearch" &&
      searchPipeline &&
      lookupTable
    ) {
      const courses: { subject_descr: string }[] = message.courses;
      const searchResults: { lib: string; name: string }[] = [];
      for (const course of courses) {
        const embeddings = await searchPipeline(course.subject_descr, {
          pooling: "mean",
          normalize: true,
        });
        if (
          !embeddings ||
          (Array.isArray(embeddings) && embeddings.length === 0)
        ) {
          searchResults.push({ lib: "mdi", name: "book" });
          continue;
        } else {
          const results = await lookupTable
            .search(Array.from(embeddings.data))
            .limit(1)
            .execute();
          if (results.length > 0) {
            // Casts to the model database type Look in `./model.ts` for the schema
            const topResult = results[0] as iconModelDBEntry;
            searchResults.push({ lib: topResult.lib, name: topResult.name });
          } else {
            searchResults.push({ lib: "mdi", name: "book" });
          }
        }
      }
      parentPort?.postMessage({
        type: "semanticSearchResults",
        results: searchResults,
      });
    }
  });
}
