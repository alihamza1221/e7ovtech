import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { Role, userModel } from "@repo/db/models/user";
import { taskModel } from "@repo/db/models/task";
import mongoose from "mongoose";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import { workspaceModel } from "@repo/db/models/workspace";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!session || !session.user || !workspaceId) {
    return returnResUnAuth();
  }

  try {
    const {
      label,
      priority,
      description,
      deadline: deadLine,
      assignedTo,
    } = await req.json();
    await dbConnect();
    //check session.user.role !== "TeamLead" || "Admin"
    const objRequesterId = new mongoose.Types.ObjectId(session.user?._id ?? "");
    const isAdminOrLead = await workspaceModel
      .findOne({
        $or: [
          {
            members: {
              $elemMatch: {
                userId: objRequesterId,
                role: { $in: ["Team Lead", "Admin"] },
              },
            },
          },
        ],
      })
      .select("_id");

    if (!isAdminOrLead) {
      return returnResUnAuth(
        "Only admins and team leads are allowed to create tasks"
      );
    }

    //convert deadline string to date
    let deadLineDate = deadLine;
    if (typeof deadLine === "string") deadLineDate = new Date(deadLine);

    console.log("deadLineDate", deadLineDate);
    const objectuserId = new mongoose.Types.ObjectId(assignedTo);
    const newTask = new taskModel({
      label,
      description,
      priority,
      deadLine: deadLineDate,
      assignedTo: objectuserId,
      workspace: workspaceId,
    });

    await newTask.save();
    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
