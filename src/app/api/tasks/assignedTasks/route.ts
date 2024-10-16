import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { taskModel } from "@repo/db/models/task";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!session || !workspaceId || !session.user) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    const userTasks = await taskModel
      .find({
        workspace: workspaceId,
        assignedTo: session.user._id,
      })
      .lean();

    return NextResponse.json({ data: userTasks }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
