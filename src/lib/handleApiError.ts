// lib/handleApiError.ts
import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function handleApiError(e: unknown) {
  if (e instanceof AppError) {
    return NextResponse.json(
      { error: e.message, code: e.code },
      { status: e.status }
    );
  }

  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}
