import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "../../../lib/users";
import { setSession } from "../../../lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      holding?: "fan" | "estate";
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const holding = body.holding === "estate" ? "estate" : "fan";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password needs 6+ characters." }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already sworn." }, { status: 409 });
    }

    const user = await createUser({ name, email, password, holding });
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
    console.error("signup", err);
    return NextResponse.json({ error: "Could not open holding." }, { status: 500 });
  }
}
