<template>
  <div id="style-transfer">
    <div class="flex-container">
      <div class="box">
        <h1>Content</h1>
        <input @change="uploadContent" class="content-input" type="file" accept="image/*"/>
        <div>
          <img id="transfer-content" :src="contentUrl" alt="content">
        </div>
      </div>

      <div class="box">
        <h1>Style</h1>
        <el-select :value="styleName" @change="selectStyle" placeholder="Choose a style">
          <el-option v-for="name of styleNames" :key="name" :label="name" :value="name"></el-option>
        </el-select>
        <div>
          <img id="transfer-style" :src="styleUrl" alt="style">
        </div>
      </div>
    </div>

    <div>
      <el-button type="primary" :loading="startBtnLoading" @click="startTransfer">Start!</el-button>
    </div>

    <div id="output">
      <keep-alive>
        <canvas :key="'my-output'" ref="output" id="output-canvas" width="1" height="1"></canvas>
      </keep-alive>
    </div>
  </div>
</template>

<style>
  #style-transfer {
    width: 100%;
    text-align: center;
  }

  #transfer-content, #transfer-style {
    margin: 1rem;
    max-width: 40vw;
    max-height: 40vh;
  }

  .flex-container {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
  }
</style>

<script lang="ts" src="./style-transfer.component.ts"></script>
