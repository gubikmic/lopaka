<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {BDFFont} from '/src/draw/fonts/bdf.font';
import {Font} from '/src/draw/fonts/font';

const props = defineProps<{
    font: Font;
    value: number;
}>();

const emit = defineEmits<{
    select: [codePoint: number];
}>();

const searchQuery = ref('');
const gridContainer = ref<HTMLElement>(null);

interface GlyphEntry {
    code: number;
    name: string;
    hex: string;
}

const allGlyphs = computed<GlyphEntry[]>(() => {
    const font = props.font;
    if (!(font instanceof BDFFont) || !font.fontData?.glyphs) return [];
    const entries: GlyphEntry[] = [];
    for (const [code, glyph] of font.fontData.glyphs) {
        entries.push({
            code,
            name: glyph.name ?? String.fromCodePoint(code),
            hex: `0x${code.toString(16).toUpperCase()}`,
        });
    }
    entries.sort((a, b) => a.code - b.code);
    return entries;
});

const filteredGlyphs = computed<GlyphEntry[]>(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return allGlyphs.value;
    return allGlyphs.value.filter(
        (g) =>
            g.name.toLowerCase().includes(query) ||
            g.hex.toLowerCase().includes(query) ||
            String(g.code).includes(query)
    );
});

function onSelect(glyph: GlyphEntry) {
    emit('select', glyph.code);
}

// Render a single glyph onto a small canvas
function renderGlyph(canvas: HTMLCanvasElement, code: number) {
    const font = props.font;
    if (!(font instanceof BDFFont) || !font.fontData?.glyphs) return;
    const glyph = font.fontData.glyphs.get(code);
    if (!glyph || !glyph.bytes || !glyph.bounds) return;

    const {meta, glyphs} = font.fontData;
    const bounds = glyph.bounds;
    const bytesPerRow = Math.ceil(bounds[2] / 8);

    // Calculate the glyph's pixel dimensions
    const glyphW = bounds[2];
    const glyphH = bounds[3];
    if (glyphW <= 0 || glyphH <= 0) return;

    // Size canvas to fit the glyph with some padding
    const pad = 2;
    const cw = Math.max(glyphW + pad * 2, 16);
    const ch = Math.max(glyphH + pad * 2, 16);
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#FFFFFF';

    // Center the glyph in the canvas
    const ox = Math.floor((cw - glyphW) / 2);
    const oy = Math.floor((ch - glyphH) / 2);

    for (let j = 0; j < glyphH; j++) {
        for (let k = 0; k < bytesPerRow; k++) {
            const byte = glyph.bytes[j * bytesPerRow + k];
            if (byte === undefined) continue;
            for (let l = 0; l < 8; l++) {
                if (byte & (1 << (7 - l))) {
                    const px = ox + k * 8 + l;
                    const py = oy + j;
                    if (px < cw && py < ch) {
                        ctx.fillRect(px, py, 1, 1);
                    }
                }
            }
        }
    }
}

// Scroll to the selected glyph when opened
function scrollToSelected() {
    nextTick(() => {
        if (!gridContainer.value) return;
        const el = gridContainer.value.querySelector('.glyph-selected');
        if (el) {
            el.scrollIntoView({block: 'nearest'});
        }
    });
}

onMounted(scrollToSelected);
watch(() => props.font, scrollToSelected);

// Directive-like approach: render glyph after the element is mounted
function onCanvasMounted(el: HTMLCanvasElement, code: number) {
    renderGlyph(el, code);
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search glyphs..."
            class="input input-xs input-bordered w-full"
        />
        <div
            ref="gridContainer"
            class="glyph-grid max-h-[200px] overflow-y-auto overflow-x-hidden"
        >
            <div class="grid grid-cols-4 gap-1 p-0.5">
                <div
                    v-for="glyph in filteredGlyphs"
                    :key="glyph.code"
                    class="glyph-cell flex flex-col items-center cursor-pointer rounded p-0.5 hover:bg-base-300"
                    :class="{'glyph-selected bg-neutral text-primary': glyph.code === value}"
                    :title="`${glyph.name} (${glyph.hex})`"
                    @click="onSelect(glyph)"
                >
                    <canvas
                        class="glyph-canvas"
                        :ref="(el) => el && onCanvasMounted(el as HTMLCanvasElement, glyph.code)"
                    />
                    <span class="text-[9px] opacity-60 leading-tight">{{ glyph.hex }}</span>
                </div>
            </div>
            <div
                v-if="filteredGlyphs.length === 0 && searchQuery.trim()"
                class="text-center text-gray-500 text-xs py-4"
            >
                No glyphs found
            </div>
            <div
                v-if="allGlyphs.length === 0"
                class="text-center text-gray-500 text-xs py-4"
            >
                Font has no glyph data
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.glyph-canvas {
    image-rendering: pixelated;
    width: 32px;
    height: 32px;
    background: #1a1a2e;
    border-radius: 2px;
}
</style>
