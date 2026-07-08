import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StrapiBlocks } from "@/components/strapi-blocks";
import { canAccessPage, needsLoginForPage } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import {
  getDefaultSiteSettings,
  getHomeSlug,
  getPageBySlug,
  getPages,
  getSiteSettings,
} from "@/lib/strapi";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const [pages, settings] = await Promise.all([getPages(), getSiteSettings()]).catch(
    () => [[], null] as const,
  );
  const homeSlug =
    settings?.defaultPage?.slug ??
    getDefaultSiteSettings().defaultPage?.slug ??
    getHomeSlug();

  return pages
    .filter((page) => page.slug !== homeSlug)
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || page.accessLevel === "restricted") {
    return {};
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [page, user] = await Promise.all([getPageBySlug(slug), getCurrentUser()]);

  if (!page) {
    notFound();
  }

  if (needsLoginForPage(page, user)) {
    redirect(`/login?next=/${encodeURIComponent(slug)}`);
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
