import { NextRequest, NextResponse } from "next/server";
import { workspaceModel } from "@repo/db/models/workspace";
import { getServerSession } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { returnResErr } from "@repo/utils/nextResponse";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    const { name, description } = await req.json();
    await dbConnect();

    //check session.user.role !== "Admin

    const newWorkspace = new workspaceModel({
      name,
      description,
      admin: session.user.id,
      teamLeads: [],
      members: [session.user.id], // Add admin as the first member
    });

    await newWorkspace.save();
    return NextResponse.json({ data: newWorkspace }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
