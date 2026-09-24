// CSV bulk-import parsing for the feedback ingestion flow (C3).
// Extremely robust parser supporting column aliases, casing flexibility, date validation, and fallbacks.
import Papa from "papaparse";
import { z } from "zod";

export type CsvRow = {
  content: string;
  channel: string;
  customer_label?: string;
  created_at?: string;
};

// Aliases for common CSV column header names
const CONTENT_KEYS = ["content", "feedback", "comment", "text", "message", "description", "details", "body", "review"];
const CHANNEL_KEYS = ["channel", "source", "platform", "type", "medium", "category"];
const CUSTOMER_KEYS = ["customer_label", "customer", "user", "author", "client", "email", "name", "customer_name"];
const DATE_KEYS = ["created_at", "date", "createdat", "time", "timestamp", "created_date"];

function findValue(row: Record<string, any>, possibleKeys: string[]): string | undefined {
  const normKeys = Object.keys(row).reduce<Record<string, any>>((acc, key) => {
    acc[key.trim().toLowerCase().replace(/[\s_-]+/g, "")] = row[key];
    return acc;
  }, {});

  for (const k of possibleKeys) {
    const cleanK = k.replace(/[\s_-]+/g, "");
    if (normKeys[cleanK] !== undefined && normKeys[cleanK] !== null) {
      const strVal = String(normKeys[cleanK]).trim();
      if (strVal.length > 0) return strVal;
    }
  }
  return undefined;
}

export function parseFeedbackCsv(fileText: string): { rows: CsvRow[]; failedCount: number } {
  const parsed = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const rows: CsvRow[] = [];
  let failedCount = 0;

  for (const raw of parsed.data) {
    if (!raw || typeof raw !== "object") {
      failedCount++;
      continue;
    }

    const content = findValue(raw, CONTENT_KEYS);
    if (!content) {
      failedCount++;
      continue;
    }

    let channel = findValue(raw, CHANNEL_KEYS);
    if (!channel) {
      channel = "support_ticket"; // Sensible default if channel is not provided
    } else {
      // Normalize channel string format (e.g., "Support Ticket" -> "support_ticket")
      channel = channel.toLowerCase().replace(/\s+/g, "_");
    }

    const customer_label = findValue(raw, CUSTOMER_KEYS);
    const rawDate = findValue(raw, DATE_KEYS);

    let created_at: string | undefined = undefined;
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        created_at = parsedDate.toISOString();
      }
    }

    rows.push({
      content,
      channel,
      customer_label,
      created_at,
    });
  }

  return { rows, failedCount };
}
