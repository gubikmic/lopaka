import {getFont} from '../../draw/fonts';
import {Font} from '../../draw/fonts/font';
import {TPlatformFeatures} from '../../platforms/platform';
import {mapping} from '../decorators/mapping';
import {Point} from '../point';
import {Rect} from '../rect';
import {AbstractLayer, EditMode, TLayerEditPoint, TLayerModifiers, TModifierType} from './abstract.layer';
import {AbstractDrawingRenderer} from '../../draw/renderers';

export class GlyphLayer extends AbstractLayer {
    protected type: ELayerType = 'glyph';
    protected editState: {
        firstPoint: Point;
        position: Point;
    } = null;

    @mapping('p', 'point') public position: Point = new Point();
    @mapping('d') public codePoint: number = 65;
    @mapping('f', 'font') public font: Font;

    modifiers: TLayerModifiers = {
        x: {
            getValue: () => this.position.x,
            setValue: (v: number) => {
                this.position.x = v;
                this.updateBounds();
                this.draw();
            },
            getVariable: (name: string) => this.variables[name] ?? false,
            setVariable: (name: string, enabled: boolean) => {
                this.variables[name] = enabled;
            },
            type: TModifierType.number,
        },
        y: {
            getValue: () => this.position.y,
            setValue: (v: number) => {
                this.position.y = v;
                this.updateBounds();
                this.draw();
            },
            getVariable: (name: string) => this.variables[name] ?? false,
            setVariable: (name: string, enabled: boolean) => {
                this.variables[name] = enabled;
            },
            type: TModifierType.number,
        },
        font: {
            getValue: () => this.font?.name,
            setValue: (v: string) => {
                this.font = getFont(v);
                this.updateBounds();
                this.draw();
            },
            type: TModifierType.font,
        },
        codePoint: {
            getValue: () => this.codePoint,
            setValue: (v: number) => {
                this.codePoint = Math.max(0, parseInt(String(v)) || 0);
                this.updateBounds();
                this.draw();
            },
            getVariable: (name: string) => this.variables[name] ?? false,
            setVariable: (name: string, enabled: boolean) => {
                this.variables[name] = enabled;
            },
            type: TModifierType.number,
        },
        color: {
            getValue: () => this.color,
            setValue: (v: string) => {
                this.color = v;
                this.updateBounds();
                this.draw();
            },
            getVariable: (name: string) => this.variables[name] ?? false,
            setVariable: (name: string, enabled: boolean) => {
                this.variables[name] = enabled;
            },
            type: TModifierType.color,
        },
        inverted: {
            getValue: () => this.inverted,
            setValue: (v: boolean) => {
                this.inverted = v;
                this.draw();
            },
            type: TModifierType.boolean,
        },
    };

    editPoints: TLayerEditPoint[] = [];

    private platformId?: string;

    constructor(
        protected features: TPlatformFeatures,
        renderer?: AbstractDrawingRenderer,
        font?: Font,
        platformId?: string
    ) {
        super(features, renderer);
        this.platformId = platformId;

        if (!this.features.hasRGBSupport && !this.features.hasIndexedColors) {
            delete this.modifiers.color;
        }
        if (!this.features.hasInvertedColors) {
            delete this.modifiers.inverted;
        }
        if (font) {
            this.font = font;
        }
        this.color = this.features.defaultColor;
    }

    private getGlyphChar(): string {
        return String.fromCodePoint(this.codePoint);
    }

    startEdit(mode: EditMode, point: Point, editPoint?: TLayerEditPoint) {
        this.pushHistory();
        this.mode = mode;
        if (mode == EditMode.CREATING) {
            this.position = point.clone();
            this.updateBounds();
            this.draw();
        }
        this.editState = {
            firstPoint: point,
            position: this.position.clone(),
        };
    }

    edit(point: Point, originalEvent: MouseEvent | TouchEvent) {
        if (!this.editState) {
            return;
        }
        const {position, firstPoint} = this.editState;
        switch (this.mode) {
            case EditMode.MOVING:
                this.position = position.clone().add(point.clone().subtract(firstPoint)).round();
                break;
            case EditMode.CREATING:
                this.position = point.clone();
                break;
        }
        this.updateBounds();
        this.draw();
    }

    stopEdit() {
        this.mode = EditMode.NONE;
        this.editState = null;
        this.pushRedoHistory();
    }

    draw() {
        this.renderer.drawText(this.position, this.getGlyphChar(), this.font, 1, this.color);

        // Draw transparent overlay for bounds (used for selection/interaction)
        const ctx = this.renderer.dc.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.beginPath();
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        ctx.fill();
        ctx.restore();
    }

    onLoadState() {
        this.updateBounds();
        this.mode = EditMode.NONE;
    }

    updateBounds(): void {
        const {dc, font, position} = this;
        const size = font.getSize(dc, this.getGlyphChar());
        this.bounds = new Rect(position.clone().subtract(0, size.y), size);
    }

    protected createCloneInstance(): this {
        const RendererCtor = this.renderer.constructor as new () => AbstractDrawingRenderer;
        const renderer = new RendererCtor();
        return new GlyphLayer(this.features, renderer, this.font, this.platformId) as this;
    }
}
