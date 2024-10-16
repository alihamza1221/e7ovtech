import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResUnAuth, returnResErr } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { messageModel } from "@repo/db/models/message";
import { userModel } from "@repo/db/models/user";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!session || !workspaceId) {
    return returnResUnAuth();
  }

  try {
    await dbConnect();
    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
    const messages = await messageModel
      .find({ workspace: objectWorkspaceId })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", model: userModel, select: "name email" })
      .lean();

    return NextResponse.json({ data: messages }, { status: 200 });
  } catch (err) {
    return returnResErr(err);
  }
};
