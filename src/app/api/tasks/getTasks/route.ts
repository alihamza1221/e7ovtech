// api/tasks/getTasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { Role } from "@repo/db/models/user";
import { taskModel } from "@repo/db/models/task";
import mongoose from "mongoose";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import { workspaceModel } from "@repo/db/models/workspace";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);

  if (!session || !session.user) {
    return returnResUnAuth();
  }

  const { workspaceIds } = await req.json();
  //convert to object _ids
  if (workspaceIds.length === 0) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
  const workspaceIdsObj = workspaceIds.map(
    (id: string) => new mongoose.Types.ObjectId(id)
  );
  try {
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
                role: { $in: [Role.TeamLead, Role.Admin] },
              },
            },
          },
        ],
      })
      .select("_id");

    if (!isAdminOrLead) {
      return returnResUnAuth(
        "Only admins and team leads are allowed to get Tasks Data"
      );
    }

    const tasks = await taskModel.find({
      workspace: { $in: workspaceIdsObj },
    });

    return NextResponse.json({ data: tasks }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
