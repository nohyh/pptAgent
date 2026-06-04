import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/lib/presentationLayout.ts", "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2023,
  },
});

const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`;
const layout = await import(moduleUrl);

assert.equal(layout.toPptxPercent(12.5), "12.5%");
assert.equal(layout.getSlideAspectRatio("16x9"), "16 / 9");
assert.equal(layout.getSlideAspectRatio("4x3"), "4 / 3");
assert.equal(layout.getCssFontSize(48, "16x9"), "5cqi");
assert.equal(layout.getCssFontSize(36, "4x3"), "5cqi");
assert.equal(layout.getCssFontFamily(undefined), "Arial, Helvetica, sans-serif");
assert.equal(layout.getPptFontFace("Georgia, serif"), "Georgia");
assert.equal(layout.getPptFontFace(undefined), "Arial");
assert.equal(layout.getLineHeight(undefined), 1.5);
assert.equal(layout.getLineHeight(1.2), 1.2);
assert.equal(layout.plainTextToHtml("A < B\nC & D"), "A &lt; B<br>C &amp; D");
assert.equal(layout.htmlToPlainText("A&nbsp;&lt;&nbsp;B<div>C&amp;D</div>"), "A < B\nC&D");

console.log("presentation layout helper tests passed");
