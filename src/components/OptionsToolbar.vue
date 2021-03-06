<template>
  <mdc-toolbar class="options-toolbar" fixed ref="wrap">
    <mdc-toolbar-row>
      <mdc-toolbar-section align-start>
        <mdc-toolbar-menu-icon event="toggle-drawer" style="padding: 0;">
          <mdc-icon>
            <icon-menu />
          </mdc-icon>
        </mdc-toolbar-menu-icon>
        <mdc-toolbar-title>{{ $t(title) }}</mdc-toolbar-title>
      </mdc-toolbar-section>
    </mdc-toolbar-row>
  </mdc-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';
import IconMenu from '@/components/icons/Menu.vue';
import debug from '@/functions/debug';
import { ActionMethod } from 'vuex';

const _ = namespace('preference');
const __ = namespace('translation');

@Component({
  components: {
    IconMenu,
  },
})
export default class OptionsToolbar extends Vue {
  @_.Action('reset') private resetPreference!: ActionMethod;

  @__.State private source!: SourcePresetItem;
  @__.State private enabledSources!: SourcePresetItem[];
  @__.Action('source') private changeSource!: ActionMethod;

  private title: string = '';
  private sourceMenu: boolean = false;

  @Prop(Boolean)
  private raised?: boolean;

  private created() {
    const { title, locale } = this.$route.meta;

    this.title = title || locale || '';
  }

  private handleSourceSelect(target: any) {
    const id = target.item.getAttribute('data-id');
    this.changeSource(id);
  }

  private handlePreferenceReset() {
    this.resetPreference();
  }

  @Watch('raised')
  private onScrollReachStart(val: boolean, old: boolean) {
    const [max, min, cls] = [
      'mdc-toolbar--flexible-space-maximized',
      'mdc-toolbar--flexible-space-minimized',
      (this.$refs.wrap as any).$el.firstChild.classList,
    ];
    if (val) {
      cls.remove(max);
      cls.add(min);
    } else {
      cls.remove(min);
      cls.add(max);
    }
  }

  @Watch('$route.meta')
  private onViewChanged({ title, locale }: any) {
    this.title = title || locale;
  }
}
</script>

<style lang="scss">
.options-toolbar {
  .mdc-toolbar {
    width: 100%;
    flex-shrink: 0;
    position: relative;

    @media (max-width:959px) and (orientation:landscape){
      .mdc-toolbar__section{
        padding: 8px;
      }
    }
  }

  button.-spec {
    background-color: #5800d5;
    border-radius: 24px;
    max-width: 96px;
    color: white;
    margin: auto;
    margin-right: 8px;

    &.-source + .mdc-menu-anchor > .mdc-menu {
      margin: 8px;
    }
  }
}
</style>

