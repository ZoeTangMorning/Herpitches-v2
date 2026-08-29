import { redirect } from "next/navigation";

// 根路径是快捷入口，按照产品约定直接进入新闻首页。
export default function HomePage() {
  redirect("/news");
}
