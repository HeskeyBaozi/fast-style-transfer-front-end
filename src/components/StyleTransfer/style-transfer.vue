<template>
  <div id="style-transfer">

    <div class="row">
      <section class="list">
        <h1>Content</h1>
        <img v-show="contentUrl" ref="content" id="transfer-content" class="box" :src="contentUrl" alt="content">
        <mu-raised-button primary label="Choose">
          <input @change="uploadContent" class="file-button" type="file" accept="image/*"/>
        </mu-raised-button>
      </section>

      <section class="list">
        <h1>Style</h1>
        <mu-toast v-show="toast" :message="`${styleName} downloaded.`"/>
        <img v-show="styleUrl" id="transfer-style" class="box" :src="styleUrl" alt="style">
        <mu-raised-button @click="downloadModel" primary label="Download Vars"
                          :disabled="styleName && isDownloading"></mu-raised-button>
        <mu-select-field :value="styleName" @input="selectStyle" :labelFocusClass="['label-foucs']"
                         label="Choose a style">
          <mu-menu-item v-for="name of styleNames" :key="name" :value="name" :title="name"/>
        </mu-select-field>
      </section>
    </div>

    <mu-divider/>
    <div>
      <mu-switch label="使用原图" v-model="useOrigin"/>
    </div>
    <mu-raised-button secondary :disabled="!startable || startBtnLoading"
                      @click="startTransfer">Start!
    </mu-raised-button>
    <div id="log">
      <p>{{ log }}</p>
      <mu-circular-progress v-show="progress !== 0 && progress !== 100" mode="determinate" :size="100" :strokeWidth="5"
                            :value="progress"/>
    </div>
    <mu-divider/>
    <div id="output">
      <keep-alive>
        <canvas class="box" :key="'my-output'" ref="output" id="output-canvas" width="1" height="1"></canvas>
      </keep-alive>
    </div>
    <mu-divider/>
    <div id="step">
      <layer-preview class="box" v-for="(layer, name) of transformNetwork.step" :key="name" :name="name"
                     :layer="layer"></layer-preview>
    </div>
  </div>
</template>

<style lang="less" scoped>
  #style-transfer {

    text-align: center;
    padding: 1rem 0;
    > * {
      margin: 0 0 1rem 0;
      &:last-child {
        margin: 0;
      }
    }

    .row {
      display: flex;
      flex-flow: row nowrap;
      align-items: start;
      justify-content: center;
    }

    .list {
      width: 50vw;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      padding: 0 1rem;

      > * {
        margin: 0 0 1rem 0;
        &:last-child {
          margin: 0;
        }
      }

      img {
        max-width: 550px;
      }

      .file-button {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        opacity: 0;
      }

      .box {
        box-shadow: 1px 1px 1rem #5c5c5c;
      }
    }

    #log {
    }

    #output {
      min-height: 30vh;
    }
  }
</style>

<script lang="ts" src="./style-transfer.component.ts"></script>
