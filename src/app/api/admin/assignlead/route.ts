import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import dbConnect from "@repo/db/mongooseConnect";
import mongoose from "mongoose";

export const PUT = async (req: NextRequest) => {
  const session = await getServerSession();
  const strWorkspaceId = req.nextUrl.searchParams.get("workspaceId");
  const { teamLeadId: strTeamLeadId } = await req.json();

  if (!session || !strWorkspaceId || !strTeamLeadId) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    //check user.role in workspace == Admin

    //conver typeof workspaceId to ObjectId
    const workspaceId = new mongoose.Types.ObjectId(strWorkspaceId);
    const isAdmin = await workspaceModel.findOne({
      _id: workspaceId,
      admin: session.user.id,
    });
    if (!isAdmin) {
      return returnResUnAuth("Only admins are allowed to assign team leads");
    }
    const teamLeadId = new mongoose.Types.ObjectId(strTeamLeadId);
    const updatedWorkspace = await workspaceModel.findByIdAndUpdate(
      workspaceId,
      { $push: { members: teamLeadId } },
      { new: true }
    );
    return NextResponse.json({ data: updatedWorkspace }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
