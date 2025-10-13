import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const newDept = await prisma.department.create({ data: { name } });
  return NextResponse.json(newDept);
}
