import { createSnakerRenderShard, setDarkMode, setNavbar } from "./api.js";
setDarkMode();
setNavbar();
const renderer = createSnakerRenderShard();
await renderer.init();
renderer.start();
