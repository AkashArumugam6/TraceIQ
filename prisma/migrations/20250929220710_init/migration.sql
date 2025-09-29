-- CreateTable
CREATE TABLE "log_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "anomalies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
