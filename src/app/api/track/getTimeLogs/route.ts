// /api/track/getTimeLogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { timeLogModel } from "@repo/db/models/timelog";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);

  if (!session || !session.user) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();

    // Step 1: Convert workspace IDs to ObjectId
    const { workspaceIds } = await req.json();
    if (workspaceIds.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
    const objectWorkspaceIds = workspaceIds.map(
      (id: string) => new mongoose.Types.ObjectId(id.trim())
    );

    // Step 2: Find time logs for the given workspace IDs where `endTime` is not null
    const timeLogs = await timeLogModel
      .find({
        workspace: { $in: objectWorkspaceIds },
        endTime: { $ne: null },
      })
      .lean();

    return NextResponse.json({ data: timeLogs }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
