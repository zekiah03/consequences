import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  smallint,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  ageBand: text("age_band"),
  consent: text("consent").notNull().default("yes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stimulusId: text("stimulus_id").notNull(),
  conditionTempo: text("condition_tempo").notNull(),
  conditionCycle: text("condition_cycle").notNull(),
  conditionEgo: text("condition_ego").notNull(),
  conditionMeaning: text("condition_meaning").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" })
    .unique(),
  syncScore: smallint("sync_score").notNull(),
  recurScore: smallint("recur_score").notNull(),
  updateScore: smallint("update_score").notNull(),
  egoScore: smallint("ego_score").notNull(),
  meaningScore: smallint("meaning_score").notNull(),
  consciousnessScore: smallint("consciousness_score").notNull(),
  dialogueScore: smallint("dialogue_score").notNull(),
  friendScore: smallint("friend_score").notNull(),
  freeText: text("free_text"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
