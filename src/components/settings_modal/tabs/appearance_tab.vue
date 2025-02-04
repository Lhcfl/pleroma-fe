<template>
  <div class="appearance-tab" :label="$t('settings.general')">
    <div class="setting-item">
      <h2>{{ $t('settings.theme') }}</h2>
      <ul
        class="theme-list"
        ref="themeList"
      >
        <button
          v-if="isCustomThemeUsed"
          disabled
          class="button-default theme-preview"
        >
          <preview />
          <h4 class="theme-name">{{ $t('settings.style.custom_theme_used') }}</h4>
        </button>
        <button
          v-for="style in availableStyles"
          :data-theme-key="style.key"
          :key="style.key"
          class="button-default theme-preview"
          :class="{ toggled: isThemeActive(style.key) }"
          @click="setTheme(style.key)"
        >
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <component
            :is="'style'"
            v-if="style.ready || noIntersectionObserver"
            v-html="previewTheme(style.key, style.data)"
          />
          <!-- eslint-enable vue/no-v-text-v-html-on-component -->
          <preview :class="{ placeholder: ready }" :id="'theme-preview-' + style.key"/>
          <h4 class="theme-name">{{ style.name }}</h4>
        </button>
      </ul>
    </div>
    <div class="alert neutral theme-notice">
      {{ $t("settings.style.appearance_tab_note") }}
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.scale_and_layout') }}</h2>
      <ul class="setting-list">
        <li>
          <UnitSetting
            path="textSize"
            step="0.1"
            :units="['px', 'rem']"
            :reset-default="{ 'px': 14, 'rem': 1 }"
            timed-apply-mode
          >
            {{ $t('settings.text_size') }}
          </UnitSetting>
          <div>
            <small>
              <i18n-t
                scope="global"
                keypath="settings.text_size_tip"
                tag="span"
              >
                <code>px</code>
                <code>rem</code>
              </i18n-t>
              <br/>
              <i18n-t
                scope="global"
                keypath="settings.text_size_tip2"
                tag="span"
              >
                <code>14px</code>
              </i18n-t>
            </small>
          </div>
        </li>
        <li>
          <h3>{{ $t('settings.style.interface_font_user_override') }}</h3>
          <ul class="setting-list">
            <li>
              <FontControl
                :model-value="mergedConfig.theme3hacks.fonts.interface"
                name="ui"
                :label="$t('settings.style.fonts.components.interface')"
                :fallback="{ family: 'sans-serif' }"
                no-inherit="1"
                @update:modelValue="v => updateFont('interface', v)"
              />
            </li>
            <li>
              <FontControl
                v-if="expertLevel > 0"
                :model-value="mergedConfig.theme3hacks.fonts.input"
                name="input"
                :fallback="{ family: 'inherit' }"
                :label="$t('settings.style.fonts.components.input')"
                @update:modelValue="v => updateFont('input', v)"
              />
            </li>
            <li>
              <FontControl
                v-if="expertLevel > 0"
                :model-value="mergedConfig.theme3hacks.fonts.post"
                name="post"
                :fallback="{ family: 'inherit' }"
                :label="$t('settings.style.fonts.components.post')"
                @update:modelValue="v => updateFont('post', v)"
              />
            </li>
            <li>
              <FontControl
                v-if="expertLevel > 0"
                :model-value="mergedConfig.theme3hacks.fonts.monospace"
                name="postCode"
                :fallback="{ family: 'monospace' }"
                :label="$t('settings.style.fonts.components.monospace')"
                @update:modelValue="v => updateFont('monospace', v)"
              />
            </li>
          </ul>
        </li>
        <li>
          <UnitSetting
            path="emojiSize"
            step="0.1"
            :units="['px', 'rem']"
            :reset-default="{ 'px': 32, 'rem': 2.2 }"
          >
            {{ $t('settings.emoji_size') }}
          </UnitSetting>
          <ul
            class="setting-list suboptions"
          >
            <li>
              <FloatSetting
                v-if="user"
                path="emojiReactionsScale"
                expert="1"
              >
                {{ $t('settings.emoji_reactions_scale') }}
              </FloatSetting>
            </li>
          </ul>
        </li>
        <li>
          <UnitSetting
            path="navbarSize"
            step="0.1"
            :units="['px', 'rem']"
            :reset-default="{ 'px': 55, 'rem': 3.5 }"
          >
            {{ $t('settings.navbar_size') }}
          </UnitSetting>
        </li>
        <h3>{{ $t('settings.columns') }}</h3>
        <li>
          <UnitSetting
            path="panelHeaderSize"
            step="0.1"
            :units="['px', 'rem']"
            :reset-default="{ 'px': 52, 'rem': 3.2 }"
            timed-apply-mode
          >
            {{ $t('settings.panel_header_size') }}
          </UnitSetting>
        </li>
        <li>
          <BooleanSetting path="sidebarRight">
            {{ $t('settings.right_sidebar') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="navbarColumnStretch">
            {{ $t('settings.navbar_column_stretch') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            v-if="user"
            id="thirdColumnMode"
            path="thirdColumnMode"
            :options="thirdColumnModeOptions"
          >
            {{ $t('settings.third_column_mode') }}
          </ChoiceSetting>
        </li>
        <li v-if="expertLevel > 0">
          {{ $t('settings.column_sizes') }}
          <div class="column-settings">
            <UnitSetting
              v-for="column in columns"
              :key="column"
              :path="column + 'ColumnWidth'"
              :units="horizontalUnits"
              expert="1"
            >
              {{ $t('settings.column_sizes_' + column) }}
            </UnitSetting>
          </div>
        </li>
        <li>
          <BooleanSetting path="disableStickyHeaders">
            {{ $t('settings.disable_sticky_headers') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="showScrollbars">
            {{ $t('settings.show_scrollbars') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.visual_tweaks') }}</h2>
      <ul class="setting-list">
        <li>
          <ChoiceSetting
            id="forcedRoundness"
            path="forcedRoundness"
            :options="forcedRoundnessOptions"
          >
            {{ $t('settings.style.themes3.hacks.force_interface_roundness') }}
          </ChoiceSetting>
        </li>
        <li>
          <ChoiceSetting
            id="underlayOverride"
            path="theme3hacks.underlay"
            :options="underlayOverrideModes"
          >
            {{ $t('settings.style.themes3.hacks.underlay_overrides') }}
          </ChoiceSetting>
        </li>
        <li v-if="instanceWallpaperUsed">
          <BooleanSetting path="hideInstanceWallpaper">
            {{ $t('settings.hide_wallpaper') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="forceThemeRecompilation"
            :expert="1"
          >
            {{ $t('settings.force_theme_recompilation_debug') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="themeDebug"
            :expert="1"
          >
            {{ $t('settings.theme_debug') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./appearance_tab.js"></script>

<style lang="scss">
.appearance-tab {
  .theme-notice {
    padding: 0.5em;
    margin: 1em;
  }

  .column-settings {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }

  .column-settings .size-label {
    display: block;
    margin-bottom: 0.5em;
    margin-top: 0.5em;
  }

  .theme-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    margin: -0.5em 0;
    height: 25em;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
    border-radius: var(--roundness);
    border: 1px solid var(--border);
    padding: 0;

    .theme-preview {
      font-size: 1rem; // fix for firefox
      width: 19rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0.5em;

      &.placeholder {
        opacity: 0.2;
      }

      .theme-preview-container {
        pointer-events: none;
        zoom: 0.5;
        border: none;
        border-radius: var(--roundness);
        text-align: left;
      }
    }
  }
}
</style>
