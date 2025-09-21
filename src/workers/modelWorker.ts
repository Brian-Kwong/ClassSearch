import { parentPort, workerData } from "worker_threads";
import {
  FeatureExtractionPipeline,
  pipeline,
  env,
} from "@huggingface/transformers";
import lancedb from "@lancedb/lancedb";
import path from "path";
import { iconModelDBEntry } from "../components/types.js";
import createVectorDB from "../../model.js";

let searchPipeline: FeatureExtractionPipeline | null = null;
let lookupTable: lancedb.Table | null = null;
const userDataPath = workerData.userDataPath;
const dbPath = workerData.dbPath;

if (parentPort) {
  parentPort.on("message", async (message) => {
    if (message.type === "loadModel") {
      if (searchPipeline && lookupTable) {
        parentPort?.postMessage({ type: "modelLoaded" });
      } else {
        // Env dent carry over to worker threads so we need to reset it here
        env.allowRemoteModels = true;
        env.cacheDir = path.join(userDataPath, "model-cache");
        // Complex type to infer especially known issue with transformers.js
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        searchPipeline = (await pipeline(
          "feature-extraction",
          "sentence-transformers/all-MiniLM-L6-v2",
        )) as FeatureExtractionPipeline;
        try {
          const db = await lancedb.connect(dbPath);
          lookupTable = await db.openTable("icons");
        } catch (err) {
          console.warn(
            "Error opening lookup table: Recreating table ....",
            err,
          );
          await createVectorDB(path.join(dbPath));
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
            .vectorSearch(Array.from(embeddings.data))
            .limit(1)
            .toArray();
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
