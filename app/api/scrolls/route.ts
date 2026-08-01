import { NextResponse } from "next/server";
import { getMembershipForUser } from "../../lib/courts";
import {
  createScroll,
  defaultScrollCopy,
  listScrollsForAuthor,
} from "../../lib/scrolls";
import { SCROLL_KINDS, type ScrollKind } from "../../lib/scroll-types";
import { getSession } from "../../lib/session";
import { findUserById } from "../../lib/users";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const kindParam = url.searchParams.get("kind");
    const kind = SCROLL_KINDS.includes(kindParam as ScrollKind)
      ? (kindParam as ScrollKind)
      : undefined;
    const scrolls = await listScrollsForAuthor(session.userId, kind);
    return NextResponse.json({ scrolls });
  } catch (err) {
    console.error("scrolls get", err);
    return NextResponse.json({ error: "Could not load scrolls." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      kind?: ScrollKind;
      courtSlug?: string;
      title?: string;
      greeting?: string;
      body?: string;
      signOff?: string;
      nomineeName?: string;
      defaultsOnly?: boolean;
    };

    const kind = SCROLL_KINDS.includes(body.kind as ScrollKind)
      ? (body.kind as ScrollKind)
      : null;
    if (!kind) {
      return NextResponse.json(
        { error: "Scroll kind must be vassal or nominate_lord." },
        { status: 400 },
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.holding !== "fan") {
      return NextResponse.json(
        { error: "Fan Court holding required to send scrolls." },
        { status: 400 },
      );
    }

    if (body.defaultsOnly) {
      const membership = await getMembershipForUser(session.userId);
      return NextResponse.json({
        defaults: defaultScrollCopy({
          kind,
          authorName: user.name,
          courtName: membership?.court_name,
          nomineeName: body.nomineeName,
        }),
      });
    }

    try {
      const scroll = await createScroll({
        authorUserId: session.userId,
        kind,
        courtSlug: body.courtSlug,
        title: body.title,
        greeting: body.greeting,
        body: body.body,
        signOff: body.signOff,
        nomineeName: body.nomineeName,
      });
      return NextResponse.json({ scroll });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not seal scroll.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch (err) {
    console.error("scrolls post", err);
    return NextResponse.json({ error: "Could not seal scroll." }, { status: 500 });
  }
}
