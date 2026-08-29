import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getAuthContext, getMyNotificationSettings, saveMyNotificationSettings } from "@/lib/supabase/queries";

export async function GET() {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const result = await getMyNotificationSettings(context);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}

export async function PATCH(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  const result = await saveMyNotificationSettings(context, { browserPermission: body.browserPermission, followReminders: body.followReminders, majorMatchReminders: body.majorMatchReminders });
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}
