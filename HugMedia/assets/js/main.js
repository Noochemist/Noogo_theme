/* Phase 0 · main.js — JS 入口
   组装 core 层，初始化主题；features/ 与 style-behaviors/ 在后续 Phase 按需并入。 */
import { init } from './core/init.js';
import { mount as mountFeatures } from './features/index.js';

init();
mountFeatures();