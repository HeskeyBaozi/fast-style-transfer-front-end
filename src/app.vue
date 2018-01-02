<template>
  <div id="app">
    <div class="banner">
      <p class="leading">Style Transfer Front End</p>
      <p class="leading-2">在前端的快速风格迁移</p>
      <p>第<strong>五</strong>小组 何志宇 高阳 郭柱明 范永业 傅成钢 高欢宇</p>
    </div>
    <style-transfer/>
  </div>
</template>

<style>
  body {
    font-size: 16px;
    box-sizing: border-box;
    font-family: "Proxima Nova Rg", "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
</style>

<style lang="less" scoped>
  #app {
    .banner {
      padding: 7rem 0;
      text-align: center;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      color: white;
      text-shadow: 0 0 .5rem #5c5c5c;
      background-image: linear-gradient(60deg, #3d3393 0%, #2b76b9 37%, #2cacd1 65%, #35eb93 100%);

      > * {
        margin: 0 0 1rem 0;
        &:last-child {
          margin: 0;
        }
      }

      .leading {
        font-size: 3rem;
      }

      .leading-2 {
        font-size: 2rem;
      }
    }
  }
</style>

<script lang="ts" src="./app.layout.ts"></script>
