// api/ai/completions/route.ts
import { AzureOpenAI } from "openai";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { returnResErr, returnResUnAuth } from "@repo/utils/nextResponse";

import { nextAuthOptions } from "../../auth/[...nextauth]/authOptions";
import { taskModel } from "@repo/db/models/task";
import mongoose from "mongoose";
import { workspaceModel } from "@repo/db/models/workspace";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  try {
    const endpoint =
      process.env.AZURE_ENDPOINT || "https://web3hack.openai.azure.com/";
    const apiKey = process.env.AZURE_API_KEY || "";
    const apiVersion = "2024-05-01-preview";
    const deployment = process.env.COMPLETIONS_NAME || "";

    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment,
    });

    const { userMessage } = await req.json();
    const objectUserId = new mongoose.Types.ObjectId(session.user._id || "");
    const userData = await taskModel
      .findOne({
        // Match tasks assigned to the given user ID
        assignedTo: objectUserId,
      })
      .populate({ path: "workspace", select: "name", model: workspaceModel })
      .limit(6);
    const userQuery = `user query": ${userMessage}, "reference data": ${userData}`;
    const result = await client.chat.completions.create({
      model: process.env.AZURE_DEPLOYMENT_COMPLETIONS_NAME || "",
      messages: [
        {
          role: "system",
          content: `
          You are an AI assistant for workspace members. Your tasks include:
          1. Providing information about tasks assigned to members.
          2. Highlighting important tasks based on status and deadlines.
          3. Suggesting which tasks to prioritize.
          4. Providing general workspace info
          5. should maximum of two lines response
          
          Please respond with the relevant information directly, without any introductory phrases.
          `,
        },
        { role: "user", content: userQuery },
      ],
      max_tokens: 120,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Retrieve and return the content of the assistant's response
    console.log(result.choices[0]?.message);
    const response = result.choices[0]?.message.content || null;

    return NextResponse.json({ data: response }, { status: 201 });
  } catch (err) {
    return returnResErr(err);
  }
};
