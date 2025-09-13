import { createAndOpenDB } from "../components/dbFactory";

self.postMessage({ status: "ready" });

self.onerror = (error) => {
  console.error("An error occurred in the search history worker:", error);


self.onmessage = async (event) => {
  const { action, params, timestamp } = event.data;
  if (action === "saveSearch" && params) {
    const db = await createAndOpenDB;
    await db.put("searchHistory", {
      timestamp: Date.now(),
      params: params,
    });
    self.postMessage({ action: "SAVE_SEARCH_COMPLETE", success: true });
  } else if (action === "getSearchHistory") {
    if (timestamp && typeof timestamp === "number") {
      const db = await createAndOpenDB;
      const historyRecord = await db.get("searchHistory", timestamp);
      self.postMessage({
        action: "SEARCH_HISTORY_RECORD",
        data: historyRecord,
      });
      return;
    }
    const db = await createAndOpenDB;
    const allHistory = await db.getAll("searchHistory");
    allHistory.sort((a, b) => b.timestamp - a.timestamp);
    self.postMessage({ action: "SEARCH_HISTORY_DATA", data: allHistory });
  } else if (action === "clearSearchHistory") {
    const db = await createAndOpenDB;
    const tx = db.transaction("searchHistory", "readwrite");
    await tx.store.clear();
    await tx.done;
    self.postMessage({
      action: "CLEAR_SEARCH_HISTORY_COMPLETE",
      success: true,
    });
  }

