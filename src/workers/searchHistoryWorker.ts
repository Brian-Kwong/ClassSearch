import { createAndOpenDB } from "../components/dbFactory";

self.postMessage({ status: "ready" });

self.onerror = (error) => {
  console.error("An error occurred in the search history worker:", error);
};

const db = createAndOpenDB;

self.onmessage = async (event) => {
  const { action, params, timestamp, maxNumberOfEntries } = event.data;
  if (action === "saveSearch" && params) {
    db.add("searchHistory", {
      timestamp: Date.now(),
      params,
    });

    // If over the maximum number of records, delete the oldest
    if (maxNumberOfEntries && typeof maxNumberOfEntries === "number") {
      const allHistory = await db.getAll("searchHistory");
      const tx = db.transaction("searchHistory", "readwrite");
      if (allHistory.length > maxNumberOfEntries) {
        allHistory.sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first
        const recordsToDelete = allHistory.slice(
          0,
          allHistory.length - maxNumberOfEntries,
        );
        for (const record of recordsToDelete) {
          await tx.store.delete(record.timestamp);
        }
        await tx.done;
      }
    }

    self.postMessage({ action: "SAVE_SEARCH_COMPLETE", success: true });
    return;
  } else if (action === "getSearchHistory") {
    if (timestamp && typeof timestamp === "number") {
      const historyRecord = await db.get("searchHistory", timestamp);
      self.postMessage({
        action: "SEARCH_HISTORY_RECORD",
        data: historyRecord,
      });
      return;
    }
    const allHistory = await db.getAll("searchHistory");
    allHistory.sort((a, b) => b.timestamp - a.timestamp);
    self.postMessage({ action: "SEARCH_HISTORY_DATA", data: allHistory });
  } else if (action === "clearSearchHistory") {
    const tx = db.transaction("searchHistory", "readwrite");
    await tx.store.clear();
    await tx.done;
    self.postMessage({
      action: "CLEAR_SEARCH_HISTORY_COMPLETE",
      success: true,
    });
  }
};
