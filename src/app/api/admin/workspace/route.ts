import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import { Role, userModel } from "@repo/db/models/user";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    const { name, description } = await req.json();
    await dbConnect();

    //check session.user.role !== "Admin
    console.log("user", session.user);
    if (session.user.role !== "Admin") {
      return returnResUnAuth("Only admins are allowed to create workspaces");
    }

    const objAdminId = new mongoose.Types.ObjectId(session.user?._id as string);
    const newWorkspace = new workspaceModel({
      name,
      description,
      admin: objAdminId,
      teamLeads: [],
      members: [{ userId: objAdminId, role: Role.Admin }], // Add admin as the first member
    });

    await newWorkspace.save();

    //update user workspaces
    await userModel.findOneAndUpdate(
      { email: session.user.email },
      {
        $push: {
          workspaces: { workspace: newWorkspace._id, role: Role.Admin },
        },
      }
    );
    const populatedWorkspace = await workspaceModel
      .findById(newWorkspace._id)
      .populate({
        path: "members.userId",
        model: userModel,
        select: "name email",
      });
    return NextResponse.json({ data: populatedWorkspace }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
