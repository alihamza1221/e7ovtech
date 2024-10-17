// /api/teamlead/getData/route.ts
import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { Role, userModel } from "@repo/db/models/user";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import mongoose from "mongoose";
import { taskModel } from "@repo/db/models/task";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);

  if (!session || !session.user) {
    return returnResUnAuth();
  }

  const objUserId = new mongoose.Types.ObjectId(session.user?._id || "");
  try {
    await dbConnect();

    // Step 1: Find workspaces where the user is a team lead in the members array
    const workspaces = await workspaceModel
      .find({
        members: {
          $elemMatch: {
            userId: objUserId,
            role: Role.TeamLead,
          },
        },
      })
      .populate({ path: "members.userId", model: userModel })
      .populate({ path: "tasks", model: taskModel })
      .lean();

    return NextResponse.json({ data: workspaces }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
