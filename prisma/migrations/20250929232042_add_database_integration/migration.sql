/*
  Warnings:

  - You are about to drop the column `logEntryId` on the `anomalies` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `log_entries` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anomalies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_anomalies" ("id", "ip", "reason", "severity", "timestamp") SELECT "id", "ip", "reason", "severity", "timestamp" FROM "anomalies";
DROP TABLE "anomalies";
ALTER TABLE "new_anomalies" RENAME TO "anomalies";
CREATE TABLE "new_log_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_log_entries" ("event", "id", "ip", "source", "timestamp", "user") SELECT "event", "id", "ip", "source", "timestamp", "user" FROM "log_entries";
DROP TABLE "log_entries";
ALTER TABLE "new_log_entries" RENAME TO "log_entries";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
