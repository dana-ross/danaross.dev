const { extendDefaultPlugins } = require("svgo");
module.exports = {
  plugins: [
    {
      cleanupAttrs: true,
      name: "cleanupAttrs",
      active: true,
    },
    {
      removeDoctype: true,
      name: "removeDoctype",
      active: true,
    },
    {
      removeXMLProcInst: true,
      name: "removeXMLProcInst",
      active: true,
    },
    {
      removeComments: true,
      name: "removeComments",
      active: true,
    },
    {
      removeMetadata: true,
      name: "removeMetadata",
      active: true,
    },
    {
      removeTitle: true,
      name: "removeTitle",
      active: true,
    },
    {
      removeDesc: true,
      name: "removeDesc",
      active: true,
    },
    {
      removeUselessDefs: true,
      name: "removeUselessDefs",
      active: true,
    },
    {
      removeEditorsNSData: true,
      name: "removeEditorsNSData",
      active: true,
    },
    {
      removeEmptyAttrs: true,
      name: "removeEmptyAttrs",
      active: true,
    },
    {
      removeHiddenElems: true,
      name: "removeHiddenElems",
      active: true,
    },
    {
      removeEmptyText: true,
      name: "removeEmptyText",
      active: true,
    },
    {
      removeEmptyContainers: true,
      name: "removeEmptyContainers",
      active: true,
    },
    {
      removeViewBox: false,
      name: "removeViewBox",
      active: false,
    },
    {
      cleanupEnableBackground: true,
      name: "cleanupEnableBackground",
      active: true,
    },
    {
      convertStyleToAttrs: true,
      name: "convertStyleToAttrs",
      active: true,
    },
    {
      convertColors: true,
      name: "convertColors",
      active: true,
    },
    {
      convertPathData: true,
      name: "convertPathData",
      active: true,
    },
    {
      convertTransform: true,
      name: "convertTransform",
      active: true,
    },
    {
      removeUnknownsAndDefaults: true,
      name: "removeUnknownsAndDefaults",
      active: true,
    },
    {
      removeNonInheritableGroupAttrs: true,
      name: "removeNonInheritableGroupAttrs",
      active: true,
    },
    {
      removeUselessStrokeAndFill: true,
      name: "removeUselessStrokeAndFill",
      active: true,
    },
    {
      removeUnusedNS: true,
      name: "removeUnusedNS",
      active: true,
    },
    {
      cleanupIDs: true,
      name: "cleanupIDs",
      active: true,
    },
    {
      cleanupNumericValues: true,
      name: "cleanupNumericValues",
      active: true,
    },
    {
      moveElemsAttrsToGroup: true,
      name: "moveElemsAttrsToGroup",
      active: true,
    },
    {
      moveGroupAttrsToElems: true,
      name: "moveGroupAttrsToElems",
      active: true,
    },
    {
      collapseGroups: true,
      name: "collapseGroups",
      active: true,
    },
    {
      removeRasterImages: false,
      name: "removeRasterImages",
      active: false,
    },
    {
      mergePaths: true,
      name: "mergePaths",
      active: true,
    },
    {
      convertShapeToPath: true,
      name: "convertShapeToPath",
      active: true,
    },
    {
      sortAttrs: true,
      name: "sortAttrs",
      active: true,
    },
    {
      removeDimensions: true,
      name: "removeDimensions",
      active: true,
    },
    {
      removeAttrs: { attrs: "(krita.+)" },
      name: "removeAttrs",
      params: { attrs: "(krita.+)" },
    },
  ],
};
