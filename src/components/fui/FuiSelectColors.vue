<script lang="ts" setup>
import {ref, toRefs, watch} from 'vue';
import {useSession} from '../../core/session';

const session = useSession();
const {preparePlatform} = session;

const color_bg = ref(session.platforms[session.state.platform].features.screenBgColor);
const invertScreen = ref(session.platforms[session.state.platform].features.invertScreen ?? false);

const emit = defineEmits<{
    'update:color_bg': [value: string];
}>();

watch(color_bg, (val, oldVal) => {
    if (val !== oldVal) {
        session.platforms[session.state.platform].features.screenBgColor = val;
        preparePlatform(session.state.platform);
        localStorage.setItem(`lopaka_${session.state.platform}_color_bg`, val);
    }
});

watch(invertScreen, (val) => {
    session.platforms[session.state.platform].features.invertScreen = val;
    localStorage.setItem(`lopaka_${session.state.platform}_invert_screen`, String(val));
    session.virtualScreen.redraw();
});
</script>
<template>
    <div class="fui-select fui-platforms">
        <label class="flex items-center gap-2">
            Background:
            <input
                class="text-primary select select-bordered select-sm w-16 pl-0 pr-1"
                type="color"
                v-model="color_bg"
                list="presetColors"
            />
        </label>
        <label class="flex items-center gap-2 ml-2">
            <input
                type="checkbox"
                class="checkbox checkbox-sm"
                v-model="invertScreen"
            />
            Invert
        </label>
    </div>
</template>
<style lang="css"></style>
