const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const STRAPI_PUBLIC_URL = process.env.STRAPI_PUBLIC_URL ?? STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export type ThemePreference = "system" | "light" | "dark";
export type BackgroundMode = "default" | "image" | "shader";

export type StrapiTextNode = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

export type StrapiLinkNode = {
  type: "link";
  url: string;
  children: StrapiInlineNode[];
};

export type StrapiInlineNode = StrapiTextNode | StrapiLinkNode;

export type StrapiBlock =
  | {
      type: "paragraph" | "quote";
      children: StrapiInlineNode[];
    }
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: StrapiInlineNode[];
    }
  | {
      type: "list";
      format: "ordered" | "unordered";
      children: Array<{
        type: "list-item";
        children: StrapiInlineNode[];
      }>;
    };

export type Page = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: StrapiBlock[] | string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
};

export type NavItem = {
  id: number;
  documentId: string;
  label: string;
  url: string;
  priority: number;
  isExternal: boolean;
  publishedAt: string | null;
  nav_items?: NavItem[];
  nav_item?: NavItem | null;
};

export type StrapiMedia = {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  url: string;
  width: number | null;
  height: number | null;
  mime: string;
};

export type SiteSettings = {
  id: number;
  documentId: string;
  siteName: string;
  defaultTheme: ThemePreference;
  defaultPage: Page | null;
  backgroundImage?: StrapiMedia | null;
  backgroundImageDark: StrapiMedia | null;
  backgroundImageLight: StrapiMedia | null;
  backgroundMode: BackgroundMode;
  backgroundOverlayColorDark: string | null;
  backgroundOverlayColorLight: string | null;
  backgroundOverlayTransparencyDark: number | string | null;
  backgroundOverlayTransparencyLight: number | string | null;
  favicon: StrapiMedia | null;
  publishedAt: string | null;
};

export type FooterSettings = {
  id: number;
  documentId: string;
  copyrightText: string;
  additionalText: string | null;
  publishedAt: string | null;
};

export type FooterItem = {
  id: number;
  documentId: string;
  label: string;
  link: string;
  priority: number;
  publishedAt: string | null;
};

type StrapiCollectionResponse<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

type StrapiSingleResponse<T> = {
  data: T | null;
  meta: Record<string, unknown>;
};

function getStrapiUrl(path: string) {
  const url = new URL(path, STRAPI_URL);
  return url.toString();
}

export function getStrapiMediaUrl(media: StrapiMedia | null | undefined) {
  if (!media?.url) {
    return null;
  }

  return new URL(media.url, STRAPI_PUBLIC_URL).toString();
}

async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (STRAPI_API_TOKEN) {
    headers.set("Authorization", `Bearer ${STRAPI_API_TOKEN}`);
  }

  const response = await fetch(getStrapiUrl(path), {
    ...init,
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `Strapi request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

async function optionalStrapiFetch<T>(
  path: string,
  fallback: T,
): Promise<T> {
  try {
    return await strapiFetch<T>(path);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Optional Strapi request failed for ${path}:`, error);
    }

    return fallback;
  }
}

export async function getPages() {
  const response = await strapiFetch<StrapiCollectionResponse<Page>>(
    "/api/pages?fields[0]=title&fields[1]=slug&fields[2]=seoTitle&fields[3]=seoDescription&sort=title:asc",
  );

  return response.data;
}

export async function getNavItems() {
  const response = await optionalStrapiFetch<StrapiCollectionResponse<NavItem>>(
    "/api/nav-items?populate=*&sort=priority:asc",
    {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 0,
          pageCount: 0,
          total: 0,
        },
      },
    },
  );

  return response.data;
}

export async function getSiteSettings() {
  const response = await optionalStrapiFetch<StrapiSingleResponse<SiteSettings>>(
    "/api/site-setting?populate=*",
    {
      data: null,
      meta: {},
    },
  );

  return response.data;
}

export async function getFooterSettings() {
  const response = await optionalStrapiFetch<
    StrapiSingleResponse<FooterSettings>
  >("/api/footer-setting?populate=*", {
    data: null,
    meta: {},
  });

  return response.data;
}

export async function getFooterItems() {
  const response = await optionalStrapiFetch<
    StrapiCollectionResponse<FooterItem>
  >(
    "/api/footer-items?fields[0]=label&fields[1]=link&fields[2]=priority&sort=priority:asc",
    {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 0,
          pageCount: 0,
          total: 0,
        },
      },
    },
  );

  return response.data;
}

export function getDefaultFooterSettings(): Pick<
  FooterSettings,
  "additionalText" | "copyrightText"
> {
  return {
    additionalText: "Inhalte werden in Strapi gepflegt und von Next.js ausgeliefert.",
    copyrightText: `© ${new Date().getFullYear()} Main Website`,
  };
}

export async function getPageBySlug(slug: string) {
  const params = new URLSearchParams({
    "filters[slug][$eq]": slug,
    populate: "*",
  });

  const response = await strapiFetch<StrapiCollectionResponse<Page>>(
    `/api/pages?${params.toString()}`,
  );

  return response.data[0] ?? null;
}

export function getHomeSlug() {
  return process.env.STRAPI_HOME_SLUG ?? "startseite";
}

export function getDefaultSiteSettings(): Pick<
  SiteSettings,
  | "backgroundImage"
  | "backgroundImageDark"
  | "backgroundImageLight"
  | "backgroundMode"
  | "backgroundOverlayColorDark"
  | "backgroundOverlayColorLight"
  | "backgroundOverlayTransparencyDark"
  | "backgroundOverlayTransparencyLight"
  | "defaultPage"
  | "defaultTheme"
  | "favicon"
  | "siteName"
> {
  return {
    backgroundImage: null,
    backgroundImageDark: null,
    backgroundImageLight: null,
    backgroundMode: "image",
    backgroundOverlayColorDark: null,
    backgroundOverlayColorLight: null,
    backgroundOverlayTransparencyDark: 0.25,
    backgroundOverlayTransparencyLight: 0.35,
    defaultPage: null,
    defaultTheme: "system",
    favicon: null,
    siteName: "Main Website",
  };
}
