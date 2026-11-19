
"use client";

import { usePathname } from "next/navigation";
import FooterHome from "@/components/footer_home/Footerhome";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Страницы, на которых Footer скрыт
  const hiddenRoutes = [
    "/",
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (shouldHide) return null;

  return <FooterHome showCta={false} />;
}
