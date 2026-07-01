import Link from "next/link";
import {
  getDefaultFooterSettings,
  getFooterItems,
  getFooterSettings,
} from "@/lib/strapi";

function getInternalUrl(url: string) {
  if (url.startsWith("/") || url.startsWith("#")) {
    return url;
  }

  return `/${url}`;
}

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function FooterLink({
  item,
}: {
  item: {
    documentId: string;
    label: string;
    link: string;
  };
}) {
  const className =
    "rounded-xl px-3 py-2 transition hover:bg-[var(--surface)] hover:text-[var(--text-strong)]";

  if (isExternalUrl(item.link)) {
    return (
      <a
        className={className}
        href={item.link}
        rel="noreferrer"
        target="_blank"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link className={className} href={getInternalUrl(item.link)}>
      {item.label}
    </Link>
  );
}

export async function SiteFooter() {
  const [footerSettings, footerItems] = await Promise.all([
    getFooterSettings(),
    getFooterItems(),
  ]);
  const { additionalText, copyrightText } =
    footerSettings ?? getDefaultFooterSettings();
  const sortedFooterItems = [...footerItems].sort(
    (firstItem, secondItem) => firstItem.priority - secondItem.priority,
  );
  const additionalTextLines = additionalText
    ? additionalText.split(/\r?\n/).filter(Boolean)
    : [];

  return (
    <footer className="mt-auto px-3 pb-5 sm:px-5">
      <div className="glass-panel-muted site-shell rounded-2xl px-5 py-8 text-sm text-[var(--text-muted)] backdrop-blur-2xl backdrop-saturate-150 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="max-w-xl leading-6">
            {additionalTextLines.length > 0
              ? additionalTextLines.map((line) => <p key={line}>{line}</p>)
              : null}
          </div>
          <nav
            aria-label="Footer Navigation"
            className="flex flex-col items-start gap-1 md:items-end"
          >
            {sortedFooterItems.map((item) => (
              <FooterLink item={item} key={item.documentId} />
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-[var(--border)] pt-5 text-center text-xs text-[var(--text-muted)]">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
