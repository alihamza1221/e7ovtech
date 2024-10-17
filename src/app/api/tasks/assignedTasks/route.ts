// /api/tasks/assignedTasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { taskModel } from "@repo/db/models/task";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import mongoose from "mongoose";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const userId = req.nextUrl.searchParams.get("userId");

  if (!session || !session.user) {
    return returnResUnAuth();
  }
  let objectUserId;
  if (!userId)
    objectUserId = new mongoose.Types.ObjectId(session.user._id || "");
  else objectUserId = new mongoose.Types.ObjectId(userId || "");
  try {
    await dbConnect();
    const userTasks = await taskModel.aggregate([
      {
        // Step 1: Match tasks assigned to the given user ID
        $match: {
          assignedTo: objectUserId,
        },
      },
      {
        // Step 2: Group tasks by workspace ID
        $group: {
          _id: "$workspace",
          tasks: {
            $push: {
              _id: "$_id",
              label: "$label",
              priority: "$priority",
              status: "$status",
              deadLine: "$deadLine",
              createdAt: "$createdAt",
              description: "$description",
            },
          },
        },
      },
      {
        // Step 3: Populate the workspace details using $lookup
        $lookup: {
          from: "workspaces", // The name of the workspace collection
          localField: "_id", // The _id field from the previous group (workspace ID)
          foreignField: "_id", // The _id field in the workspace collection
          as: "workspaceDetails",
        },
      },
      {
        // Step 4: Unwind the workspaceDetails array to convert it into a plain object
        $unwind: "$workspaceDetails",
      },
      {
        // Step 5: Project only the desired fields
        $project: {
          workspaceId: "$_id",
          workspaceName: "$workspaceDetails.name",
          workspaceDescription: "$workspaceDetails.description",
          tasks: 1, // Include the grouped tasks
        },
      },
    ]);

    return NextResponse.json({ data: userTasks }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
