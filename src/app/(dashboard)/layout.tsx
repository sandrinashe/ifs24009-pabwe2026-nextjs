"use client";

import PostLayout from "@/features/posts/layouts/PostLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PostLayout>{children}</PostLayout>;
}
