import adafruitFont from './binary/adafruit-5x7.bin?url';
import {FontFormat} from './font';
import bdfFontNames from 'virtual:bdf-font-manifest';

const gfxFiles = (import.meta as any).glob('./gfx/*.h');
const ttfFiles = (import.meta as any).glob('./ttf/*.ttf');
const gfxSourcesFiles = (import.meta as any).glob('./gfx/*.h', {as: 'raw'});

const BDF_BASE_URL = '/fonts/bdf';

export const bdfFonts: TPlatformFont[] = bdfFontNames.map((name: string) => ({
    name,
    title: name,
    file: `${BDF_BASE_URL}/${name}.bdf`,
    format: FontFormat.FORMAT_BDF,
}));

export const bdfSources = bdfFontNames.map((name: string) => ({
    name,
    file: `${BDF_BASE_URL}/${name}.bdf`,
}));

export const gfxFonts = Object.keys(gfxFiles).map((path: string) => {
    const name = path.split('/').pop().replace('.h', '');
    return {
        name,
        title: name,
        file: gfxFiles[path],
        format: FontFormat.FORMAT_GFX,
    };
});

export const gfxSources = Object.keys(gfxSourcesFiles).map((path: string) => {
    const name = path.split('/').pop().replace('.h', '');
    return {
        name,
        file: gfxSourcesFiles[path],
    };
});

export const ttfFonts = Object.keys(ttfFiles).map((path: string) => {
    const name = path.split('/').pop().replace('.ttf', '');
    return {
        name,
        title: name.replace(/_/g, ' '),
        file: ttfFiles[path],
        format: FontFormat.FORMAT_TTF,
        options: {
            textCharHeight: 14,
            size: 14,
        },
    };
});

export const adafruitFonts = {
    adafruit: {
        name: 'adafruit',
        title: 'Adafruit 5x7',
        file: adafruitFont,
        options: {
            textCharHeight: 7,
            textCharWidth: 5,
            size: 8,
        },
        format: FontFormat.FORMAT_5x7,
    },
};
