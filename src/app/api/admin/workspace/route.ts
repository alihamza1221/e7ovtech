import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";

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

    const objAdminId = new mongoose.Types.ObjectId(session.user?._id || "");
    const newWorkspace = new workspaceModel({
      name,
      description,
      admin: objAdminId,
      teamLeads: [],
      members: [objAdminId], // Add admin as the first member
    });

    await newWorkspace.save();
    return NextResponse.json({ data: newWorkspace }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
