import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import dbConnect from "@repo/db/mongooseConnect";
import mongoose from "mongoose";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
export const PUT = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
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
    const objectuserId = new mongoose.Types.ObjectId(session.user?._id || "");
    const isAdmin = await workspaceModel.findOne({
      _id: workspaceId,
      admin: objectuserId,
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
