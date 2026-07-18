import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8").replaceAll("\\", "/");

describe("writing editor shared boundary", () => {
  it("keeps public writing rendering independent from portal editor internals", () => {
    const renderer = readSource("src/components/writing/WritingContentRenderer.tsx");

    expect(renderer).not.toContain("../portal/writing/editor");
    expect(renderer).not.toContain("components/portal/writing/editor");
    expect(renderer).toContain("./editor/serialization");
    expect(renderer).toContain("./editor/nodes/ChurchBlockNode");
  });

  it("keeps shared writing content-model files outside the portal editor folder", () => {
    const articleEditor = readSource("src/components/portal/writing/editor/ArticleEditor.tsx");
    const newArticlePage = readSource("src/pages/portal/writing/WritingNewArticlePage.tsx");
    const editorPage = readSource("src/pages/portal/writing/WritingEditorPage.tsx");

    expect(articleEditor).toContain("../../../writing/editor/nodes/ChurchBlockNode");
    expect(articleEditor).toContain("../../../writing/editor/serialization");
    expect(newArticlePage).toContain("../../../components/writing/editor/serialization");
    expect(editorPage).toContain("../../../components/writing/editor/scriptureReferences");
  });
});
