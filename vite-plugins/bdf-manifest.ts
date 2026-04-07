import {Plugin} from 'vite';
import {readdirSync} from 'fs';
import {resolve} from 'path';

const VIRTUAL_MODULE_ID = 'virtual:bdf-font-manifest';
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID;

/**
 * Vite plugin that scans public/fonts/bdf/ at build time and generates
 * a virtual module exporting the list of BDF font names.
 * This avoids bundling the actual BDF font data into JS — fonts are
 * served as static assets from public/ and fetched at runtime on demand.
 */
const bdfManifestPlugin: Plugin = {
    name: 'bdf-manifest',
    resolveId(id) {
        if (id === VIRTUAL_MODULE_ID) {
            return RESOLVED_ID;
        }
    },
    load(id) {
        if (id === RESOLVED_ID) {
            const bdfDir = resolve(process.cwd(), 'public/fonts/bdf');
            let names: string[];
            try {
                names = readdirSync(bdfDir)
                    .filter((f) => f.endsWith('.bdf'))
                    .map((f) => f.replace(/\.bdf$/, ''))
                    .sort();
            } catch {
                names = [];
            }
            return `export default ${JSON.stringify(names)};`;
        }
    },
};

export default bdfManifestPlugin;
