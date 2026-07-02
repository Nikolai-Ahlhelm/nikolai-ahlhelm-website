"use client";

import {
  presets,
  ShaderGradient,
  ShaderGradientCanvas,
} from "@shadergradient/react";

const interstellaShaderProps = {
  ...presets.interstella.props,
  bgColor1: "#000000",
  bgColor2: "#000000",
} as unknown as Parameters<typeof ShaderGradient>[0];

export function ShaderBackground() {
  return (
    <div aria-hidden="true" className="shader-background">
      <ShaderGradientCanvas
        envBasePath="/shadergradient/"
        fov={45}
        pixelDensity={1}
        style={{ height: "100%", width: "100%" }}
      >
        <ShaderGradient {...interstellaShaderProps} />
      </ShaderGradientCanvas>
    </div>
  );
}
