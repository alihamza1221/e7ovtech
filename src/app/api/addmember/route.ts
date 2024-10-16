import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose, { mongo } from "mongoose";
import { nextAuthOptions } from "../auth/[...nextauth]/authOptions";
import { userModel } from "@repo/db/models/user";
import bcrypt from "bcrypt";
export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    const { user, workspaceId } = await req.json();
    await dbConnect();

    let newUser;

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const existinguser = await userModel.findOne({ email: user.email });
    if (!existinguser) {
      newUser = await userModel.create({
        ...user,
        password: hashedPassword,
      });
      await newUser.save();
    } else {
      newUser = existinguser;
    }

    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
    const updatedWorkspace = await workspaceModel.findByIdAndUpdate(
      { _id: objectWorkspaceId },
      {
        $push: {
          members: {
            userId: newUser._id,
            role: user?.workspaces?.role,
          },
        },
      },
      { new: true }
    );

    //update user workspaces
    await userModel.findOneAndUpdate(
      { _id: newUser._id },
      {
        $push: {
          workspaces: {
            workspace: objectWorkspaceId,
            role: user?.workspaces?.role,
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({ data: updatedWorkspace }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
