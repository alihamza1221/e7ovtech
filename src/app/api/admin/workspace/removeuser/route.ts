// /api/admin/workspace/removeuser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { nextAuthOptions } from "@repo/app/api/auth/[...nextauth]/authOptions";
import { Role, userModel } from "@repo/db/models/user";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    await dbConnect();

    //check session.user.role !== "Admin
    console.log("user", session.user);
    if (session.user.role !== "Admin") {
      return returnResUnAuth("Only admins are allowed to create workspaces");
    }

    const { workspace_id, user_id } = await req.json();
    const objectWorkspaceId = new mongoose.Types.ObjectId(workspace_id);
    const objectUserId = new mongoose.Types.ObjectId(user_id);

    const updatedWorkspace = await workspaceModel.findOneAndUpdate(
      { _id: objectWorkspaceId },
      { $pull: { members: { userId: objectUserId } } },
      { new: true } // Return the updated document
    );

    //update user workspaces
    await userModel.findOneAndUpdate(
      { _id: user_id },
      {
        $pull: {
          workspaces: { workspace: objectWorkspaceId },
        },
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json({ data: updatedWorkspace }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
