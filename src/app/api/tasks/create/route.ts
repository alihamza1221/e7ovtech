import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import { Role, userModel } from "@repo/db/models/user";
import { taskModel } from "@repo/db/models/task";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession();
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!session || !session.user || !workspaceId) {
    return returnResUnAuth();
  }

  try {
    const { label, priority, description, deadLine, assignedTo } =
      await req.json();
    await dbConnect();
    //check session.user.role !== "TeamLead"
    const isAdminOrTeamLead = await userModel.findOne({
      email: session.user.email,
      workspaces: {
        $elemMatch: {
          workspaceId: workspaceId,
          role: { $in: [Role.Admin, Role.TeamLead] },
        },
      },
    });
    if (!isAdminOrTeamLead) {
      return returnResUnAuth(
        "Only admins and team leads are allowed to create tasks"
      );
    }
    const newTask = new taskModel({
      label,
      description,
      priority,
      deadLine,
      assignedTo,
      workspace: workspaceId,
      createdBy: session.user.id,
    });

    await newTask.save();
    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
