import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const apiKey = process.env.SUPERMEMORY_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Supermemory API key not configured" },
            { status: 500 }
        );
    }

    const response = await fetch(
        "https://api.supermemory.ai/v3/documents/documents",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                page,
                limit,
                sort: "createdAt",
                order: "desc",
            }),
        }
    );

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch memory graph data" },
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json(data);
}
