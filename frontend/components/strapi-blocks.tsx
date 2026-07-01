import type { StrapiBlock, StrapiInlineNode, StrapiTextNode } from "@/lib/strapi";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function renderText(node: StrapiTextNode, key: string) {
  let content: React.ReactNode = node.text;

  if (node.code) content = <code>{content}</code>;
  if (node.bold) content = <strong>{content}</strong>;
  if (node.italic) content = <em>{content}</em>;
  if (node.underline) content = <u>{content}</u>;
  if (node.strikethrough) content = <s>{content}</s>;

  return <span key={key}>{content}</span>;
}

function renderInline(node: StrapiInlineNode, key: string): React.ReactNode {
  if (node.type === "text") {
    return renderText(node, key);
  }

  return (
    <a key={key} href={node.url}>
      {node.children.map((child, index) => renderInline(child, `${key}-${index}`))}
    </a>
  );
}

function renderChildren(children: StrapiInlineNode[]) {
  return children.map((child, index) => renderInline(child, String(index)));
}

export function StrapiBlocks({
  blocks,
}: {
  blocks: StrapiBlock[] | string | null;
}) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  if (typeof blocks === "string") {
    return (
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: blocks }}
      />
    );
  }

  return (
    <div className="content">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          const Heading = `h${block.level}` as HeadingTag;
          return <Heading key={key}>{renderChildren(block.children)}</Heading>;
        }

        if (block.type === "quote") {
          return <blockquote key={key}>{renderChildren(block.children)}</blockquote>;
        }

        if (block.type === "list") {
          const List = block.format === "ordered" ? "ol" : "ul";

          return (
            <List key={key}>
              {block.children.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{renderChildren(item.children)}</li>
              ))}
            </List>
          );
        }

        return <p key={key}>{renderChildren(block.children)}</p>;
      })}
    </div>
  );
}
