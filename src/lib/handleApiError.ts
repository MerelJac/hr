// lib/handleApiError.ts
import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { Prisma } from "@prisma/client";

export function handleApiError(e: unknown) {
  if (e instanceof AppError) {
    return NextResponse.json(
      { error: e.message, code: e.code },
      { status: e.status }
    );
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
    }
  }

  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}
