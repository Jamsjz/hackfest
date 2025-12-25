"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function InteractivePortrait() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const gu = {
      time: { value: 0 },
      dTime: { value: 0 },
      aspect: { value: width / height },
    }

    const scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xffffff) // Removed to show dark CSS background

    // Dynamic Dots Background
    const dotsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: gu.time,
        resolution: { value: new THREE.Vector2(width, height) },
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          vec2 st = gl_FragCoord.xy / resolution.xy;
          st.x *= resolution.x / resolution.y; // Correct aspect ratio
          
          float scale = 40.0; 
          vec2 grid = st * scale;
          
          // Dynamic movement (Subtle waving)
          grid.x += sin(time * 0.2 + grid.y * 0.5) * 0.1;
          grid.y += cos(time * 0.15 + grid.x * 0.5) * 0.1;
          
          vec2 fpos = fract(grid);
          
          float d = length(fpos - 0.5);
          float alpha = 1.0 - smoothstep(0.05, 0.08, d);
          
          gl_FragColor = vec4(color, alpha * 0.15);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    const dotsPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), dotsMaterial)
    dotsPlane.position.z = -0.5 // Behind everything
    scene.add(dotsPlane)

    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    class Blob {
      renderer: THREE.WebGLRenderer
      fbTexture: { value: THREE.FramebufferTexture }
      rtOutput: THREE.WebGLRenderTarget
      uniforms: {
        pointer: { value: THREE.Vector2 }
        pointerDown: { value: number }
        pointerRadius: { value: number }
        pointerDuration: { value: number }
      }
      rtScene: THREE.Mesh
      rtCamera: THREE.Camera

      constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer
        this.fbTexture = { value: new THREE.FramebufferTexture(width, height) }
        this.rtOutput = new THREE.WebGLRenderTarget(width, height)
        this.uniforms = {
          pointer: { value: new THREE.Vector2().setScalar(10) },
          pointerDown: { value: 1 },
          pointerRadius: { value: 0.35 },
          pointerDuration: { value: 2.5 },
        }

        const handleMouseMove = (event: MouseEvent) => {
          const rect = container.getBoundingClientRect()
          this.uniforms.pointer.value.x = ((event.clientX - rect.left) / width) * 2 - 1
          this.uniforms.pointer.value.y = -((event.clientY - rect.top) / height) * 2 + 1
        }

        const handleMouseLeave = () => {
          this.uniforms.pointer.value.setScalar(10)
        }

        container.addEventListener("mousemove", handleMouseMove)
        container.addEventListener("mouseleave", handleMouseLeave)

        const blobMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
        })

          ; (blobMaterial as any).onBeforeCompile = (shader: any) => {
            shader.uniforms.dTime = gu.dTime
            shader.uniforms.aspect = gu.aspect
            shader.uniforms.pointer = this.uniforms.pointer
            shader.uniforms.pointerDown = this.uniforms.pointerDown
            shader.uniforms.pointerRadius = this.uniforms.pointerRadius
            shader.uniforms.pointerDuration = this.uniforms.pointerDuration
            shader.uniforms.fbTexture = this.fbTexture
            shader.uniforms.time = gu.time
            shader.fragmentShader = `
                uniform float dTime, aspect, pointerDown, pointerRadius, pointerDuration, time;
                uniform vec2 pointer;
                uniform sampler2D fbTexture;
                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                float noise(vec2 p) {
                  vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
                  float a = hash(i); float b = hash(i + vec2(1.,0.)); float c = hash(i + vec2(0.,1.)); float d = hash(i + vec2(1.,1.));
                  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
                }
                ${shader.fragmentShader}
              `.replace(
              `#include <color_fragment>`,
              `#include <color_fragment>
                float rVal = texture2D(fbTexture, vUv).r;
                rVal -= clamp(dTime / pointerDuration, 0., 0.05);
                rVal = clamp(rVal, 0., 1.);
                float f = 0.;
                if (pointerDown > 0.5) {
                  vec2 uv = (vUv - 0.5) * 2. * vec2(aspect, 1.);
                  vec2 mouse = pointer * vec2(aspect, 1.);
                  vec2 toMouse = uv - mouse;
                  float angle = atan(toMouse.y, toMouse.x);
                  float dist = length(toMouse);
                  float noiseVal = noise(vec2(angle*3. + time*0.5, dist*5.));
                  float noiseVal2 = noise(vec2(angle*5. - time*0.3, dist*3. + time));
                  float radiusVariation = 0.7 + noiseVal*0.5 + noiseVal2*0.3;
                  float organicRadius = pointerRadius * radiusVariation;
                  f = 1. - smoothstep(organicRadius*0.05, organicRadius*1.2, dist);
                  f *= 0.8 + noiseVal*0.2;
                }
                rVal += f * 0.25;
                rVal = clamp(rVal, 0., 1.);
                diffuseColor.rgb = vec3(rVal);
                `,
            )
          }

        this.rtScene = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          blobMaterial,
        )
          ; (this.rtScene.material as any).defines = { USE_UV: "" }
        this.rtCamera = new THREE.Camera()
      }

      render() {
        this.renderer.setRenderTarget(this.rtOutput)
        this.renderer.render(this.rtScene, this.rtCamera)
        this.renderer.copyFramebufferToTexture(this.fbTexture.value)
        this.renderer.setRenderTarget(null)
      }
    }

    const blob = new Blob(renderer)

    const textureLoader = new THREE.TextureLoader()

    // Function to calculate contain-fit dimensions (fits entirely, no crop)
    // Scale factor controls the final size relative to the viewport
    const scaleFactor = 1.25 // Make images 125% of viewport for larger display
    const calculateContainDimensions = (imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number) => {
      const imgAspect = imgWidth / imgHeight
      const containerAspect = containerWidth / containerHeight
      let planeWidth, planeHeight

      // Contain behavior: fit entirely within container, no cropping
      if (imgAspect > containerAspect) {
        // Image is wider - constrain by width
        planeWidth = containerWidth * scaleFactor
        planeHeight = (containerWidth * scaleFactor) / imgAspect
      } else {
        // Image is taller - constrain by height
        planeHeight = containerHeight * scaleFactor
        planeWidth = (containerHeight * scaleFactor) * imgAspect
      }
      return { planeWidth, planeHeight }
    }

    // Create materials first (without textures initially)
    const baseImageMaterial = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.0 })
    const helmetImageMaterial = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.0 })

    // Create meshes with temporary geometry (will be updated when textures load)
    const baseImage = new THREE.Mesh(new THREE.PlaneGeometry(width, height), baseImageMaterial)
    const helmetImage = new THREE.Mesh(new THREE.PlaneGeometry(width, height), helmetImageMaterial)
    scene.add(baseImage)

    // Declare texture variables
    let baseTexture: THREE.Texture
    let helmetTexture: THREE.Texture

    // Function to update both image geometries
    const updateImageGeometries = () => {
      if (baseTexture?.image && helmetTexture?.image) {
        // Use the base texture dimensions for both (they should match)
        const img = baseTexture.image as HTMLImageElement
        const { planeWidth, planeHeight } = calculateContainDimensions(img.width, img.height, width, height)

        baseImage.geometry.dispose()
        baseImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)

        helmetImage.geometry.dispose()
        helmetImage.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
      }
    }

    // Load textures - fix path to include leading slash
    baseTexture = textureLoader.load("/images/hero-off.png", (texture) => {
      baseImageMaterial.map = texture
      texture.colorSpace = THREE.SRGBColorSpace
      baseImageMaterial.needsUpdate = true
      updateImageGeometries()
    })

    helmetTexture = textureLoader.load("/images/hero-on.png", (texture) => {
      helmetImageMaterial.map = texture
      texture.colorSpace = THREE.SRGBColorSpace
      helmetImageMaterial.needsUpdate = true
      updateImageGeometries()
    })

    const bgPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1f1a, transparent: true })
      ; (bgPlaneMaterial as any).defines = { USE_UV: "" }

    bgPlaneMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.texBlob = { value: blob.rtOutput.texture }
      shader.uniforms.time = gu.time

      let vertexShader = shader.vertexShader
      vertexShader = vertexShader.replace("void main() {", "varying vec4 vPosProj;\nvoid main() {")
      vertexShader = vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvPosProj = gl_Position;",
      )
      shader.vertexShader = vertexShader

      shader.fragmentShader = `
        uniform sampler2D texBlob; 
        uniform float time; 
        varying vec4 vPosProj;

        // Função de ruído simples
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
        float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);float a=hash(i);float b=hash(i+vec2(1.,0.));float c=hash(i+vec2(0.,1.));float d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
        
        // Função de ruído orgânico (fBm)
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 4; i++) {
                value += amplitude * noise(p);
                p *= 2.1;
                amplitude *= 0.3;
            }
            return value;
        }

        ${shader.fragmentShader}
      `.replace(
        `#include <clipping_planes_fragment>`,
        `
        // A lógica da máscara continua a mesma
        vec2 blobUV=((vPosProj.xy/vPosProj.w)+1.)*0.5;
        vec4 blobData=texture(texBlob,blobUV);
        if(blobData.r<0.02)discard;

        // <<< LÓGICA ATUALIZADA PARA ANIMAÇÃO LÍQUIDA (DOMAIN WARPING) >>>

        // 1. Define as cores
        vec3 colorBg = vec3(1.0);
        vec3 colorSoftShape = vec3(0.92);
        vec3 colorLine = vec3(0.8);

        // 2. Coordenada base da textura (controla o "zoom")
        vec2 uv = vUv * 3.5;

        // 3. Cria um "campo de distorção" que muda com o tempo
        // Este é o nosso "líquido invisível" que vai mover a textura
        vec2 distortionField = vUv * 2.0;
        float distortion = fbm(distortionField + time * 0.2); // O campo de distorção se move lentamente

        // 4. Aplica a distorção (warp) às coordenadas da textura principal
        // Usamos o 'distortion' para empurrar as coordenadas 'uv'
        float distortionStrength = 0.7; // <-- CONTROLE A INTENSIDADE AQUI
        vec2 warpedUv = uv + (distortion - 0.5) * distortionStrength;
        
        // 5. Gera o valor final do ruído a partir das coordenadas distorcidas
        float n = fbm(warpedUv);

        // O resto da lógica para desenhar as formas e linhas permanece o mesmo
        float softShapeMix = smoothstep(0.1, 0.9, sin(n * 3.0));
        vec3 baseColor = mix(colorBg, colorSoftShape, softShapeMix);
        float linePattern = fract(n * 15.0);
        float lineMix = 1.0 - smoothstep(0.49, 0.51, linePattern);
        vec3 finalColor = mix(baseColor, colorLine, lineMix);

        diffuseColor.rgb = finalColor;
        #include <clipping_planes_fragment>
        `,
      )
    }

    const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), bgPlaneMaterial)
    scene.add(bgPlane)

    helmetImageMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.texBlob = { value: blob.rtOutput.texture }
      let vertexShader = shader.vertexShader
      vertexShader = vertexShader.replace("void main() {", "varying vec4 vPosProj;\nvoid main() {")
      vertexShader = vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvPosProj = gl_Position;",
      )
      shader.vertexShader = vertexShader
      shader.fragmentShader = `
        uniform sampler2D texBlob; varying vec4 vPosProj;
        ${shader.fragmentShader}
      `.replace(
        `#include <clipping_planes_fragment>`,
        `
        vec2 blobUV=((vPosProj.xy/vPosProj.w)+1.)*0.5;
        vec4 blobData=texture(texBlob,blobUV);
        if(blobData.r<0.02)discard;
        #include <clipping_planes_fragment>
        `,
      )
    }

    scene.add(helmetImage)

    baseImage.position.z = 0.0
    bgPlane.position.z = 0.05
    helmetImage.position.z = 0.1

    const clock = new THREE.Clock()
    let t = 0

    const animate = () => {
      const dt = clock.getDelta()
      t += dt
      gu.time.value = t
      gu.dTime.value = dt
      blob.render()
      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.left = newWidth / -2
      camera.right = newWidth / 2
      camera.top = newHeight / 2
      camera.bottom = newHeight / -2
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
      gu.aspect.value = newWidth / newHeight

      // Update dots background
      dotsMaterial.uniforms.resolution.value.set(newWidth, newHeight)
      dotsPlane.geometry.dispose()
      dotsPlane.geometry = new THREE.PlaneGeometry(newWidth, newHeight)

      // Update geometries with cover-fit behavior
      if (baseTexture.image && helmetTexture.image) {
        const baseImg = baseTexture.image as HTMLImageElement
        const helmetImg = helmetTexture.image as HTMLImageElement

        // Calculate cover dimensions for both images
        const baseDims = calculateContainDimensions(baseImg.width, baseImg.height, newWidth, newHeight)
        const helmetDims = calculateContainDimensions(helmetImg.width, helmetImg.height, newWidth, newHeight)

        // Update base image geometry
        baseImage.geometry.dispose()
        baseImage.geometry = new THREE.PlaneGeometry(baseDims.planeWidth, baseDims.planeHeight)

        // Update helmet image geometry
        helmetImage.geometry.dispose()
        helmetImage.geometry = new THREE.PlaneGeometry(helmetDims.planeWidth, helmetDims.planeHeight)

        // Update background plane
        bgPlane.geometry.dispose()
        bgPlane.geometry = new THREE.PlaneGeometry(newWidth, newHeight)
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })
      baseTexture.dispose()
      helmetTexture.dispose()
      blob.rtOutput.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-[#1a1f1a] cursor-crosshair overflow-hidden"
      style={{ touchAction: "none" }}
    >

      <div className="absolute bottom-8 right-8 z-10 pointer-events-none text-right">
        <span className="text-white/40 text-xs font-mono">Move cursor to reveal</span>
        <br />
        <span className="text-white/60 text-sm font-bold">The Future of Nepal</span>
      </div>
    </div>
  )
}
