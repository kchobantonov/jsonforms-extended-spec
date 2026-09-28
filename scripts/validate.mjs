import { fileURLToPath } from 'node:url';
import { validateProject } from './validation.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
console.log(await validateProject(root));
