import Link from "next/link";
import type { NavItem } from "@/lib/strapi";
import { canAccessPage } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import {
  getDefaultSiteSettings,
  getHomeSlug,
  getNavItems,
  getPages,
  getSiteSettings,
} from "@/lib/strapi";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

type HeaderItem = Pick<
  NavItem,
  "documentId" | "isExternal" | "label" | "priority" | "url"
> & {
  nav_items?: HeaderItem[];
};

function getInternalUrl(url: string) {
  if (url.startsWith("/") || url.startsWith("#")) {
    return url;
  }

  return `/${url}`;
}

function sortByPriority(items: HeaderItem[]) {
  return [...items].sort((firstItem, secondItem) => {
    return (firstItem.priority ?? 0) - (secondItem.priority ?? 0);
  });
}

function getNavPath(item: HeaderItem) {
  if (item.isExternal || item.url.startsWith("#")) {
    return null;
  }

  return getInternalUrl(item.url).replace(/\/+$/, "") || "/";
}

function filterNavItemsByAccess(
  items: HeaderItem[],
  pageAccessByPath: Map<string, boolean>,
): HeaderItem[] {
  return items.flatMap((item) => {
    const children = filterNavItemsByAccess(
      item.nav_items ?? [],
      pageAccessByPath,
    );
    const navPath = getNavPath(item);
    const pageAccess = navPath ? pageAccessByPath.get(navPath) : undefined;
    const shouldKeep =
      !navPath ||
      pageAccess === undefined ||
      pageAccess ||
      children.length > 0;

    if (!shouldKeep) {
      return [];
    }

    return [
      {
        ...item,
        nav_items: children,
      },
    ];
  });
}

function NavLink({
  className,
  item,
}: {
  className: string;
  item: HeaderItem;
}) {
  if (item.isExternal) {
    return (
      <a
        className={className}
        href={item.url}
        rel="noreferrer"
        target="_blank"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link className={className} href={getInternalUrl(item.url)}>
      {item.label}
    </Link>
  );
}

function NavItemWithDropdown({ item }: { item: HeaderItem }) {
  const children = sortByPriority(item.nav_items ?? []);
  const hasChildren = children.length > 0;
  const topLevelClassName =
    "rounded-xl px-3 py-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]";

  if (!hasChildren) {
    return <NavLink className={topLevelClassName} item={item} />;
  }

  const shouldUseButton = !item.isExternal && ["", "#"].includes(item.url);

  return (
    <div className="group relative">
      {shouldUseButton ? (
        <button className={topLevelClassName} type="button">
          {item.label}
        </button>
      ) : (
        <NavLink className={topLevelClassName} item={item} />
      )}
      <div className="glass-panel invisible absolute left-0 top-full z-20 min-w-56 translate-y-3 rounded-2xl p-2 opacity-0 backdrop-blur-2xl backdrop-saturate-150 transition group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
        {children.map((child) => (
          <NavLink
            className="block rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
            item={child}
            key={child.documentId}
          />
        ))}
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const [settings, navItems, pages, user] = await Promise.all([
    getSiteSettings(),
    getNavItems(),
    getPages().catch(() => []),
    getCurrentUser(),
  ]);
  const { defaultTheme, siteName } = settings ?? getDefaultSiteSettings();
  const homeSlug =
    settings?.defaultPage?.slug ??
    getDefaultSiteSettings().defaultPage?.slug ??
    getHomeSlug();
  const pageAccessByPath = new Map(
    pages.map((page) => [
      page.slug === homeSlug ? "/" : `/${page.slug}`,
      canAccessPage(page, user),
    ]),
  );
  const topLevelNavItems = filterNavItemsByAccess(
    navItems.filter((item) => !item.nav_item),
    pageAccessByPath,
  );
  const items = sortByPriority(topLevelNavItems);

  return (
    <header className="sticky top-0 z-10 px-3 pt-3 sm:px-5">
      <div className="glass-panel site-shell flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 backdrop-blur-2xl backdrop-saturate-150 sm:px-5">
        <Link
          className="flex items-center gap-3 text-sm font-semibold text-[var(--text-strong)]"
          href="/"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-[var(--text-strong)] text-[var(--background)] shadow-sm">
            {siteName.charAt(0).toUpperCase()}
          </span>
          <span>{siteName}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav
            aria-label="Main navigation"
            className="flex flex-wrap gap-1 text-sm"
          >
            {items.map((item) => (
              <NavItemWithDropdown item={item} key={item.documentId} />
            ))}
          </nav>
          <ThemeToggle defaultTheme={defaultTheme} />
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <Link
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
              href="/login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
