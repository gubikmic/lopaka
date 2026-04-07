import {getLayerProperties} from '../core/decorators/mapping';
import {AbstractImageLayer} from '../core/layers/abstract-image.layer';
import {AbstractLayer} from '../core/layers/abstract.layer';
import {GlyphLayer} from '../core/layers/glyph.layer';
import {TextLayer} from '../core/layers/text.layer';
import {BDFFont} from '../draw/fonts/bdf.font';
import {bdfFonts} from '../draw/fonts/fontTypes';
import {imgDataToXBMP, toCppVariableName} from '../utils';
import {U8g2Parser} from './parsers/u8g2.parser';
import {Platform} from './platform';
import cEspIdfTemplate from './templates/u8g2/c_esp_idf.pug';
import defaultTemplate from './templates/u8g2/default.pug';

/**
 * Determine the correct U8g2 font suffix based on the glyph encoding range.
 * - _tr: transparent, code points 32-127 (ASCII text)
 * - _tn: transparent, code points 32-255 (extended Latin)
 * - _tf: transparent, full encoding range (icon fonts, CJK, etc.)
 */
function getU8g2FontSuffix(font: BDFFont): string {
    if (!font?.fontData?.glyphs) return '_tf';
    let maxCode = 0;
    for (const code of font.fontData.glyphs.keys()) {
        if (code > maxCode) maxCode = code;
    }
    if (maxCode <= 127) return '_tr';
    if (maxCode <= 255) return '_tn';
    return '_tf';
}

export class U8g2Platform extends Platform {
    public static id = 'u8g2';
    protected name = 'U8g2';
    protected description = 'U8g2';
    protected fonts: TPlatformFont[] = [...bdfFonts];
    protected parser: U8g2Parser = new U8g2Parser();

    protected currentTemplate: string = 'arduino';

    protected templates = {
        arduino: {
            name: 'Arduino (Cpp)',
            template: defaultTemplate,
            settings: {
                progmem: true,
                wrap: false,
                declare_vars: true,
                include_images: true,
                comments: false,
                clear_screen: true,
            },
        },
        'esp-idf': {
            name: 'ESP-IDF (C)',
            template: cEspIdfTemplate,
            settings: {
                wrap: false,
                declare_vars: true,
                include_images: true,
                comments: false,
                clear_screen: true,
            },
        },
    };

    constructor() {
        super();
        this.features.hasInvertedColors = true;
        this.features.defaultColor = '#FFFFFF';
        this.features.screenBgColor = '#000000';
    }

    generateSourceCode(layers: AbstractLayer[], ctx?: OffscreenCanvasRenderingContext2D, screenTitle?: string): string {
        const declarations: {type: string; data: any}[] = [];
        const xbmps = [];
        const xbmpsNames = [];
        const layerData = layers
            .sort((a: AbstractLayer, b: AbstractLayer) => a.index - b.index)
            .map((layer) => {
                const props = getLayerProperties(layer);
                if (layer instanceof AbstractImageLayer) {
                    const XBMP = imgDataToXBMP(layer.data, 0, 0, layer.size.x, layer.size.y).join(',');
                    if (xbmps.includes(XBMP)) {
                        props.imageName = xbmpsNames[xbmps.indexOf(XBMP)];
                    } else {
                        const name = layer.name ? toCppVariableName(layer.name) : 'paint';
                        const nameRegexp = new RegExp(`${name}_?\d*`);
                        const countWithSameName = xbmpsNames.filter((n) => nameRegexp.test(n)).length;
                        const varName = `image_${name + (countWithSameName || name == 'paint' ? `_${countWithSameName}` : '')}_bits`;
                        declarations.push({
                            type: 'bitmap',
                            data: {
                                name: varName,
                                value: XBMP,
                            },
                        });
                        xbmps.push(XBMP);
                        xbmpsNames.push(varName);
                        props.imageName = varName;
                    }
                } else if (layer instanceof GlyphLayer) {
                    const fontName = `u8g2_font_${layer.font.title}`;
                    const suffix = layer.font instanceof BDFFont ? getU8g2FontSuffix(layer.font) : '_tf';
                    props.fontName = `${fontName}${suffix}`;
                    props.codePoint = layer.codePoint;
                } else if (layer instanceof TextLayer) {
                    const fontName = `u8g2_font_${layer.font.title}`;
                    props.fontName = `${fontName}_tr`;
                }
                this.processLayerModifiers(layer, props);
                this.processVarDeclarations(layer, props, declarations);
                return props;
            });
        const source = this.templates[this.currentTemplate].template({
            declarations,
            layers: layerData,
            settings: Object.assign({}, this.settings, this.templates[this.currentTemplate].settings),
            screenTitle: screenTitle ? toCppVariableName(screenTitle) : '',
        });
        return source;
    }
    packColor(color: string): string {
        if (color === '#000000' || color === '0xFFFF') return '0';
        return '1';
    }
    getTextPosition(layer: TextLayer) {
        return [layer.position[0], layer.position[1]];
    }
}
