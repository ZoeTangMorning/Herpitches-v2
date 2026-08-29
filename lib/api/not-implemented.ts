import { NextResponse } from "next/server";

// 所有尚未开发的接口都使用统一错误格式，客户端以后可以稳定识别 error 字段。
export function notImplementedResponse(resource: string) {
  return NextResponse.json(
    {
      error: "NOT_IMPLEMENTED",
      message: `${resource} 接口将在后续开发组别中接入。`,
    },
    { status: 501 },
  );
}
