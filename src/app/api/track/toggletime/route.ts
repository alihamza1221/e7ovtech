// /api/track/toggletime/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { taskModel, TaskStatus } from "@repo/db/models/task";
import mongoose from "mongoose";
import { timeLogModel } from "@repo/db/models/timelog";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!session || !taskId) {
    return returnResUnAuth();
  }

  try {
    const { startTime, endTime, workspaceId, userId } = await req.json();

    await dbConnect();
    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);

    const objectuserId = new mongoose.Types.ObjectId(userId);
    const objectTaskId = new mongoose.Types.ObjectId(taskId);

    if (startTime) {
      const timeLog = await new timeLogModel({
        workspace: objectWorkspaceId,
        user: objectuserId,
        task: objectTaskId,
        startTime,
      }).save();

      //set task to completed
      await taskModel.findByIdAndUpdate(objectTaskId, {
        status: TaskStatus.InProgress,
      });

      return NextResponse.json({ data: timeLog }, { status: 201 });
    } else if (endTime) {
      //if task is completed
      const timeLog = await timeLogModel.findOneAndUpdate(
        {
          task: objectTaskId,
          $or: [
            { endTime: undefined },
            {
              endTime: null,
            },
          ],
        },
        { endTime },
        { new: true }
      );
      if (!timeLog) {
        return returnResErr("Task not started yet or already completed");
      }
      //set task to completed
      await taskModel.findByIdAndUpdate(objectTaskId, {
        status: TaskStatus.Completed,
      });
      return NextResponse.json({ data: timeLog }, { status: 200 });
    }
  } catch (err) {
    return returnResErr(err);
  }
};
