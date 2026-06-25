import { mysqlTable, text, timestamp, json } from "drizzle-orm/mysql-core";

export const analysisRecords = mysqlTable("analysis_records", {
  id:         text("id").primaryKey(),
  pair:       text("pair").notNull(),
  timeframe:  text("timeframe").notNull(),
  date:       text("date").notNull(),
  indicators: json("indicators").notNull(),
  verdict:    json("verdict").notNull(),
  chartImage: text("chart_image"),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow(),
});

export type AnalysisRecordRow = typeof analysisRecords.$inferSelect;
export type NewAnalysisRecord = typeof analysisRecords.$inferInsert;
