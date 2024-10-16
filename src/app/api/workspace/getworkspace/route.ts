import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { userModel } from "@repo/db/models/user";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session || !session.user) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    const workspaces = await userModel
      .find({ email: session.user?.email })
      .populate({ path: "workspaces", model: workspaceModel })
      .lean();
    return NextResponse.json({ data: workspaces }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
