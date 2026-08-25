import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function safeParseResult(raw: unknown) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { status: "FAIL", summary: "Stored result could not be parsed.", verdict: "Unclear" };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const searches = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const parsedSearches = searches.map((search) => ({
      ...search,
      result: safeParseResult(search.result),
    }));

    return NextResponse.json({ searches: parsedSearches });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { query, result } = await req.json();

    if (!query || !result) {
      return NextResponse.json(
        { error: "Query and result are required" },
        { status: 400 }
      );
    }

    const search = await prisma.searchHistory.create({
      data: {
        userId: session.user.id,
        query: String(query).slice(0, 2000),
        result: JSON.stringify(result),
      },
    });

    return NextResponse.json({ saved: true, id: search.id });
  } catch (error) {
    console.error("Save history error:", error);
    return NextResponse.json(
      { error: "Failed to save search" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchId } = await req.json();

    if (!searchId) {
      return NextResponse.json(
        { error: "Search ID is required" },
        { status: 400 }
      );
    }

    await prisma.searchHistory.delete({
      where: {
        id: searchId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: "Failed to delete search" },
      { status: 500 }
    );
  }
}
