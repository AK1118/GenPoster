import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { glob, globSync } from "glob";
import cleanupPlugin from "rollup-plugin-cleanup";
import copy from "rollup-plugin-copy";
import { obfuscator } from "rollup-obfuscator";
import resolve from "@rollup/plugin-node-resolve";
//获取所有数据
const allTypes = globSync("./src/types/*.d.ts");
const DEST_PATH = "dist/types/";
const copyAllTargets = [
  // {
  //   src: "plugins/gen-ui",
  //   dest: "dist/plugins",
  // },
  // {
  //   src: "dist/",
  //   dest: "example",
  // },
  // {
  //   src:'index.js',
  //   dest:"dist",
  // },
  ...allTypes.map((_) => ({
    src: _.replace(/\\/g, "/"),
    dest: DEST_PATH,
  })),
];
const copyConfig = {
  targets: copyAllTargets,
};

const plugins = [
  cleanupPlugin(),
  resolve({ 
    extensions: [".ts", ".js"] }),
  typescript(),
  copy(copyConfig),
  //压缩打包代码
  obfuscator(),
  terser(),
];

const config = [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./dist/index.amd.js",
        format: "amd",
        exports: "named",
      },
      {
        file: "./dist/index.esm.js",
        format: "es",
        exports: "named",
      },
    ],
    plugins,
  },
];
export default config;
