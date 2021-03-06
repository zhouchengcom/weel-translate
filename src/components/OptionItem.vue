<template>
  <div class="option-item" v-if="item.test ? testItem(item.test) : true">
    <mdc-headline v-if="!!item.headline">{{ item.headline }}</mdc-headline>
    <mdc-subheading v-if="!!item.subheading">{{ item.subheading }}</mdc-subheading>

    <template v-for="(m, n) in item.values">
      <mdc-radio :key="`${item.name}_${m[0]}_${n}`"
        v-if="item.type === 'radio'"
        :name="item.name" :value="m[1]" :label="m[0]"
        :checked="m[1] === item.value"
        :picked="item.value" @change="value => emitChange(item.name, value)"
      />
    </template>
    
    <mdc-checkbox
      v-if="item.type === 'checkbox'"
      :name="item.name" :label="item.label"
      :checked="item.value" @change="value => emitChange(item.name, value)"
    />

    <mdc-slider
      v-if="item.type === 'slider'"
      :min="item.meta.min" :max="item.meta.max" :step="item.meta.step" display-markers
      :name="item.name"
      :value="item.value" @change="value => emitChange(item.name, value)"
    />

    <section v-if="item.type === 'color'">
      <mdc-button :style="{ backgroundColor: color || item.value, color: tcolor }"
        @click="color = item.value; currentColorName = item.name"
      >{{ color || item.value }}</mdc-button>
      <mdc-button style="margin-left: 4px;" v-if="!!currentColorName" @click="handleColor(color)">{{ $t('ok') }}</mdc-button>
      <color-picker class="-color-selector" v-if="!!currentColorName"
        :value="color"
        @change="({ hex }) => { this.color = hex }"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Watch, Vue } from 'vue-property-decorator';
import ColorPicker from '@/components/ColorPickerBase.vue';
import debug from '@/functions/debug';

@Component({
  components: {
    ColorPicker,
  },
})
export default class OptionItem extends Vue {
  @Prop(Object) private item!: any;
  @Prop(Object) private values!: { [k: string]: any };

  private currentColorName: string = '';
  private color: string = '';
  private tcolor: string = '#ffffff';

  private testItem([key, value]: [string, any]): boolean {
    return this.values[key] === value;
  }

  private handleColor(hex: string) {
    const [name, color] = [this.currentColorName, (this.color as any).hex || hex];
    this.emitChange(name, color);
    this.color = '';
    this.currentColorName = '';
  }

  @Emit('change')
  private emitChange(key: string, value: any) { return [key, value]; }
}
</script>

<style lang="scss">
.option-item {
  .mdc-headline,
  .mdc-subheading {
    width: 100%;
    margin: 8px 0;
    flex-shrink: 0;
  }
  .mdc-headline {
    border-radius: 0 16px 16px 0;
    background-color: var(--mdc-theme-primary, #6200ee);
    color: var(--mdc-theme-text-primary-on-dark, #ffffff);
    font-size: 1rem;
    position: relative;
    &::before {
      content: "";
      background-color: var(--mdc-theme-primary, #6200ee);
      height: 100%;
      width: 16px;
      margin: auto;
      left: -16px;
      top: 0;
      bottom: 0;
      position: absolute;
      display: block;
    }
  }
  .mdc-subheading {
    font-size: .75rem;
  }

  .-color-selector {
    margin-top: 8px;
  }
}
</style>

