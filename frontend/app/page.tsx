import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StrapiBlocks } from "@/components/strapi-blocks";
import { canAccessPage, needsLoginForPage } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import {
  getDefaultSiteSettings,
  getHomeSlug,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/strapi";

export const dynamic = "force-dynamic";

async function getHomePage() {
  const settings = (await getSiteSettings()) ?? getDefaultSiteSettings();

  if (settings.defaultPage?.slug) {
    return getPageBySlug(settings.defaultPage.slug);
  }

  return getPageBySlug(getHomeSlug());
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();

  if (!page || page.accessLevel === "restricted") {
    return {};
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

export default async function Home() {
  const [page, user] = await Promise.all([getHomePage(), getCurrentUser()]);

  if (!page) {
    notFound();
  }

  if (needsLoginForPage(page, user)) {
    redirect("/login?next=/");
  }

  if (!canAccessPage(page, user)) {
    redirect("/forbidden");
  }

  return (
    <main className="site-shell py-12 sm:py-16">
      <article className="glass-panel rounded-2xl p-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-10">
        <StrapiBlocks blocks={page.content} />
      </article>
    </main>
  );
}
