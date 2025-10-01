-- AlterTable
ALTER TABLE "log_entries" ADD COLUMN "eventType" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anomalies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logEntryId" INTEGER,
    CONSTRAINT "anomalies_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_anomalies" ("id", "ip", "reason", "severity", "timestamp") SELECT "id", "ip", "reason", "severity", "timestamp" FROM "anomalies";
DROP TABLE "anomalies";
ALTER TABLE "new_anomalies" RENAME TO "anomalies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
