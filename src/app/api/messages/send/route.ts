import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";
import mongoose from "mongoose";
import { messageModel } from "@repo/db/models/message";
import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import { userModel } from "@repo/db/models/user";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!session || !workspaceId || !session.user) {
    return returnResUnAuth();
  }

  try {
    const { content, aiResponse } = await req.json();
    await dbConnect();

    /*
   sender: Types.ObjectId;
   workspace: Types.ObjectId;
   content: string;
   timestamp: Date;*/

    const objectWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
    let sender;
    if (aiResponse)
      sender = new mongoose.Types.ObjectId("6711fe62bf171bcccd58533d");
    else sender = new mongoose.Types.ObjectId(session.user._id || "");

    const newMessage = new messageModel({
      sender,
      workspace: objectWorkspaceId,
      content,
    });
    await newMessage.save();
    // Populate the sender field
    const populatedMessage = await newMessage.populate({
      path: "sender",
      model: userModel,
      select: "name email image",
    });

    return NextResponse.json({ data: populatedMessage }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
