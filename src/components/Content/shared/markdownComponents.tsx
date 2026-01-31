import React from "react";

// ReactMarkdown用の共通コンポーネント定義
export const markdownComponents = {
  // divやiframeなどのHTMLをそのまま扱えるようにする
  p: ({ children }: { children?: React.ReactNode }) => {
    if (
      typeof children === "string" &&
      (children.includes("<h") ||
        children.includes("<a") ||
        children.includes("<iframe") ||
        children.includes("<div") ||
        children.includes("<span"))
    ) {
      return <div dangerouslySetInnerHTML={{ __html: children }} />;
    }
    return <p>{children}</p>;
  },
};

// h1タグまたは#で始まる行があるかチェックするユーティリティ
export const checkForH1 = (content: string): boolean => {
  return (
    content.toLowerCase().includes("<h1") ||
    content.split("\n").some((line) => line.trim().startsWith("# "))
  );
};
