import { NextResponse } from "next/server";

// 个人接口统一用 401 告诉前端需要登录，不返回看起来像成功的假数据。
export function unauthorizedResponse() {
  return NextResponse.json({ error: "UNAUTHORIZED", message: "请先登录后再使用个人功能。" }, { status: 401 });
}

export function databaseErrorResponse(message?: string) {
  return NextResponse.json({ error: "DATABASE_ERROR", message: message ?? "个人数据暂时无法读取。" }, { status: 503 });
}
