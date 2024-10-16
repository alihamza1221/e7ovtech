import { NextResponse } from "next/server";

export const returnResUnAuth = (message: string = "Unauthenticated") => {
  return NextResponse.json({ message }, { status: 403 });
};

export const returnResErr = (err: any) => {
  return NextResponse.json({ message: err?.message }, { status: 403 });
};
