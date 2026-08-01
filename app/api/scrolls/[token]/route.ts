import { NextResponse } from "next/server";
import { getScrollByToken } from "../../../lib/scrolls";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const scroll = await getScrollByToken(token);
    if (!scroll) {
      return NextResponse.json({ error: "Scroll not found." }, { status: 404 });
    }
    return NextResponse.json({ scroll });
  } catch (err) {
    console.error("scroll get", err);
    return NextResponse.json({ error: "Could not open scroll." }, { status: 500 });
  }
}
