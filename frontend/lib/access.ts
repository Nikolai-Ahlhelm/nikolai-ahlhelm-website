import type { CurrentUser } from "@/lib/auth";
import type { Page } from "@/lib/strapi";

export function canAccessPage(page: Page, user: CurrentUser | null) {
  const accessLevel = page.accessLevel ?? "public";

  if (accessLevel === "public") {
    return true;
  }

  if (!user) {
    return false;
  }

  if (accessLevel === "authenticated") {
    return true;
  }

  const isAllowedUser = (page.allowedUsers ?? []).some((allowedUser) => {
    return allowedUser.id === user.id || allowedUser.documentId === user.documentId;
  });

  if (isAllowedUser) {
    return true;
  }

  return (page.allowedGroups ?? []).some((group) => {
    return (group.users ?? []).some((groupUser) => {
      return groupUser.id === user.id || groupUser.documentId === user.documentId;
    });
  });
}

export function needsLoginForPage(page: Page, user: CurrentUser | null) {
  return (page.accessLevel ?? "public") !== "public" && !user;
}
