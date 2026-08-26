/**
 * models/session.model.ts
 * -----------------------------------------------------------------------------
 * One document per logged-in device. This is what makes multi-device login
 * and "logout everywhere" work: each login creates one document here, and
 * logout-all simply deletes every document in this collection.
 * -----------------------------------------------------------------------------
 */

import { Schema, model, Document } from "mongoose";

export interface SessionDocument extends Document {
  token: string;
  createdAt: string;
  label?: string;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    createdAt: { type: String, required: true },
    label: { type: String, required: false },
  },
  { collection: "sessions" }
);

export const SessionModel = model<SessionDocument>("Session", sessionSchema);
