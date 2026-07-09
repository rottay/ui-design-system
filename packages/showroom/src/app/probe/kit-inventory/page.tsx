/**
 * TEMPORARY kit-inventory probe for WO-SHW-01 sighted capture.
 *
 * Renders every component of `@rottay/design-system/commercial` on both an ink (dark) and a
 * paper (light) surface so a single capture proves the monochrome kit under both surface
 * treatments, plus a ProductWindow demonstrating the sanctioned color pass-through. Not a
 * product surface — the showroom relaunch (WO-SHW-02+) builds the real commercial chrome.
 */
import "@rottay/design-system/commercial.css";

import {
  AsciiFrame,
  SectionFrame,
  Typewriter,
  TerminalBlock,
  TreeView,
  CropMarks,
  InvertSection,
  TextureBackdrop,
  MonoStat,
  AsciiDiagram,
  ProductWindow,
} from "@rottay/design-system/commercial";

const DIAGRAM_NODES = [
  { id: "platform", label: "PLATFORM", col: 1, row: 0, emphasis: true },
  { id: "bithire", label: "BITHIRE", col: 0, row: 1 },
  { id: "evnto", label: "EVNTO", col: 2, row: 1 },
  { id: "ds", label: "DESIGN SYSTEM", col: 1, row: 2 },
];
const DIAGRAM_EDGES = [
  { from: "platform", to: "bithire" },
  { from: "platform", to: "evnto" },
  { from: "platform", to: "ds" },
];

const TREE = {
  label: "rottay/",
  children: [
    { label: "platform/" },
    { label: "verticals/", children: [{ label: "bithire/" }, { label: "evnto/" }] },
    { label: "design-system/" },
  ],
};

function Inventory(): React.JSX.Element {
  return (
    <div style={{ display: "grid", gap: "2rem", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <SectionFrame index={1} title="Framing" meta="AsciiFrame / SectionFrame / CropMarks">
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
          <AsciiFrame label="single">Box-drawing corner-and-rule framing.</AsciiFrame>
          <AsciiFrame variant="double" label="double">Highest-emphasis double frame.</AsciiFrame>
          <CropMarks>
            <div style={{ padding: "1rem" }}>Crop-mark register ticks.</div>
          </CropMarks>
        </div>
      </SectionFrame>

      <SectionFrame index={2} title="ASCII devices" meta="AsciiDiagram / TreeView / TerminalBlock">
        <AsciiDiagram
          nodes={DIAGRAM_NODES}
          edges={DIAGRAM_EDGES}
          description="The Rottay platform connects to the BitHire and Evnto verticals and the design system."
        />
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr", marginTop: "1.5rem" }}>
          <TreeView data={TREE} />
          <TerminalBlock
            title="build"
            lines={[
              { prompt: true, text: "pnpm --filter @rottay/design-system build" },
              { text: "commercial.js  commercial.cjs  commercial.d.ts" },
              { text: "done in 2.4s" },
            ]}
          />
        </div>
      </SectionFrame>

      <SectionFrame index={3} title="Motion + data" meta="Typewriter / MonoStat">
        <Typewriter text="Rottay builds the software that runs entire businesses." />
        <div style={{ display: "flex", gap: "3rem", marginTop: "1.5rem" }}>
          <MonoStat value={601} label="use cases documented" />
          <MonoStat value={9} label="domain modules" />
          <MonoStat value={130} label="components" />
        </div>
      </SectionFrame>

      <SectionFrame index={4} title="Texture + product window" meta="TextureBackdrop / ProductWindow">
        <TextureBackdrop pattern="graph">
          <div style={{ padding: "2rem" }}>Graph-paper backdrop at whisper contrast.</div>
        </TextureBackdrop>
        <div style={{ marginTop: "1.5rem" }}>
          <ProductWindow label="Dashboard — live view" caption="The only color on the page: a window into the product.">
            <div style={{ padding: "1.5rem", background: "#0d3b66", color: "#ffffff" }}>
              A framed product demo whose real color passes through the grayscale chrome.
            </div>
          </ProductWindow>
        </div>
      </SectionFrame>
    </div>
  );
}

export default function KitInventoryPage(): React.JSX.Element {
  return (
    <main className="ds-commercial">
      <InvertSection surface="ink">
        <Inventory />
      </InvertSection>
      <InvertSection surface="paper">
        <Inventory />
      </InvertSection>
    </main>
  );
}
