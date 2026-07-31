import { NextResponse } from "next/server";
import { getMembershipForUser } from "../../../lib/courts";
import { holdingHomeHref } from "../../../lib/home";
import { findUserByEmail, verifyPassword } from "../../../lib/users";
import { setSession } from "../../../lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Unknown oath." }, { status: 401 });
    }

    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      holding: user.holding,
    });

    const membership = await getMembershipForUser(user.id);
    const court = membership
      ? {
          slug: membership.court_slug,
          role: (membership.role === "lord" ? "lord" : "vassal") as
            | "lord"
            | "vassal",
        }
      : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        holding: user.holding,
      },
      homeHref: holdingHomeHref(court),
    });
  } catch (err) {
    console.error("login", err);
    return NextResponse.json({ error: "Could not enter holding." }, { status: 500 });
  }
}
