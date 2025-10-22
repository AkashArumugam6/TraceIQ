-- AlterTable
ALTER TABLE "anomalies" ADD COLUMN "aiExplanation" TEXT;
ALTER TABLE "anomalies" ADD COLUMN "confidenceScore" REAL;
ALTER TABLE "anomalies" ADD COLUMN "detectionSource" TEXT;
ALTER TABLE "anomalies" ADD COLUMN "recommendedAction" TEXT;
