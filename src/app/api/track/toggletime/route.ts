import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { taskModel, TaskStatus } from "@repo/db/models/task";
import mongoose from "mongoose";
import { timeLogModel } from "@repo/db/models/timelog";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession();
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!session || !taskId) {
    return returnResUnAuth();
  }

  try {
    const { startTime, endTime, workspaceId } = await req.json();

    await dbConnect();
    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const objectTaskId = new mongoose.Types.ObjectId(taskId);

    if (startTime) {
      const timeLog = await new timeLogModel({
        workspace: objectWorkspaceId,
        user: userId,
        task: objectTaskId,
        startTime,
        endTime,
      }).save();

      if (!timeLog) {
        //set task to completed
        await taskModel.findByIdAndUpdate(taskId, {
          status: TaskStatus.InProgress,
        });
      }
      return NextResponse.json({ data: timeLog }, { status: 201 });
    } else if (endTime) {
      //if task is completed
      const timeLog = await timeLogModel.findOneAndUpdate(
        { task: objectTaskId, endTime: null },
        { endTime },
        { new: true }
      );
      if (!timeLog) {
        return returnResErr("Task not started yet or already completed");
      }
      //set task to completed
      await taskModel.findByIdAndUpdate(taskId, {
        status: TaskStatus.Completed,
      });
      return NextResponse.json({ data: timeLog }, { status: 200 });
    }
  } catch (err) {
    return returnResErr(err);
  }
};
