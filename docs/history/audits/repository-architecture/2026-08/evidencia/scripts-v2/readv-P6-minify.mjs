// Reproduce Next's production CSS minification (webpack path: CssMinimizerPlugin -> cssnano-simple)
// over packages/core/styles/bithire.css, exactly as Next would minify the final emitted CSS asset.
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";

const require = createRequire(import.meta.url);
const NEXT_DIR =
  "/Users/daniel/Developer/Rottay/app-bithire/node_modules/.pnpm/next@16.3.0_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.59.1_@types+_1780d5199923f9c8873bfb4af3be3674/node_modules/next";
const POSTCSS_DIR =
  "/Users/daniel/Developer/Rottay/app-bithire/node_modules/.pnpm/postcss@8.5.23/node_modules/postcss";

const postcss = require(POSTCSS_DIR);
const cssnanoSimpleMod = require(`${NEXT_DIR}/dist/compiled/cssnano-simple`);
const postcssScssMod = require(`${NEXT_DIR}/dist/compiled/postcss-scss`);

const cssnanoSimple = cssnanoSimpleMod.default || cssnanoSimpleMod;
const postcssScss = postcssScssMod.default || postcssScssMod;

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const input = readFileSync(inputPath, "utf8");

const postcssOptions = {
  from: inputPath,
  to: outputPath,
  parser: postcssScss,
};

postcss([cssnanoSimple({ colormin: false }, postcss)])
  .process(input, postcssOptions)
  .then((res) => {
    writeFileSync(outputPath, res.css, "utf8");
    console.log("OK bytes=", Buffer.byteLength(res.css, "utf8"));
  })
  .catch((err) => {
    console.error("MINIFY FAILED:", err.message);
    process.exit(1);
  });
