import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { taskModel } from "@repo/db/models/task";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession();
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!session || !workspaceId || !session.user) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    const userTasks = await taskModel
      .find({
        workspace: workspaceId,
        $or: [{ assignedTo: session.user.id }, { createdBy: session.user.id }],
      })
      .lean();

    return NextResponse.json({ data: userTasks }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
