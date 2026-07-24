import { NextResponse } from "next/server";
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
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Unknown oath." }, { status: 401 });
    }

    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      holding: user.holding,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        holding: user.holding,
      },
    });
  } catch (err) {
    console.error("login", err);
    return NextResponse.json({ error: "Could not enter holding." }, { status: 500 });
  }
}
