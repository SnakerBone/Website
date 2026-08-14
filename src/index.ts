import { createSnakerRenderShard, setDarkMode, setNavbar } from "./api.js";
import { GLShaderRenderer } from "./glrenderer.js";

setDarkMode();
setNavbar();

const renderer: GLShaderRenderer = createSnakerRenderShard();

await renderer.init();
renderer.start();