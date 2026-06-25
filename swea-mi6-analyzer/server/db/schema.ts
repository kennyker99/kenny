import { mysqlTable, varchar, text, timestamp, json } from "drizzle-orm/mysql-core";

export const analysisRecords = mysqlTable("analysis_records", {
  id:         varchar("id", { length: 21 }).primaryKey(),
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
