import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { messageModel } from "@repo/db/models/message";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession();
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!session || !workspaceId || !session.user) {
    return returnResUnAuth();
  }

  try {
    const { content } = await req.json();
    await dbConnect();
    /*
   sender: Types.ObjectId;
   workspace: Types.ObjectId;
   content: string;
   timestamp: Date;*/

    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
    const sender = new mongoose.Types.ObjectId(session.user.id);

    const newMessage = new messageModel({
      sender,
      workspace: objectWorkspaceId,
      user: session.user.id,
      content,
    });

    await newMessage.save();
    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
