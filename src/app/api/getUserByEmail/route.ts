import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr } from "@repo/utils/nextResponse";

import { nextAuthOptions } from "../auth/[...nextauth]/authOptions";
import { userModel } from "@repo/db/models/user";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    const { email } = await req.json();
    await dbConnect();

    const userId = await userModel.findOne({ email }).select("_id");

    return NextResponse.json({ data: userId }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
