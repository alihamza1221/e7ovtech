import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { timeLogModel } from "@repo/db/models/timelog";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession();
  let userId: string | any = req.nextUrl.searchParams.get("userId");

  if (!session || (!userId && !session.user.id)) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    if (!userId) {
      userId = new mongoose.Types.ObjectId(session.user.id);
    }
    const timeLogs = await timeLogModel.find({ user: userId }).lean();
    const totalDuration = timeLogs.reduce((acc, log) => {
      if (log.endTime) {
        return (
          acc +
          (new Date(log.endTime).getTime() - new Date(log.startTime).getTime())
        );
      }
      return acc;
    }, 0);

    const totalHours = totalDuration / (1000 * 60 * 60);
    return NextResponse.json({ data: totalHours }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
