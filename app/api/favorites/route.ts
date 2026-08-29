import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { addFavorite, getAuthContext, getMyFavorites, removeFavorite } from "@/lib/supabase/queries";

export async function GET() {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const result = await getMyFavorites(context);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  if (typeof body.articleId !== "string" || typeof body.articleTitle !== "string") return NextResponse.json({ error: "INVALID_INPUT", message: "收藏文章信息不完整。" }, { status: 400 });
  const result = await addFavorite(context, body);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "INVALID_INPUT", message: "缺少收藏记录 ID。" }, { status: 400 });
  const result = await removeFavorite(context, id);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: { id } });
}
