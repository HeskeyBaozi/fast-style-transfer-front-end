<template>
  <div id="layer-preview">
    <p>{{ name }}, channels = {{ layer.layer.shape[2] }}</p>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script lang="ts" src="./layer-preview.component.ts"></script>
