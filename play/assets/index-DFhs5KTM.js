import{M as g,O as ms,B as ie,F as Ie,S as j,U as et,V as H,W as At,H as Ct,N as pt,C as Ke,a as L,b as x,A as Je,c as gt,R as ps,d as gs,e as vs,L as ws,f as xs,g as bs,h as _e,i as Ms,j as ys,k as Ss,T as ze,l as Ts,m as xe,D as $e,n as Ft,o as J,p as As,q as re,Z as le,r as Be,s as Oe,t as Cs,u as Es,v as Ps,w as Ls,x as ks,y as Rs,z as ts,E as es,G as Me,I as Ds,J as q,K as Is,P as O,Q as E,X as tt,Y as oe,_ as st,$ as X,a0 as vt,a1 as rt,a2 as Tt,a3 as W,a4 as zs,a5 as Bs,a6 as ss,a7 as Os,a8 as Ns,a9 as Us,aa as is,ab as Nt,ac as Pe,ad as ee,ae as $t,af as se,ag as Ut,ah as Fs,ai as Ws,aj as Gs,ak as Vs,al as Hs,am as js,an as Xs}from"./three-CCcZ-LxQ.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();const It={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Et{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const qs=new ms(-1,1,1,-1,0,1);class Ys extends ie{constructor(){super(),this.setAttribute("position",new Ie([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ie([0,2,0,0,2,0],2))}}const Qs=new Ys;class ae{constructor(t){this._mesh=new g(Qs,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,qs)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class os extends Et{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof j?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=et.clone(t.uniforms),this.material=new j({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new ae(this.material)}render(t,e,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ne extends Et{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,s){const i=t.getContext(),o=t.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let a,n;this.inverse?(a=0,n=1):(a=1,n=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),o.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),o.buffers.stencil.setClear(n),o.buffers.stencil.setLocked(!0),t.setRenderTarget(s),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(i.EQUAL,1,4294967295),o.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),o.buffers.stencil.setLocked(!0)}}class Zs extends Et{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Ks{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const s=t.getSize(new H);this._width=s.width,this._height=s.height,e=new At(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ct}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new os(It),this.copyPass.material.blending=pt,this.clock=new Ke}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let s=!1;for(let i=0,o=this.passes.length;i<o;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,s),a.needsSwap){if(s){const n=this.renderer.getContext(),r=this.renderer.state.buffers.stencil;r.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),r.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ne!==void 0&&(a instanceof Ne?s=!0:a instanceof Zs&&(s=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new H);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const s=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(s,i),this.renderTarget2.setSize(s,i);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(s,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Js extends Et{constructor(t,e,s=null,i=null,o=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=s,this.clearColor=i,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new L}render(t,e,s){const i=t.autoClear;t.autoClear=!1;let o,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(o=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(o),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=i}}const _s={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new L(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Wt extends Et{constructor(t,e=1,s,i){super(),this.strength=e,this.radius=s,this.threshold=i,this.resolution=t!==void 0?new H(t.x,t.y):new H(256,256),this.clearColor=new L(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new At(o,a,{type:Ct}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const u=new At(o,a,{type:Ct});u.texture.name="UnrealBloomPass.h"+c,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const f=new At(o,a,{type:Ct});f.texture.name="UnrealBloomPass.v"+c,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),o=Math.round(o/2),a=Math.round(a/2)}const n=_s;this.highPassUniforms=et.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new j({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const r=[3,5,7,9,11];o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(r[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new H(1/o,1/a),o=Math.round(o/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new x(1,1,1),new x(1,1,1),new x(1,1,1),new x(1,1,1),new x(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=et.clone(It.uniforms),this.blendMaterial=new j({uniforms:this.copyUniforms,vertexShader:It.vertexShader,fragmentShader:It.fragmentShader,blending:Je,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new L,this._oldClearAlpha=1,this._basic=new gt,this._fsQuad=new ae(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let s=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(s,i);for(let o=0;o<this.nMips;o++)this.renderTargetsHorizontal[o].setSize(s,i),this.renderTargetsVertical[o].setSize(s,i),this.separableBlurMaterials[o].uniforms.invSize.value=new H(1/s,1/i),s=Math.round(s/2),i=Math.round(i/2)}render(t,e,s,i,o){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();const a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),o&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let n=this.renderTargetBright;for(let r=0;r<this.nMips;r++)this._fsQuad.material=this.separableBlurMaterials[r],this.separableBlurMaterials[r].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[r].uniforms.direction.value=Wt.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[r]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[r].uniforms.colorTexture.value=this.renderTargetsHorizontal[r].texture,this.separableBlurMaterials[r].uniforms.direction.value=Wt.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[r]),t.clear(),this._fsQuad.render(t),n=this.renderTargetsVertical[r];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,o&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(s),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=a}_getSeparableBlurMaterial(t){const e=[];for(let s=0;s<t;s++)e.push(.39894*Math.exp(-.5*s*s/(t*t))/t);return new j({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new H(.5,.5)},direction:{value:new H(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(t){return new j({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Wt.BlurDirectionX=new H(1,0);Wt.BlurDirectionY=new H(0,1);const ce={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class $s extends Et{constructor(){super(),this.uniforms=et.clone(ce.uniforms),this.material=new ps({name:ce.name,uniforms:this.uniforms,vertexShader:ce.vertexShader,fragmentShader:ce.fragmentShader}),this._fsQuad=new ae(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},gs.getTransfer(this._outputColorSpace)===vs&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ws?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===xs?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===bs?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===_e?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ms?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ys?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Ss&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const he={defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new H(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},de={defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new H(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Te={uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new H(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};class ti extends Et{constructor(){super(),this._edgesRT=new At(1,1,{depthBuffer:!1,type:Ct}),this._edgesRT.texture.name="SMAAPass.edges",this._weightsRT=new At(1,1,{depthBuffer:!1,type:Ct}),this._weightsRT.texture.name="SMAAPass.weights";const t=this,e=new Image;e.src=this._getAreaTexture(),e.onload=function(){t._areaTexture.needsUpdate=!0},this._areaTexture=new ze,this._areaTexture.name="SMAAPass.area",this._areaTexture.image=e,this._areaTexture.minFilter=Ts,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;const s=new Image;s.src=this._getSearchTexture(),s.onload=function(){t._searchTexture.needsUpdate=!0},this._searchTexture=new ze,this._searchTexture.name="SMAAPass.search",this._searchTexture.image=s,this._searchTexture.magFilter=xe,this._searchTexture.minFilter=xe,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=et.clone(he.uniforms),this._materialEdges=new j({defines:Object.assign({},he.defines),uniforms:this._uniformsEdges,vertexShader:he.vertexShader,fragmentShader:he.fragmentShader}),this._uniformsWeights=et.clone(de.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new j({defines:Object.assign({},de.defines),uniforms:this._uniformsWeights,vertexShader:de.vertexShader,fragmentShader:de.fragmentShader}),this._uniformsBlend=et.clone(Te.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new j({uniforms:this._uniformsBlend,vertexShader:Te.vertexShader,fragmentShader:Te.fragmentShader}),this._fsQuad=new ae(null)}render(t,e,s){this._uniformsEdges.tDiffuse.value=s.texture,this._fsQuad.material=this._materialEdges,t.setRenderTarget(this._edgesRT),this.clear&&t.clear(),this._fsQuad.render(t),this._fsQuad.material=this._materialWeights,t.setRenderTarget(this._weightsRT),this.clear&&t.clear(),this._fsQuad.render(t),this._uniformsBlend.tColor.value=s.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(),this._fsQuad.render(t))}setSize(t,e){this._edgesRT.setSize(t,e),this._weightsRT.setSize(t,e),this._materialEdges.uniforms.resolution.value.set(1/t,1/e),this._materialWeights.uniforms.resolution.value.set(1/t,1/e),this._materialBlend.uniforms.resolution.value.set(1/t,1/e)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return"data:image/png;base64,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"}_getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}}const ue={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new H},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new J},cameraProjectionMatrixInverse:{value:new J},cameraWorldMatrix:{value:new J},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new x(-1,-1,-1)},sceneBoxMax:{value:new x(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},fe={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Ae={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function ei(h=5){const t=Math.floor(h)%2===0?Math.floor(h)+1:Math.floor(h),e=si(t),s=e.length,i=new Uint8Array(s*4);for(let a=0;a<s;++a){const n=e[a],r=2*Math.PI*n/s,l=new x(Math.cos(r),Math.sin(r),0).normalize();i[a*4]=(l.x*.5+.5)*255,i[a*4+1]=(l.y*.5+.5)*255,i[a*4+2]=127,i[a*4+3]=255}const o=new $e(i,t,t);return o.wrapS=Ft,o.wrapT=Ft,o.needsUpdate=!0,o}function si(h){const t=Math.floor(h)%2===0?Math.floor(h)+1:Math.floor(h),e=t*t,s=Array(e).fill(0);let i=Math.floor(t/2),o=t-1;for(let a=1;a<=e;){if(i===-1&&o===t?(o=t-2,i=0):(o===t&&(o=0),i<0&&(i=t-1)),s[i*t+o]!==0){o-=2,i++;continue}else s[i*t+o]=a++;o++,i--}return s}const me={defines:{SAMPLES:16,SAMPLE_VECTORS:as(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new H},cameraProjectionMatrixInverse:{value:new J},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function as(h,t,e){const s=ii(h,t,e);let i="vec3[SAMPLES](";for(let o=0;o<h;o++){const a=s[o];i+=`vec3(${a.x}, ${a.y}, ${a.z})${o<h-1?",":")"}`}return i}function ii(h,t,e){const s=[];for(let i=0;i<h;i++){const o=2*Math.PI*t*i/h,a=Math.pow(i/(h-1),e);s.push(new x(Math.cos(o),Math.sin(o),a))}return s}class oi{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(t,e){let s,i,o;const a=.5*(Math.sqrt(3)-1),n=(t+e)*a,r=Math.floor(t+n),l=Math.floor(e+n),c=(3-Math.sqrt(3))/6,u=(r+l)*c,f=r-u,d=l-u,m=t-f,p=e-d;let b,w;m>p?(b=1,w=0):(b=0,w=1);const M=m-b+c,y=p-w+c,T=m-1+2*c,P=p-1+2*c,I=r&255,R=l&255,z=this.perm[I+this.perm[R]]%12,D=this.perm[I+b+this.perm[R+w]]%12,B=this.perm[I+1+this.perm[R+1]]%12;let N=.5-m*m-p*p;N<0?s=0:(N*=N,s=N*N*this._dot(this.grad3[z],m,p));let U=.5-M*M-y*y;U<0?i=0:(U*=U,i=U*U*this._dot(this.grad3[D],M,y));let Q=.5-T*T-P*P;return Q<0?o=0:(Q*=Q,o=Q*Q*this._dot(this.grad3[B],T,P)),70*(s+i+o)}noise3d(t,e,s){let i,o,a,n;const l=(t+e+s)*.3333333333333333,c=Math.floor(t+l),u=Math.floor(e+l),f=Math.floor(s+l),d=1/6,m=(c+u+f)*d,p=c-m,b=u-m,w=f-m,M=t-p,y=e-b,T=s-w;let P,I,R,z,D,B;M>=y?y>=T?(P=1,I=0,R=0,z=1,D=1,B=0):M>=T?(P=1,I=0,R=0,z=1,D=0,B=1):(P=0,I=0,R=1,z=1,D=0,B=1):y<T?(P=0,I=0,R=1,z=0,D=1,B=1):M<T?(P=0,I=1,R=0,z=0,D=1,B=1):(P=0,I=1,R=0,z=1,D=1,B=0);const N=M-P+d,U=y-I+d,Q=T-R+d,Pt=M-z+2*d,wt=y-D+2*d,Lt=T-B+2*d,ft=M-1+3*d,mt=y-1+3*d,G=T-1+3*d,it=c&255,_=u&255,ot=f&255,xt=this.perm[it+this.perm[_+this.perm[ot]]]%12,bt=this.perm[it+P+this.perm[_+I+this.perm[ot+R]]]%12,Mt=this.perm[it+z+this.perm[_+D+this.perm[ot+B]]]%12,yt=this.perm[it+1+this.perm[_+1+this.perm[ot+1]]]%12;let at=.6-M*M-y*y-T*T;at<0?i=0:(at*=at,i=at*at*this._dot3(this.grad3[xt],M,y,T));let lt=.6-N*N-U*U-Q*Q;lt<0?o=0:(lt*=lt,o=lt*lt*this._dot3(this.grad3[bt],N,U,Q));let K=.6-Pt*Pt-wt*wt-Lt*Lt;K<0?a=0:(K*=K,a=K*K*this._dot3(this.grad3[Mt],Pt,wt,Lt));let ct=.6-ft*ft-mt*mt-G*G;return ct<0?n=0:(ct*=ct,n=ct*ct*this._dot3(this.grad3[yt],ft,mt,G)),32*(i+o+a+n)}noise4d(t,e,s,i){const o=this.grad4,a=this.simplex,n=this.perm,r=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20;let c,u,f,d,m;const p=(t+e+s+i)*r,b=Math.floor(t+p),w=Math.floor(e+p),M=Math.floor(s+p),y=Math.floor(i+p),T=(b+w+M+y)*l,P=b-T,I=w-T,R=M-T,z=y-T,D=t-P,B=e-I,N=s-R,U=i-z,Q=D>B?32:0,Pt=D>N?16:0,wt=B>N?8:0,Lt=D>U?4:0,ft=B>U?2:0,mt=N>U?1:0,G=Q+Pt+wt+Lt+ft+mt,it=a[G][0]>=3?1:0,_=a[G][1]>=3?1:0,ot=a[G][2]>=3?1:0,xt=a[G][3]>=3?1:0,bt=a[G][0]>=2?1:0,Mt=a[G][1]>=2?1:0,yt=a[G][2]>=2?1:0,at=a[G][3]>=2?1:0,lt=a[G][0]>=1?1:0,K=a[G][1]>=1?1:0,ct=a[G][2]>=1?1:0,ne=a[G][3]>=1?1:0,v=D-it+l,S=B-_+l,C=N-ot+l,k=U-xt+l,F=D-bt+2*l,V=B-Mt+2*l,St=N-yt+2*l,ht=U-at+2*l,Gt=D-lt+3*l,zt=B-K+3*l,Bt=N-ct+3*l,dt=U-ne+3*l,ut=D-1+4*l,kt=B-1+4*l,ye=N-1+4*l,Se=U-1+4*l,Vt=b&255,Ht=w&255,jt=M&255,Xt=y&255,cs=n[Vt+n[Ht+n[jt+n[Xt]]]]%32,hs=n[Vt+it+n[Ht+_+n[jt+ot+n[Xt+xt]]]]%32,ds=n[Vt+bt+n[Ht+Mt+n[jt+yt+n[Xt+at]]]]%32,us=n[Vt+lt+n[Ht+K+n[jt+ct+n[Xt+ne]]]]%32,fs=n[Vt+1+n[Ht+1+n[jt+1+n[Xt+1]]]]%32;let qt=.6-D*D-B*B-N*N-U*U;qt<0?c=0:(qt*=qt,c=qt*qt*this._dot4(o[cs],D,B,N,U));let Yt=.6-v*v-S*S-C*C-k*k;Yt<0?u=0:(Yt*=Yt,u=Yt*Yt*this._dot4(o[hs],v,S,C,k));let Qt=.6-F*F-V*V-St*St-ht*ht;Qt<0?f=0:(Qt*=Qt,f=Qt*Qt*this._dot4(o[ds],F,V,St,ht));let Zt=.6-Gt*Gt-zt*zt-Bt*Bt-dt*dt;Zt<0?d=0:(Zt*=Zt,d=Zt*Zt*this._dot4(o[us],Gt,zt,Bt,dt));let Kt=.6-ut*ut-kt*kt-ye*ye-Se*Se;return Kt<0?m=0:(Kt*=Kt,m=Kt*Kt*this._dot4(o[fs],ut,kt,ye,Se)),27*(c+u+f+d+m)}_dot(t,e,s){return t[0]*e+t[1]*s}_dot3(t,e,s,i){return t[0]*e+t[1]*s+t[2]*i}_dot4(t,e,s,i,o){return t[0]*e+t[1]*s+t[2]*i+t[3]*o}}class nt extends Et{constructor(t,e,s=512,i=512,o,a,n){super(),this.width=s,this.height=i,this.clear=!0,this.camera=e,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=ei(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new At(this.width,this.height,{type:Ct}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new j({defines:Object.assign({},ue.defines),uniforms:et.clone(ue.uniforms),vertexShader:ue.vertexShader,fragmentShader:ue.fragmentShader,blending:pt,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new As,this.normalMaterial.blending=pt,this.pdMaterial=new j({defines:Object.assign({},me.defines),uniforms:et.clone(me.uniforms),vertexShader:me.vertexShader,fragmentShader:me.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new j({defines:Object.assign({},fe.defines),uniforms:et.clone(fe.uniforms),vertexShader:fe.vertexShader,fragmentShader:fe.fragmentShader,blending:pt}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new j({uniforms:et.clone(It.uniforms),vertexShader:It.vertexShader,fragmentShader:It.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Oe,blendDst:le,blendEquation:re,blendSrcAlpha:Be,blendDstAlpha:le,blendEquationAlpha:re}),this.blendMaterial=new j({uniforms:et.clone(Ae.uniforms),vertexShader:Ae.vertexShader,fragmentShader:Ae.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Cs,blendSrc:Oe,blendDst:le,blendEquation:re,blendSrcAlpha:Be,blendDstAlpha:le,blendEquationAlpha:re}),this._fsQuad=new ae(null),this._originalClearColor=new L,this.setGBuffer(o?o.depthTexture:void 0,o?o.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),n!==void 0&&this.updatePdMaterial(n)}setSize(t,e){this.width=t,this.height=e,this.gtaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.pdRenderTarget.setSize(t,e),this.gtaoMaterial.uniforms.resolution.value.set(t,e),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(t,e),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(t,e){t!==void 0?(this.depthTexture=t,this.normalTexture=e,this._renderGBuffer=!1):(this.depthTexture=new Es,this.depthTexture.format=Ps,this.depthTexture.type=Ls,this.normalRenderTarget=new At(this.width,this.height,{minFilter:xe,magFilter:xe,type:Ct,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const s=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=s,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=s,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(t){t?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(t.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(t.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(t){t.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=t.radius),t.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=t.distanceExponent),t.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=t.thickness),t.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=t.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),t.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=t.scale),t.samples!==void 0&&t.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=t.samples,this.gtaoMaterial.needsUpdate=!0),t.screenSpaceRadius!==void 0&&(t.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=t.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(t){let e=!1;t.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=t.lumaPhi),t.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=t.depthPhi),t.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=t.normalPhi),t.radius!==void 0&&t.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=t.radius),t.radiusExponent!==void 0&&t.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=t.radiusExponent,e=!0),t.rings!==void 0&&t.rings!==this.pdRings&&(this.pdRings=t.rings,e=!0),t.samples!==void 0&&t.samples!==this.pdSamples&&(this.pdSamples=t.samples,e=!0),e&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=as(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,e,s){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case nt.OUTPUT.Off:break;case nt.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=pt,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case nt.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=pt,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case nt.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=pt,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case nt.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case nt.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=pt,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case nt.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=pt,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(t,this.blendMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(t,e,s,i,o){t.getClearColor(this._originalClearColor);const a=t.getClearAlpha(),n=t.autoClear;t.setRenderTarget(s),t.autoClear=!1,i!=null&&(t.setClearColor(i),t.setClearAlpha(o||0),t.clear()),this._fsQuad.material=e,this._fsQuad.render(t),t.autoClear=n,t.setClearColor(this._originalClearColor),t.setClearAlpha(a)}_renderOverride(t,e,s,i,o){t.getClearColor(this._originalClearColor);const a=t.getClearAlpha(),n=t.autoClear;t.setRenderTarget(s),t.autoClear=!1,i=e.clearColor||i,o=e.clearAlpha||o,i!=null&&(t.setClearColor(i),t.setClearAlpha(o||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=n,t.setClearColor(this._originalClearColor),t.setClearAlpha(a)}_overrideVisibility(){const t=this.scene,e=this._visibilityCache;t.traverse(function(s){(s.isPoints||s.isLine||s.isLine2)&&s.visible&&(s.visible=!1,e.push(s))})}_restoreVisibility(){const t=this._visibilityCache;for(let e=0;e<t.length;e++)t[e].visible=!0;t.length=0}_generateNoise(t=64){const e=new oi,s=t*t*4,i=new Uint8Array(s);for(let a=0;a<t;a++)for(let n=0;n<t;n++){const r=a,l=n;i[(a*t+n)*4]=(e.noise(r,l)*.5+.5)*255,i[(a*t+n)*4+1]=(e.noise(r+t,l)*.5+.5)*255,i[(a*t+n)*4+2]=(e.noise(r,l+t)*.5+.5)*255,i[(a*t+n)*4+3]=(e.noise(r+t,l+t)*.5+.5)*255}const o=new $e(i,t,t,ks,Rs);return o.wrapS=Ft,o.wrapT=Ft,o.needsUpdate=!0,o}}nt.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};const A=new Map;function Y(h,t=h){const e=document.createElement("canvas");e.width=h,e.height=t;const s=e.getContext("2d");return[e,s]}function Z(h,t){const e=new es(h);return e.colorSpace=Me,e.anisotropy=8,t&&(e.wrapS=Ft,e.wrapT=Ft,e.repeat.set(t[0],t[1])),e}function ns(h,t,e,s,i){const o=h.getImageData(0,0,t,e),a=o.data;for(let n=0;n<a.length;n+=4){const r=(Math.random()-.5)*s;a[n]=Math.max(0,Math.min(255,a[n]+r)),a[n+1]=Math.max(0,Math.min(255,a[n+1]+r)),a[n+2]=Math.max(0,Math.min(255,a[n+2]+r)),a[n+3]=Math.max(0,Math.min(255,a[n+3]*i+255*(1-i)))}h.putImageData(o,0,0)}function ai(){const h="road";if(A.has(h))return A.get(h);const[t,e]=Y(512),s=e.createLinearGradient(0,0,512,0);s.addColorStop(0,"#5c6168"),s.addColorStop(.5,"#727880"),s.addColorStop(1,"#5c6168"),e.fillStyle=s,e.fillRect(0,0,512,512);for(let o=0;o<2600;o++){const a=Math.random()*512,n=Math.random()*512,r=Math.random()*2.2;e.fillStyle=`rgba(${Math.random()>.5?255:0},${Math.random()>.5?255:0},255,${Math.random()*.05})`,e.beginPath(),e.arc(a,n,r,0,Math.PI*2),e.fill()}e.fillStyle="rgba(255,255,255,0.62)",e.fillRect(18,0,5,512),e.fillRect(489,0,5,512),e.fillStyle="rgba(255,255,255,0.78)";for(let o=0;o<512;o+=128)e.fillRect(254,o+24,5,80);ns(e,512,512,26,.6);const i=Z(t,[1,1]);return A.set(h,i),i}function ni(){const h="sand-normal";if(A.has(h))return A.get(h);const t=128,e=new Float32Array(t*t);for(let n=0;n<t;n++)for(let r=0;r<t;r++){const l=r/t,c=n/t;e[n*t+r]=Math.sin(l*Math.PI*2*9+Math.sin(c*Math.PI*2*4)*1.6)*.5+Math.sin(c*Math.PI*2*13+Math.sin(l*Math.PI*2*5)*1.2)*.35+(Math.random()-.5)*.18}const[s,i]=Y(t),o=i.createImageData(t,t);for(let n=0;n<t;n++)for(let r=0;r<t;r++){const l=e[n*t+(r-1+t)%t],c=e[n*t+(r+1)%t],u=e[(n-1+t)%t*t+r],f=e[(n+1)%t*t+r],d=(l-c)*1.2,m=(u-f)*1.2,p=(n*t+r)*4;o.data[p]=Math.max(0,Math.min(255,(d*.5+.5)*255)),o.data[p+1]=Math.max(0,Math.min(255,(m*.5+.5)*255)),o.data[p+2]=255,o.data[p+3]=255}i.putImageData(o,0,0);const a=Z(s,[38,38]);return A.set(h,a),a}function rs(){const h="sand";if(A.has(h))return A.get(h);const[t,e]=Y(256);e.fillStyle="#e9d2a6",e.fillRect(0,0,256,256);for(let i=0;i<5200;i++){const o=Math.random()*256,a=Math.random()*256,n=Math.random()*.12;e.fillStyle=Math.random()>.5?`rgba(255,250,235,${n})`:`rgba(120,90,55,${n})`,e.fillRect(o,a,1+Math.random()*2,1+Math.random()*2)}const s=Z(t,[220,220]);return A.set(h,s),s}function ri(){const h="asphaltNormal";if(A.has(h))return A.get(h);const[t,e]=Y(256);e.fillStyle="#8080ff",e.fillRect(0,0,256,256);for(let i=0;i<9e3;i++){const o=Math.random()*256,a=Math.random()*256,n=1+Math.random()*2,r=128+(Math.random()-.5)*90,l=128+(Math.random()-.5)*90;e.fillStyle=`rgb(${r|0},${l|0},255)`,e.fillRect(o,a,n,n)}const s=Z(t,[8,8]);return s.colorSpace=ts,A.set(h,s),s}function li(){const h="frond";if(A.has(h))return A.get(h);const[t,e]=Y(512,256);e.clearRect(0,0,512,256),e.translate(10,128),e.strokeStyle="#2f6a2c",e.lineWidth=7,e.beginPath(),e.moveTo(0,0),e.quadraticCurveTo(220,-26,490,-4),e.stroke();for(let i=0;i<34;i++){const o=i/34,a=o*470,n=-8-Math.sin(o*Math.PI)*20,r=104*(1-o*.5)*(.5+Math.sin(o*Math.PI)*.7),l=.55+o*.5;for(const c of[-1,1]){const u=e.createLinearGradient(a,n,a+r*.6,n+c*r);u.addColorStop(0,"#5fae4c"),u.addColorStop(.6,"#3f8a37"),u.addColorStop(1,"#2a5f28"),e.strokeStyle=u,e.lineWidth=13,e.lineCap="round",e.beginPath(),e.moveTo(a,n),e.quadraticCurveTo(a+r*.5,n+c*r*.35*l,a+r*.8,n+c*r*l),e.stroke()}}const s=Z(t);return A.set(h,s),s}function ci(){const h="checker";if(A.has(h))return A.get(h);const[t,e]=Y(256,64),s=16;for(let o=0;o<2;o++)for(let a=0;a<s;a++)e.fillStyle=(a+o)%2===0?"#f4f8ff":"#101820",e.fillRect(a*256/s,o*64/2,256/s,32);const i=Z(t);return A.set(h,i),i}function hi(h,t){const e=`banner:${h}`;if(A.has(e))return A.get(e);const[s,i]=Y(1024,256),o=i.createLinearGradient(0,0,1024,256);o.addColorStop(0,"#082a3c"),o.addColorStop(.5,"#0e4a63"),o.addColorStop(1,"#082a3c"),i.fillStyle=o,i.fillRect(0,0,1024,256);for(let l=0;l<16;l++)i.fillStyle=l%2?"#f2f7ff":"#0c1a24",i.fillRect(l*64,0,64,18),i.fillStyle=(l+1)%2?"#f2f7ff":"#0c1a24",i.fillRect(l*64,238,64,18);i.textAlign="center",i.textBaseline="middle";let a=150;for(i.font=`${a}px "Bebas Neue", Impact, sans-serif`;i.measureText(h).width>930&&a>58;)a-=6,i.font=`${a}px "Bebas Neue", Impact, sans-serif`;i.fillStyle="rgba(47,242,223,0.25)",i.fillText(h,512,134),i.fillStyle="#ffffff",i.fillText(h,512,130);let n=30;for(i.font=`600 ${n}px Rajdhani, sans-serif`;i.measureText(t).width>930&&n>16;)n-=2,i.font=`600 ${n}px Rajdhani, sans-serif`;i.fillStyle="rgba(255,179,71,0.95)",i.fillText(t,512,205);const r=Z(s);return A.set(e,r),r}const di={turbo:{a:"#ffd166",b:"#ff5b2e",glyph:"⚡"},missile:{a:"#ff8fa3",b:"#e01e37",glyph:"🚀"},shield:{a:"#7dfcff",b:"#1379c9",glyph:"🛡"},oil:{a:"#b0bec5",b:"#263238",glyph:"🛢"}};function ls(h){const[t,e]=Y(128),s=di[h],i=e.createRadialGradient(64,54,6,64,64,62);return i.addColorStop(0,s.a),i.addColorStop(1,s.b),e.fillStyle=i,e.beginPath(),e.arc(64,64,50,0,Math.PI*2),e.fill(),e.strokeStyle="rgba(255,255,255,0.85)",e.lineWidth=3,e.stroke(),e.font='58px "Apple Color Emoji","Segoe UI Emoji",sans-serif',e.textAlign="center",e.textBaseline="middle",e.fillStyle="#fff",e.shadowColor="rgba(0,0,0,0.4)",e.shadowBlur=10,e.fillText(s.glyph,64,70),t}function Ue(h){const t=`num-${h}`;if(A.has(t))return A.get(t);const[e,s]=Y(128);s.clearRect(0,0,128,128),s.fillStyle="#f7fbff",s.beginPath(),s.arc(64,64,58,0,Math.PI*2),s.fill(),s.strokeStyle="rgba(6, 24, 38, 0.85)",s.lineWidth=5,s.stroke(),s.fillStyle="#0b1b2b",s.font='86px "Bebas Neue", Impact, sans-serif',s.textAlign="center",s.textBaseline="middle",s.fillText(String(h),64,72);const i=Z(e);return A.set(t,i),i}function ui(){const h="tire";if(A.has(h))return A.get(h);const[t,e]=Y(512,128);e.fillStyle="#15181b",e.fillRect(0,0,512,128);for(let i=0;i<32;i++){const o=i/32*512;e.fillStyle="#0a0c0e",e.fillRect(o,0,7,128),e.fillStyle="rgba(255,255,255,0.05)",e.fillRect(o+9,0,3,128)}for(const i of[4,120])e.fillStyle="rgba(255,255,255,0.06)",e.fillRect(0,i,512,4);const s=Z(t,[1,1]);return A.set(h,s),s}function fi(){const h="paintNormal";if(A.has(h))return A.get(h);const[t,e]=Y(256);e.fillStyle="#8080ff",e.fillRect(0,0,256,256);for(let i=0;i<22e3;i++){const o=Math.random()*256,a=Math.random()*256;e.fillStyle=`rgb(${128+(Math.random()-.5)*14},${128+(Math.random()-.5)*14},255)`,e.fillRect(o,a,1,1)}const s=Z(t,[4,4]);return s.colorSpace=ts,A.set(h,s),s}function mi(){if(A.has("dot"))return A.get("dot");const[t,e]=Y(64),s=e.createRadialGradient(32,32,0,32,32,32);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.45,"rgba(255,255,255,0.5)"),s.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=s,e.fillRect(0,0,64,64);const i=Z(t);return A.set("dot",i),i}function pi(){const h="smoke";if(A.has(h))return A.get(h);const[t,e]=Y(128);for(let i=0;i<18;i++){const o=64+(Math.random()-.5)*46,a=64+(Math.random()-.5)*46,n=16+Math.random()*30,r=e.createRadialGradient(o,a,0,o,a,n);r.addColorStop(0,"rgba(255,255,255,0.32)"),r.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=r,e.beginPath(),e.arc(o,a,n,0,Math.PI*2),e.fill()}const s=Z(t);return A.set(h,s),s}function gi(){const h="shadow";if(A.has(h))return A.get(h);const[t,e]=Y(128),s=e.createRadialGradient(64,64,4,64,64,64);s.addColorStop(0,"rgba(0,0,0,0.55)"),s.addColorStop(.6,"rgba(0,0,0,0.25)"),s.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=s,e.fillRect(0,0,128,128);const i=Z(t);return A.set(h,i),i}function vi(){const h="guardrail";if(A.has(h))return A.get(h);const[t,e]=Y(256);e.fillStyle="#c9d2d8",e.fillRect(0,0,256,256);const s=e.createLinearGradient(0,0,0,256);s.addColorStop(0,"rgba(255,255,255,0.5)"),s.addColorStop(.45,"rgba(255,255,255,0.05)"),s.addColorStop(1,"rgba(20,28,34,0.35)"),e.fillStyle=s,e.fillRect(0,0,256,256),e.fillStyle="rgba(30, 40, 48, 0.5)";for(let o=0;o<256;o+=64)e.fillRect(o,0,5,256);e.fillStyle="rgba(200, 60, 40, 0.85)",e.fillRect(0,18,256,12),e.fillStyle="rgba(255,255,255,0.9)";for(let o=0;o<256;o+=64)e.fillRect(o,18,32,12);ns(e,256,256,18,.5);const i=Z(t,[1,1]);return A.set(h,i),i}function wi(){const h="barrier";if(A.has(h))return A.get(h);const[t,e]=Y(256,128);e.fillStyle="#f2f2ef",e.fillRect(0,0,256,128),e.save(),e.beginPath(),e.rect(0,0,256,128),e.clip(),e.fillStyle="#d8402a";for(let i=-128;i<384;i+=64)e.beginPath(),e.moveTo(i,0),e.lineTo(i+32,0),e.lineTo(i+32-128,128),e.lineTo(i-128,128),e.closePath(),e.fill();e.restore();const s=Z(t,[1,1]);return A.set(h,s),s}function Fe(){const h="sky-cube";if(A.has(h))return A.get(h);const t=(i,o,a)=>{const n=document.createElement("canvas");n.width=64,n.height=64;const r=n.getContext("2d"),l=r.createLinearGradient(0,0,0,64);return l.addColorStop(0,i),l.addColorStop(.55,o),l.addColorStop(1,a),r.fillStyle=l,r.fillRect(0,0,64,64),n},e=()=>t("#7fb8e6","#dff1ff","#e6d3aa"),s=new Ds([e(),e(),t("#cfeaff","#bfe4ff","#bfe4ff"),t("#e0c79a","#c9a97a","#c9a97a"),e(),e()]);return s.colorSpace=Me,s.needsUpdate=!0,A.set(h,s),s}const Ce=new x(0,1,0);function xi(h,t=new x){return t.set(Math.sin(h),0,Math.cos(h))}function bi(h,t=new x){return t.set(Math.cos(h),0,-Math.sin(h))}class Mi{group=new q;nodes=[];halfWidth;spec;length;curve;itemSpots=[];lightMat;count;constructor(t){this.spec=t,this.halfWidth=t.width/2;const e=[],s=t.radius,i=t.a,o=t.b,a=t.c,n=34;for(let u=0;u<n;u++){const f=u/n*Math.PI*2,d=s+i*Math.sin(t.h1*f)+o*Math.cos(t.h2*f)+a*Math.sin(t.h3*f+.6),m=.8+t.elevA*Math.sin(2*f+.7)+t.elevB*Math.sin(4*f+1.9);e.push(new x(Math.cos(f)*d,m,Math.sin(f)*d))}this.curve=new Is(e,!0,"centripetal",.5),this.count=1400;const r=this.curve.getLength();this.length=r;for(let u=0;u<this.count;u++){const f=u/this.count,d=this.curve.getPointAt(f),m=this.curve.getTangentAt(f).normalize();m.y=0,m.normalize();const p=new x().crossVectors(Ce,m).normalize();this.nodes.push({pos:d,tan:m,side:p,bank:0,curv:0,s:f*r})}const l=[];for(let u=0;u<this.count;u++){const f=this.nodes[u],d=this.nodes[(u+1)%this.count],m=new x().crossVectors(f.tan,d.tan).y,p=O.clamp(f.tan.dot(d.tan),-1,1),b=Math.max(.001,(d.s-f.s+r)%r);l.push(Math.atan2(m,p)/b)}const c=[];for(let u=0;u<this.count;u++){let f=0;for(let d=-14;d<=14;d++)f+=l[(u+d+this.count)%this.count];c.push(f/29)}for(let u=0;u<this.count;u++){const f=this.nodes[u];f.curv=c[u],f.bank=O.clamp(c[u]*t.bankScale,-.15,.15)}this.buildMeshes(),this.placeItems()}get sampleCount(){return this.count}sample(t){return this.nodes[(t%this.count+this.count)%this.count]}nearest(t,e=-1){let s=e;if(e>=0){let a=1/0;for(let n=-46;n<=46;n++){const r=(e+n+this.count)%this.count,l=this.nodes[r].pos.distanceToSquared(t);l<a&&(a=l,s=r)}}else{let a=1/0;for(let n=0;n<this.count;n++){const r=this.nodes[n].pos.distanceToSquared(t);r<a&&(a=r,s=n)}}const i=this.nodes[s],o=new x().subVectors(t,i.pos);return{index:s,lateral:o.dot(i.side),forward:o.dot(i.tan),node:i}}heightAt(t){return t.node.pos.y-t.lateral*Math.sin(t.node.bank)}progress(t,e){return e+t/this.count}edge(t,e,s=0){const i=Math.cos(t.bank),o=Math.sin(t.bank);return new x().copy(t.pos).addScaledVector(t.side,e*i).addScaledVector(Ce,-e*o+s)}buildMeshes(){const t=new g(this.buildRibbon(-this.halfWidth,this.halfWidth,0,.02),new E({map:ai(),normalMap:ri(),normalScale:new H(.18,.18),roughness:.93,metalness:0,color:16777215}));t.receiveShadow=!0,t.name="road",this.group.add(t);const e=new E({vertexColors:!0,roughness:.55,metalness:.02}),s=new g(this.buildRibbon(-this.halfWidth-1.3,-this.halfWidth,.06,.02,!0),e),i=new g(this.buildRibbon(this.halfWidth,this.halfWidth+1.3,.06,.02,!0),e);s.receiveShadow=i.receiveShadow=!0,this.group.add(s,i);const o=rs().clone();o.repeat.set(1,1),o.needsUpdate=!0;const a=new E({map:o,color:14203274,roughness:1,metalness:0}),n=new g(this.buildRibbon(-this.halfWidth-4.6,-this.halfWidth-1.3,-.1,0,!1,.06),a),r=new g(this.buildRibbon(this.halfWidth+1.3,this.halfWidth+4.6,-.1,0,!1,.06),a);n.receiveShadow=r.receiveShadow=!0,this.group.add(n,r),this.buildMarkers(),this.buildRoadside(),this.buildStartGate()}buildRibbon(t,e,s,i,o=!1,a=.22){const n=this.count,r=new Float32Array((n+1)*2*3),l=new Float32Array((n+1)*2*3),c=new Float32Array((n+1)*2*2),u=o?new Float32Array((n+1)*2*3):null,f=[];for(let m=0;m<=n;m++){const p=this.sample(m),b=this.edge(p,t,i),w=this.edge(p,e,i);b.y-=s,w.y-=s;const M=m*6;r[M]=b.x,r[M+1]=b.y,r[M+2]=b.z,r[M+3]=w.x,r[M+4]=w.y,r[M+5]=w.z;const y=Math.hypot(w.x-b.x,w.z-b.z),T=-(w.z-b.z)/y,P=(w.x-b.x)/y;l[M]=T,l[M+1]=1,l[M+2]=P,l[M+3]=T,l[M+4]=1,l[M+5]=P;const I=m*4;if(c[I]=0,c[I+1]=p.s*a,c[I+2]=1,c[I+3]=p.s*a,u){const z=Math.floor(p.s/4)%2===0?[.82,.1,.11]:[.95,.95,.95];u[m*6]=z[0],u[m*6+1]=z[1],u[m*6+2]=z[2],u[m*6+3]=z[0],u[m*6+4]=z[1],u[m*6+5]=z[2]}if(m<n){const R=m*2;f.push(R,R+2,R+1,R+1,R+2,R+3)}}const d=new ie;return d.setAttribute("position",new tt(r,3)),d.setAttribute("normal",new tt(l,3)),d.setAttribute("uv",new tt(c,2)),u&&d.setAttribute("color",new tt(u,3)),d.setIndex(f),d}buildRoadside(){const t=new E({map:vi(),roughness:.55,metalness:.4,side:oe});for(const f of[-1,1])for(const d of this.cornerRuns())this.group.add(new g(this.buildRailGeometry(f*(this.halfWidth+5.4),.8,d[0],d[1]),t));const e=new E({map:wi(),roughness:.7,metalness:.05}),s=new st(2.6,.9),i=Math.max(6,Math.round(this.count/26));let o=0;for(let f=20;f<this.count;f+=i){const d=this.nodes[f];if(!(Math.abs(d.curv)<.012||o>13)){for(const m of[-1,1]){const p=new g(s,e),b=this.edge(d,m*(this.halfWidth+3.1),.55);p.position.copy(b),p.rotation.y=Math.atan2(d.side.x,d.side.z)+(m<0?Math.PI:0),this.group.add(p)}o++}}const a=new X(.15,.19,1,6),n=new vt(.15,6,5),r=new E({roughness:.85}),l=new E({color:15250570,roughness:.8}),c=[];let u=0;for(let f=30;f<this.count;f+=Math.max(20,Math.round(this.count/9))){const d=this.nodes[f];if(!(Math.abs(d.curv)<.011||u>8)){for(let m=0;m<8;m++){const p=this.nodes[(f+m)%this.count],b=m%2===0?1:-1,w=this.edge(p,b*(this.halfWidth+8.4+m%4*.7),.52);c.push({pos:w,yaw:Math.atan2(p.tan.x,p.tan.z)})}u++}}if(c.length>0){const f=new rt(a,r,c.length),d=new rt(n,l,c.length),m=new J,p=new Tt,b=new x(0,1,0),w=new x(1,1,1),M=new L;c.forEach((y,T)=>{p.setFromAxisAngle(b,y.yaw),m.compose(y.pos,p,w),f.setMatrixAt(T,m),f.setColorAt(T,M.setHSL(.02+Math.random()*.62,.35+Math.random()*.3,.38+Math.random()*.25));const P=y.pos.clone();P.y+=.62,m.compose(P,p,w),d.setMatrixAt(T,m)}),f.instanceColor.needsUpdate=!0,this.group.add(f,d)}}cornerRuns(){const e=[];let s=-1;for(let i=0;i<this.count;i++){const o=Math.abs(this.nodes[i].curv)>.0095;o&&s<0&&(s=i),!o&&s>=0&&(i-s>6&&e.push([Math.max(0,s-6),i+6]),s=-1)}return s>=0&&this.count-s>6&&e.push([Math.max(0,s-6),this.count]),e.slice(0,10)}buildRailGeometry(t,e,s,i){const o=i-s,a=new Float32Array((o+1)*2*3),n=new Float32Array((o+1)*2*2),r=[];for(let c=0;c<=o;c++){const u=this.sample(s+c),f=this.edge(u,t,.04),d=c*6;a[d]=f.x,a[d+1]=f.y,a[d+2]=f.z,a[d+3]=f.x,a[d+4]=f.y+e,a[d+5]=f.z;const m=(s+c)*.55;if(n[c*4]=m,n[c*4+1]=0,n[c*4+2]=m,n[c*4+3]=1,c<o){const p=c*2;r.push(p,p+2,p+1,p+1,p+2,p+3)}}const l=new ie;return l.setAttribute("position",new tt(a,3)),l.setAttribute("uv",new tt(n,2)),l.setIndex(r),l.computeVertexNormals(),l}buildMarkers(){const e=Math.max(3,Math.floor(this.length/15)),s=new W(.14,.8,.14),i=new W(.17,.18,.17),o=new E({color:15921902,roughness:.6,metalness:.05}),a=new E({color:14697514,emissive:5902858,emissiveIntensity:.5,roughness:.35}),n=new rt(s,o,e*2),r=new rt(i,a,e*2),l=new J,c=new Tt,u=new x(0,1,0),f=new x(1,1,1);let d=0;for(let m=0;m<e;m++){const p=this.sample(Math.round(m/e*this.count));c.setFromAxisAngle(u,Math.atan2(p.tan.x,p.tan.z));for(const b of[-1,1]){const w=this.edge(p,b*(this.halfWidth+2.9),0),M=w.clone();M.y+=.4,l.compose(M,c,f),n.setMatrixAt(d,l);const y=w.clone();y.y+=.86,l.compose(y,c,f),r.setMatrixAt(d,l),d++}}this.group.add(n,r)}buildStartGate(){const t=this.sample(4),e=new q,s=new E({color:4019304,roughness:.45,metalness:.55}),i=new W(.9,8.4,.9);for(const f of[-1,1]){const d=new g(i,s);d.position.copy(this.edge(t,f*(this.halfWidth+2.2),4.2)),d.castShadow=!0,e.add(d)}const o=Math.atan2(t.tan.x,t.tan.z),a=new g(new W((this.halfWidth+2.7)*2,2.6,.7),s);a.position.copy(this.edge(t,0,7.4)),a.rotation.y=o,a.castShadow=!0,e.add(a);const n=new st((this.halfWidth+2.7)*2-1.4,2.2),r=new gt({map:hi(this.spec.name,this.spec.tagline),toneMapped:!1});for(const f of[-1,1]){const d=new g(n,r);d.position.copy(a.position).addScaledVector(t.tan,f*.37),d.rotation.y=o+(f<0?Math.PI:0),e.add(d)}this.lightMat=new E({color:2755082,emissive:16722474,emissiveIntensity:1.4,roughness:.4});const l=new g(new W(3.2,.9,.5),s);l.position.copy(a.position).addScaledVector(t.tan,.5).addScaledVector(Ce,-1.9),l.rotation.y=o,e.add(l);for(let f=0;f<3;f++){const d=new g(new vt(.3,14,10),this.lightMat);d.position.copy(l.position).addScaledVector(t.tan,.42).addScaledVector(t.side,(f-1)*1),e.add(d)}const c=new st(this.halfWidth*2,3.2);c.rotateX(-Math.PI/2);const u=new g(c,new E({map:ci(),roughness:.6,metalness:.05}));u.rotation.y=o,u.position.copy(this.edge(t,0,.05)),u.receiveShadow=!0,e.add(u),this.group.add(e)}placeItems(){const t=Math.round(this.count/13);for(let e=0;e<13;e++){const s=(e*t+60)%this.count;this.itemSpots.push({index:s,lateral:e%2===0?-3.6:3.6})}}gridSlot(t){const e=Math.floor(t/2),s=t%2,i=(this.count-10-e*12+this.count)%this.count,o=this.sample(i),a=(s===0?-3.2:3.2)+(e%2===0?-.8:.8),n=this.edge(o,a,.02),r=Math.atan2(o.tan.x,o.tan.z);return{pos:n,yaw:r}}dispose(){this.group.traverse(t=>{const e=t;if(!e.isMesh)return;e.geometry?.dispose();const s=Array.isArray(e.material)?e.material:[e.material];for(const i of s)i?.dispose()})}setStartLights(t){this.lightMat&&(t==="off"?this.lightMat.emissiveIntensity=.05:(this.lightMat.emissive.setHex(t==="green"?2817928:16722474),this.lightMat.emissiveIntensity=t==="green"?2.4:1.6))}startBanner(t=0){return this.sample(t).pos}}function yi(h,t=!1){const e=h[0].index!==null,s=new Set(Object.keys(h[0].attributes)),i=new Set(Object.keys(h[0].morphAttributes)),o={},a={},n=h[0].morphTargetsRelative,r=new ie;let l=0;for(let c=0;c<h.length;++c){const u=h[c];let f=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;o[d]===void 0&&(o[d]=[]),o[d].push(u.attributes[d]),f++}if(f!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". Make sure all geometries have the same number of attributes."),null;if(n!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(t){let d;if(e)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". The geometry must have either an index or a position attribute"),null;r.addGroup(l,d,c),l+=d}}if(e){let c=0;const u=[];for(let f=0;f<h.length;++f){const d=h[f].index;for(let m=0;m<d.count;++m)u.push(d.getX(m)+c);c+=h[f].attributes.position.count}r.setIndex(u)}for(const c in o){const u=We(o[c]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" attribute."),null;r.setAttribute(c,u)}for(const c in a){const u=a[c][0].length;if(u===0)break;r.morphAttributes=r.morphAttributes||{},r.morphAttributes[c]=[];for(let f=0;f<u;++f){const d=[];for(let p=0;p<a[c].length;++p)d.push(a[c][p][f]);const m=We(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" morphAttribute."),null;r.morphAttributes[c].push(m)}}return r}function We(h){let t,e,s,i=-1,o=0;for(let l=0;l<h.length;++l){const c=h[l];if(t===void 0&&(t=c.array.constructor),t!==c.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=c.itemSize),e!==c.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(s===void 0&&(s=c.normalized),s!==c.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=c.gpuType),i!==c.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=c.count*e}const a=new t(o),n=new tt(a,e,s);let r=0;for(let l=0;l<h.length;++l){const c=h[l];if(c.isInterleavedBufferAttribute){const u=r/e;for(let f=0,d=c.count;f<d;f++)for(let m=0;m<e;m++){const p=c.getComponent(f,m);n.setComponent(f+u,m,p)}}else a.set(c.array,r);r+=c.count*e}return i!==void 0&&(n.gpuType=i),n}function Dt(h,t){const e=Math.sin(h*127.1+t*311.7)*43758.5453;return e-Math.floor(e)}function Si(h,t){const e=Math.floor(h),s=Math.floor(t),i=h-e,o=t-s,a=i*i*(3-2*i),n=o*o*(3-2*o),r=Dt(e,s),l=Dt(e+1,s),c=Dt(e,s+1),u=Dt(e+1,s+1);return(r*(1-a)+l*a)*(1-n)+(c*(1-a)+u*a)*n}function Ge(h,t){let e=0,s=.5,i=h,o=t;for(let a=0;a<4;a++)e+=Si(i,o)*s,i*=2.03,o*=2.03,s*=.5;return e}const Ot=(h,t,e)=>{const s=O.clamp((e-h)/(t-h),0,1);return s*s*(3-2*s)};class Ti{group=new q;sunLight;sunDir=new x;sky;waterMat;trackPointGrid=[];terrain;theme;lowSpec;ultra;flora;shoreRadius=405;constructor(t,e,s,i,o=!1,a=!1){this.theme=i,this.lowSpec=o,this.ultra=a;const n=i.flora??"tropical";this.flora=n;const r=Math.max(1,Math.floor(t.nodes.length/(a?70:o?120:220)));for(let m=0;m<t.nodes.length;m+=r)this.trackPointGrid.push(t.nodes[m]);const l=new x().setFromSphericalCoords(1,O.degToRad(36),O.degToRad(248));this.sunDir.copy(l),this.sky=this.buildSky(),this.group.add(this.sky),this.terrain=this.buildTerrain(),this.group.add(this.terrain),this.waterMat=this.buildWater();const c=new g(new st(7e3,7e3,1,1),this.waterMat);c.rotation.x=-Math.PI/2,c.position.y=-1.6,this.group.add(c),this.buildPalms(),this.buildRocks(),this.buildBeachProps(),this.buildIslands(),this.buildTrackProps(t),this.buildGrandstand(t),this.buildBushes();const u=new zs(15134456,this.theme.ambient,.32),f=new Bs(16773600,.62);this.group.add(u,f),this.sunLight=new ss(this.theme.sunLight,3),this.sunLight.position.copy(this.sunDir).multiplyScalar(180),this.sunLight.castShadow=!0,this.sunLight.shadow.mapSize.set(this.ultra?512:this.lowSpec?1024:2048,this.ultra?512:this.lowSpec?1024:2048),this.sunLight.shadow.camera.near=20,this.sunLight.shadow.camera.far=420;const d=this.sunLight.shadow.camera;d.left=-58,d.right=58,d.top=58,d.bottom=-58,d.updateProjectionMatrix(),this.sunLight.shadow.bias=-4e-4,this.sunLight.shadow.normalBias=.35,this.group.add(this.sunLight),this.group.add(this.sunLight.target),s.environment=this.lowSpec?null:this.buildEnvironment(e),s.environmentIntensity=this.lowSpec?0:.12,s.fog=new Os(this.theme.fog,11e-5)}buildSky(){const t={uTop:{value:new L(this.theme.skyTop).convertSRGBToLinear()},uHorizon:{value:new L(this.theme.skyHorizon).convertSRGBToLinear()},uSun:{value:this.sunDir.clone()},uSunColor:{value:new L(this.theme.sunColor).convertSRGBToLinear()},uBelow:{value:new L(1192515).convertSRGBToLinear()}},e=new j({uniforms:t,side:Ns,depthWrite:!1,fog:!1,vertexShader:`
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform vec3 uSun;
        uniform vec3 uSunColor;
        uniform vec3 uBelow;
        varying vec3 vWorld;
        void main() {
          vec3 dir = normalize(vWorld - cameraPosition);
          float y = dir.y;
          vec3 col = mix(uHorizon, uTop, pow(clamp(y, 0.0, 1.0), 0.5));
          float sun = max(dot(dir, normalize(uSun)), 0.0);
          float disc = smoothstep(0.9992, 0.9996, sun);
          float glow = pow(sun, 14.0) * 0.18 + pow(sun, 140.0) * 0.9;
          col += uSunColor * (disc * 9.0 + glow);
          col = mix(col, uBelow, smoothstep(0.0, -0.12, y));
          col = mix(col, uHorizon * 1.05, smoothstep(0.07, -0.01, y) * 0.75);
          gl_FragColor = vec4(col, 1.0);
        }
      `}),s=new g(new vt(5e3,this.ultra?20:32,this.ultra?12:20),e);return s.frustumCulled=!1,s}buildEnvironment(t){const e=new Us(t),s=new is,i=this.buildSky();i.scale.setScalar(.35),s.add(i);const o=e.fromScene(s,0,1,1e4);return e.dispose(),o.texture}terrainHeight(t,e,s){const i=Math.hypot(t,e),o=this.shoreRadius+(Ge(t*.0035+11,e*.0035-7)-.5)*90,a=Ot(o+30,o-120,i),n=(Ge(t*.014+3,e*.014-9)-.35)*11,r=Ot(o-130,o-250,i);let l=O.lerp(-9,1.3,a)+n*r*a;const c=Ot(22,64,s.d),u=O.clamp(s.lateral,-7,7),f=s.node.pos.y-u*Math.sin(s.node.bank)-.18;return l=O.lerp(f,l,c),l}nearestTrack(t,e){let s=1/0,i=this.trackPointGrid[0];for(const a of this.trackPointGrid){const n=t-a.pos.x,r=e-a.pos.z,l=n*n+r*r;l<s&&(s=l,i=a)}const o=(t-i.pos.x)*i.side.x+(e-i.pos.z)*i.side.z;return{d:Math.sqrt(s),node:i,lateral:o}}buildTerrain(){const e=this.ultra?96:this.lowSpec?140:200,s=new st(1500,1500,e,e);s.rotateX(-Math.PI/2);const i=s.attributes.position,o=new Float32Array(i.count*3),a=new L(this.theme.sandWet),n=new L(this.theme.sandDry),r=new L(this.theme.sandHigh),l=new L(7297597),c=new L;for(let m=0;m<i.count;m++){const p=i.getX(m),b=i.getZ(m),w=this.nearestTrack(p,b),M=this.terrainHeight(p,b,w);i.setY(m,M);const y=Ot(.9,-.6,M),T=Ot(2.6,7,M);c.copy(n).lerp(r,T).lerp(a,y*.85),M<-1.2&&c.lerp(l,Ot(-1.2,-4,M));const P=(.92+Dt(p*.3,b*.3)*.16)*(.95+Math.sin(p*.021)*.03+Math.cos(b*.017)*.03);o[m*3]=c.r*P,o[m*3+1]=c.g*P,o[m*3+2]=c.b*P}s.setAttribute("color",new tt(o,3)),s.computeVertexNormals();const u=rs(),f=new E({map:u,normalMap:ni(),normalScale:new H(.9,.9),vertexColors:!0,roughness:.94,metalness:0}),d=new g(s,f);return d.receiveShadow=!0,d.name="terrain",d}buildWater(){return new j({uniforms:{uTime:{value:0},uSun:{value:this.sunDir.clone()},uDeep:{value:new L(this.theme.waterDeep)},uShallow:{value:new L(this.theme.waterShallow)},uSky:{value:new L(this.theme.waterSky)},uShore:{value:this.shoreRadius},uFog:{value:new L(this.theme.fog).convertSRGBToLinear()}},vertexShader:`
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform vec3 uSun;
        uniform vec3 uDeep;
        uniform vec3 uShallow;
        uniform vec3 uSky;
        uniform float uShore;
        uniform vec3 uFog;
        varying vec3 vWorld;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
        }
        float wave(vec2 p, vec2 dir, float freq, float speed){
          return sin(dot(p, dir) * freq + uTime * speed);
        }
        float height(vec2 p){
          float h = 0.0;
          h += wave(p, normalize(vec2(1.0, 0.4)), 0.09, 1.1) * 0.55;
          h += wave(p, normalize(vec2(-0.5, 1.0)), 0.15, 1.6) * 0.32;
          h += wave(p, normalize(vec2(0.8, -0.8)), 0.31, 2.3) * 0.16;
          h += (noise(p * 0.22 + uTime * 0.05) - 0.5) * 0.28;
          return h;
        }

        void main() {
          vec2 p = vWorld.xz;
          float e = 0.6;
          float h0 = height(p);
          float hx = height(p + vec2(e, 0.0));
          float hz = height(p + vec2(0.0, e));
          vec3 n = normalize(vec3((h0 - hx) * 1.6, 1.0, (h0 - hz) * 1.6));

          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(viewDir, n), 0.0), 4.0);
          fres = mix(0.06, 1.0, fres);

          float dist = length(p);
          float shoreWobble = 30.0 * (noise(p * 0.01) - 0.5);
          float shore = uShore - 62.0 + shoreWobble;
          float shallow = 1.0 - smoothstep(shore - 90.0, shore + 10.0, dist);
          vec3 base = mix(uDeep, uShallow, clamp(shallow, 0.0, 1.0) * 0.9);

          vec3 sunDir = normalize(uSun);
          vec3 halfV = normalize(sunDir + viewDir);
          float spec = pow(max(dot(n, halfV), 0.0), 220.0);
          float broad = pow(max(dot(n, halfV), 0.0), 18.0) * 0.22;

          vec3 col = mix(base, uSky, fres * 0.85);
          col += vec3(1.0, 0.86, 0.68) * (spec * 2.6 + broad);

          float foamBand = (1.0 - smoothstep(shore - 26.0, shore + 4.0, dist));
          float foamNoise = noise(p * 0.35 + uTime * 0.35) * 0.6 + noise(p * 0.9 - uTime * 0.2) * 0.4;
          float foam = smoothstep(0.52, 0.95, foamBand * 1.25 + foamNoise * 0.35 - 0.25);
          col = mix(col, vec3(0.96, 0.98, 0.98), clamp(foam, 0.0, 0.9) * 0.85);

          float sparkle = pow(noise(p * 3.0 + uTime * 0.8), 12.0) * 0.5;
          col += vec3(sparkle) * smoothstep(0.0, 0.35, fres);

          col = pow(max(col, 0.0), vec3(2.2));
          float fogDist = length(cameraPosition - vWorld);
          float fogF = 1.0 - exp(-pow(fogDist * 0.00022, 2.0));
          col = mix(col, uFog, fogF);
          gl_FragColor = vec4(col, 1.0);
        }
      `,side:oe})}buildPalms(){const t=new X(.24,.46,8.4,8,8);t.translate(0,4.2,0);const e=t.attributes.position;for(let p=0;p<e.count;p++){const w=e.getY(p)/8.4;e.setX(p,e.getX(p)+w*w*1.5),e.setZ(p,e.getZ(p)+w*w*.4)}t.computeVertexNormals();const s=this.buildFrondGeometry(),i=new E({color:7162671,roughness:.95,metalness:0}),o=new E({map:li(),alphaTest:.22,side:oe,roughness:.82,metalness:0,color:16777215}),a=this.flora==="barren"?0:this.ultra?30:this.lowSpec?50:this.flora==="sparse"?60:120,n=a>0?this.scatter(a,20,(p,b,w)=>w>1.4&&w<12):[],r=new rt(t,i,n.length),l=new rt(s,o,n.length);r.castShadow=!0,l.castShadow=!1;const c=new J,u=new Tt,f=new Nt,d=new x,m=new x;n.forEach((p,b)=>{const w=.8+Math.random()*.7;m.set(p.x,p.h-.2,p.z),f.set(0,Math.random()*Math.PI*2,(Math.random()-.5)*.09),u.setFromEuler(f),d.set(w,w*(.9+Math.random()*.3),w),c.compose(m,u,d),r.setMatrixAt(b,c),c.compose(m,u,d),l.setMatrixAt(b,c)}),r.instanceMatrix.needsUpdate=!0,l.instanceMatrix.needsUpdate=!0,this.group.add(r,l)}buildFrondGeometry(){const t=[];for(let s=0;s<11;s++){const i=new st(5.8,3.1,1,1);i.rotateX(-Math.PI/2),i.translate(2.8,0,0),i.rotateZ(-.42-Math.random()*.3),i.rotateY(s/11*Math.PI*2+Math.random()*.25),i.translate(.5,8.1,.2),t.push(i)}return yi(t)}buildRocks(){const t=new Pe(1,1),e=t.attributes.position;for(let c=0;c<e.count;c++){const u=new x(e.getX(c),e.getY(c),e.getZ(c)),f=.72+Dt(u.x*4.3,u.z*3.7)*.6;u.multiplyScalar(f),e.setXYZ(c,u.x,u.y*.8,u.z)}t.computeVertexNormals();const s=new E({color:8089960,roughness:.92,metalness:.02,flatShading:!0}),i=this.scatter(this.ultra?34:this.lowSpec?56:96,9,(c,u,f)=>f>.2),o=new rt(t,s,i.length),a=new J,n=new Tt,r=new x,l=new x;i.forEach((c,u)=>{const f=.5+Math.random()*2.1;r.set(f*(.8+Math.random()*.5),f*(.6+Math.random()*.5),f),n.setFromEuler(new Nt(0,Math.random()*6.28,0)),l.set(c.x,c.h-.2,c.z),a.compose(l,n,r),o.setMatrixAt(u,a)}),o.castShadow=!0,o.receiveShadow=!0,this.group.add(o)}buildBeachProps(){const t=new E({color:16735050,roughness:.7}),e=new E({color:16246472,roughness:.8}),s=new E({color:14275784,roughness:.5,metalness:.4}),i=new ee(2.4,1.05,16,1,!0),o=new X(.055,.055,2.6,6),a=this.flora==="tropical"?this.ultra?8:this.lowSpec?14:26:0;(a>0?this.scatter(a,30,(f,d,m)=>m>.3&&m<3.6):[]).forEach((f,d)=>{const m=new q,p=new g(o,s);p.position.y=1.3;const b=new g(i,d%2?t:e);b.position.y=2.6,b.castShadow=!0,m.add(p,b),m.position.set(f.x,f.h,f.z),m.rotation.y=Math.random()*6.28,m.rotation.z=(Math.random()-.5)*.12,this.group.add(m)});const r=new E({color:15258542,roughness:.9}),l=new E({color:9067316,roughness:.95}),c=this.flora==="tropical"?this.ultra?2:this.lowSpec?4:7:0,u=c>0?this.scatter(c,46,(f,d,m)=>m>2&&m<6):[];for(const f of u){const d=new q,m=new g(new W(6,3.4,5),r);m.position.y=1.7,m.castShadow=!0;const p=new g(new ee(5.2,2.6,4),l);p.position.y=4.4,p.rotation.y=Math.PI/4,p.castShadow=!0;const b=new g(new W(1.2,2.1,.12),new E({color:4008476,roughness:.8}));b.position.set(0,1.05,2.52),d.add(m,p,b),d.position.set(f.x,f.h,f.z),d.rotation.y=Math.random()*6.28,this.group.add(d)}}buildIslands(){const t=new E({color:6061940,roughness:1,flatShading:!0});for(let e=0;e<5;e++){const s=e/5*Math.PI*2+.6,i=950+Math.random()*380,o=new ee(150+Math.random()*130,34+Math.random()*40,7),a=new g(o,t);a.position.set(Math.cos(s)*i,2,Math.sin(s)*i),a.rotation.y=Math.random()*3,this.group.add(a)}}buildTrackProps(t){const e=new $t(.52,.19,8,16);e.rotateX(Math.PI/2);const s=new E({color:1711392,roughness:.95,metalness:.02}),i=[];for(let a=0;a<26;a++){const n=Math.floor(a/26*t.nodes.length+37)%t.nodes.length,r=t.nodes[n];if(Math.abs(r.curv)<.0018)continue;const l=r.curv>0?1:-1,c=r.pos.clone().addScaledVector(r.side,l*(t.halfWidth+2.6)).addScaledVector(new x(0,1,0),-.1),u=Math.atan2(r.tan.x,r.tan.z);for(let f=0;f<3;f++)i.push(new J().compose(c.clone().add(new x(0,.19+f*.4,0)),new Tt().setFromEuler(new Nt(0,u,0)),new x(1,1,1)))}const o=new rt(e,s,i.length);i.forEach((a,n)=>o.setMatrixAt(n,a)),o.castShadow=!0,o.receiveShadow=!0,this.group.add(o)}buildBushes(){const t=new Pe(1,0),e=t.attributes.position;for(let c=0;c<e.count;c++){const u=new x(e.getX(c),e.getY(c),e.getZ(c));u.multiplyScalar(.8+Dt(u.x*5.1,u.z*4.3)*.5),e.setXYZ(c,u.x,u.y*.7,u.z)}t.computeVertexNormals();const s=new E({color:4160053,roughness:.9,flatShading:!0}),i=this.scatter(this.ultra?26:this.lowSpec?50:90,16,(c,u,f)=>f>1.2&&f<9),o=new rt(t,s,i.length),a=new J,n=new Tt,r=new x,l=new x;i.forEach((c,u)=>{const f=.7+Math.random()*1.6;r.set(f,f*(.7+Math.random()*.4),f),n.setFromEuler(new Nt(0,Math.random()*6.28,0)),l.set(c.x,c.h+f*.35,c.z),a.compose(l,n,r),o.setMatrixAt(u,a)}),o.castShadow=!0,o.receiveShadow=!0,this.group.add(o)}buildGrandstand(t){const e=t.sample(t.sampleCount-64),s=e.pos.clone().addScaledVector(e.side,t.halfWidth+14),i=Math.atan2(e.tan.x,e.tan.z),o=new q,a=new E({color:13621469,roughness:.8});for(let y=0;y<3;y++){const T=new g(new W(20,.55,2.2),a);T.position.set(0,.27+y*.55,-y*2),T.castShadow=!0,T.receiveShadow=!0,o.add(T)}const n=new E({color:2911887,roughness:.7}),r=new g(new W(21,.25,7.5),n);r.position.set(0,6.1,-2.4),r.rotation.x=.08,r.castShadow=!0,o.add(r);const l=new E({color:9280163,roughness:.5,metalness:.6});for(const y of[-1,1]){const T=new g(new X(.12,.12,6.1,6),l);T.position.set(y*9.8,3.05,-5.8),o.add(T)}const c=new se(.24,.42,5,8),u=new E({color:16777215,roughness:.85}),f=new rt(c,u,54),d=new J,m=new Tt,p=new x(1,1,1),b=new x,w=[16735022,3142367,16765286,16731501,8146431,5025616,16777215];let M=0;for(let y=0;y<3;y++)for(let T=0;T<18;T++)b.set(-8.5+T*1,.85+y*.55,-.6-y*2+Math.random()*.3),m.setFromEuler(new Nt(0,Math.PI,0)),d.compose(b,m,p),f.setMatrixAt(M,d),f.setColorAt(M,new L(w[M%w.length])),M++;f.instanceColor&&(f.instanceColor.needsUpdate=!0),f.castShadow=!0,o.add(f),o.position.set(s.x,s.y,s.z),o.rotation.y=i+Math.PI/2,this.group.add(o)}scatter(t,e,s){const i=[];let o=0;for(;i.length<t&&o++<t*60;){const a=Math.random()*Math.PI*2,n=60+Math.sqrt(Math.random())*(this.shoreRadius-80),r=Math.cos(a)*n,l=Math.sin(a)*n,c=this.nearestTrack(r,l);if(c.d<e)continue;const u=this.terrainHeight(r,l,c);s(r,l,u)&&i.push({x:r,z:l,h:u})}return i}groundHeight(t,e){return this.terrainHeight(t,e,this.nearestTrack(t,e))}dispose(){this.sunLight.shadow.map?.dispose(),this.sunLight.shadow.map=null,this.group.traverse(t=>{const e=t;if(!e.isMesh)return;e.geometry?.dispose();const s=Array.isArray(e.material)?e.material:[e.material];for(const i of s)i?.dispose()}),this.waterMat.dispose()}update(t,e,s,i){this.waterMat.uniforms.uTime.value=e,this.sunLight.position.copy(s).addScaledVector(this.sunDir,190),this.sunLight.target.position.copy(s),this.sunLight.target.updateMatrixWorld(),this.sky.position.copy(i.position)}}const Jt=new x;function $(h,t,e,s,i,o){const a=2*Math.PI*i/4,n=Math.max(o-2*i,0),r=Math.PI/4;Jt.copy(t),Jt[s]=0,Jt.normalize();const l=.5*a/(a+n),c=1-Jt.angleTo(h)/r;return Math.sign(Jt[e])===1?c*l:n/(a+n)+l+l*(1-c)}class ke extends W{constructor(t=1,e=1,s=1,i=2,o=.1){const a=i*2+1;if(o=Math.min(t/2,e/2,s/2,o),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:s,segments:i,radius:o},a===1)return;const n=this.toNonIndexed();this.index=null,this.attributes.position=n.attributes.position,this.attributes.normal=n.attributes.normal,this.attributes.uv=n.attributes.uv;const r=new x,l=new x,c=new x(t,e,s).divideScalar(2).subScalar(o),u=this.attributes.position.array,f=this.attributes.normal.array,d=this.attributes.uv.array,m=u.length/6,p=new x,b=.5/a;for(let w=0,M=0;w<u.length;w+=3,M+=2)switch(r.fromArray(u,w),l.copy(r),l.x-=Math.sign(l.x)*b,l.y-=Math.sign(l.y)*b,l.z-=Math.sign(l.z)*b,l.normalize(),u[w+0]=c.x*Math.sign(r.x)+l.x*o,u[w+1]=c.y*Math.sign(r.y)+l.y*o,u[w+2]=c.z*Math.sign(r.z)+l.z*o,f[w+0]=l.x,f[w+1]=l.y,f[w+2]=l.z,Math.floor(w/m)){case 0:p.set(1,0,0),d[M+0]=$(p,l,"z","y",o,s),d[M+1]=1-$(p,l,"y","z",o,e);break;case 1:p.set(-1,0,0),d[M+0]=1-$(p,l,"z","y",o,s),d[M+1]=1-$(p,l,"y","z",o,e);break;case 2:p.set(0,1,0),d[M+0]=1-$(p,l,"x","z",o,t),d[M+1]=$(p,l,"z","x",o,s);break;case 3:p.set(0,-1,0),d[M+0]=1-$(p,l,"x","z",o,t),d[M+1]=1-$(p,l,"z","x",o,s);break;case 4:p.set(0,0,1),d[M+0]=1-$(p,l,"x","y",o,t),d[M+1]=1-$(p,l,"y","x",o,e);break;case 5:p.set(0,0,-1),d[M+0]=$(p,l,"x","y",o,t),d[M+1]=1-$(p,l,"y","x",o,e);break}}static fromJSON(t){return new ke(t.width,t.height,t.depth,t.segments,t.radius)}}const be=[{id:"dune",name:"DUNAS",tag:"EQUILIBRADO",number:7,body:16739125,accent:3142367,trim:1319211,style:"buggy",stats:{maxSpeed:35.5,accel:19,turn:2.15,grip:1}},{id:"reef",name:"ARRECIFE",tag:"VELOCIDAD",number:3,body:3111935,accent:16765286,trim:1055275,style:"formula",stats:{maxSpeed:37.5,accel:16.5,turn:1.92,grip:.94}},{id:"mango",name:"MANGO",tag:"ACELERACIÓN",number:11,body:16763196,accent:16731501,trim:2300432,style:"muscle",stats:{maxSpeed:34.5,accel:22,turn:2.25,grip:1.02}},{id:"kelp",name:"ALGAS",tag:"CURVAS",number:5,body:3129201,accent:15400952,trim:859928,style:"rally",stats:{maxSpeed:35,accel:18,turn:2.42,grip:1.08}}];class Ee{spec;isPlayer;group=new q;body=new q;wheels;shieldMesh;flames;brakeMats;driverParts;pos=new x;yaw=0;speed=0;steer=0;brakeInput=0;driftAmount=0;driftBlend=0;boostPower=1.35;driftCharge=0;driftTier=0;drifting=!1;boostTime=0;spinTime=0;shieldTime=0;lapCount=0;hasCrossedStart=!1;index=0;hint=-1;finished=!1;finishTime=0;lapStart=0;lastLap=0;bestLap=1/0;rank=1;item=null;offroad=!1;wallHit=0;bumpTimer=0;wheelSpin=0;bodyRoll=0;bodyPitch=0;bob=Math.random()*6.28;span;speedScale=1;constructor(t,e,s,i){this.spec=t,this.isPlayer=e,this.span=s.sampleCount;const o=s.gridSlot(i);this.pos.copy(o.pos),this.yaw=o.yaw,this.hint=s.nearest(this.pos,-1).index;const a=Ai(t);a.root.scale.setScalar(1.24),this.body.add(a.root),this.wheels=a.wheels,this.flames=a.flames,this.brakeMats=a.brakeMats,this.driverParts=a.driverParts,this.group.add(this.body),this.shieldMesh=new g(new vt(2.6,24,18),new Ut({color:8256767,transparent:!0,opacity:.22,roughness:.05,metalness:0,transmission:.6,clearcoat:1,side:oe,depthWrite:!1})),this.shieldMesh.position.y=1.2,this.shieldMesh.visible=!1,this.group.add(this.shieldMesh);const n=new g(new st(3,4.2),new gt({map:gi(),transparent:!0,opacity:.55,depthWrite:!1,color:0}));n.rotation.x=-Math.PI/2,n.position.y=.03,n.renderOrder=1,this.group.add(n)}get forward(){return xi(this.yaw)}get right(){return bi(this.yaw)}get kmh(){return this.speed*3.6}get totalProgress(){return this.hasCrossedStart?this.lapCount*this.span+this.index:this.index-this.span}resetAt(t,e){const s=t.gridSlot(e);this.pos.copy(s.pos),this.yaw=s.yaw,this.speed=0,this.steer=0,this.driftAmount=0,this.driftCharge=0,this.driftTier=0,this.boostTime=0,this.spinTime=0,this.shieldTime=0,this.lapCount=0,this.hasCrossedStart=!1,this.finished=!1,this.item=null,this.offroad=!1,this.bestLap=1/0;const i=t.nearest(this.pos,-1);this.hint=i.index,this.index=i.index,this.syncModel(i,0,0)}startBoost(){this.boostTime=Math.max(this.boostTime,1.6)}hit(){if(this.shieldTime>0){this.shieldTime=0,this.bumpTimer=.4;return}this.spinTime>0||(this.spinTime=1.15,this.speed*=.45,this.driftCharge=0,this.driftAmount=0,this.drifting=!1)}useBoost(t,e=1.35,s=0){this.boostTime=Math.max(this.boostTime,t),this.boostPower=e,s>0&&(this.speed=Math.min(this.speed+s,this.spec.stats.maxSpeed*e*1.1))}activateShield(){this.shieldTime=7}respawn(t){const e=t.nearest(this.pos,this.hint),s=e.node;this.pos.copy(s.pos).addScaledVector(s.side,O.clamp(e.lateral,-4,4)),this.yaw=Math.atan2(s.tan.x,s.tan.z),this.speed=0,this.spinTime=0,this.driftAmount=0,this.driftCharge=0,this.hint=e.index,this.index=e.index,this.syncModel(e,0,0)}update(t,e,s,i,o,a){const n=this.spec.stats;if(this.bumpTimer=Math.max(0,this.bumpTimer-t),!o){this.speed=0,this.steer+=(0-this.steer)*Math.min(1,t*6);const y=e.nearest(this.pos,this.hint);this.hint=y.index,this.index=y.index,this.pos.y=this.surfaceY(y,e,a),this.syncModel(y,t,i);return}const r=this.spinTime>0;r&&(this.spinTime=Math.max(0,this.spinTime-t),this.yaw+=t*11,this.speed*=1-1.4*t),this.steer+=(s.steer-this.steer)*Math.min(1,t*7.5),this.brakeInput=s.brake?1:0;const l=s.drift&&this.speed>11&&Math.abs(this.steer)>.3&&!r&&o;this.driftBlend+=((l?1:0)-this.driftBlend)*Math.min(1,t*(l?8:5)),this.drifting=l;let c=n.maxSpeed*this.speedScale;if(this.offroad&&(c*=.65),this.boostTime>0&&(c*=this.boostPower,this.boostTime=Math.max(0,this.boostTime-t)),!r){const y=(this.boostTime>0?n.accel*(this.boostPower>1.4?2.2:1.5):n.accel)*(this.offroad?.6:1);if(s.brake?this.speed=Math.max(0,this.speed-26*t):this.speed<c?this.speed+=y*t*(1-this.speed/(c*1.12)):this.speed-=9*t,!s.brake&&!l&&this.speed>10){const R=Math.round(14+this.speed*1),z=Math.abs(e.sample(this.index+R).curv);if(z>.0015){const D=Math.sqrt(13/z);this.speed>D&&(this.speed-=(this.speed-D)*2.2*t)}}this.speed<0&&(this.speed=0);const T=1+.2*this.driftBlend,P=O.clamp((this.speed-16)/24,0,1),I=n.turn*(.98-.42*P)*T;this.yaw+=this.steer*I*t,Math.abs(this.steer)>.65&&this.speed>24&&(this.speed-=(this.speed-24)*.4*t)}if(l)this.driftAmount+=(this.steer*.35*this.driftBlend-this.driftAmount)*Math.min(1,t*7),this.driftCharge+=t*(.8+Math.abs(this.steer)*1.1),this.speed*=1-.06*t,this.driftTier=this.driftCharge>2.2?3:this.driftCharge>1.2?2:this.driftCharge>.5?1:0;else{if(this.driftAmount+=(0-this.driftAmount)*Math.min(1,t*6),this.driftCharge>.5&&this.speed>6){const y=this.driftTier>=3?1.8:this.driftTier===2?1.3:.9,T=this.driftTier>=3?5.5:this.driftTier===2?4:2.5;this.useBoost(y,1.28,T)}this.driftCharge=Math.max(0,this.driftCharge-t*1.4),this.driftTier=0}const u=this.forward,f=this.right,d=-this.driftAmount*this.speed*.32;this.pos.addScaledVector(u,this.speed*t),this.pos.addScaledVector(f,d*t);const m=this.index,p=e.nearest(this.pos,this.hint);this.hint=p.index,this.index=p.index;const b=p.lateral,w=e.halfWidth+1.2;this.offroad=Math.abs(b)>w;const M=e.halfWidth+8.5;if(Math.abs(b)>M){const y=p.node,T=Math.sign(b);this.pos.copy(y.pos).addScaledVector(y.side,T*M),this.speed*=.82,this.wallHit=.35}else this.wallHit=Math.max(0,this.wallHit-t);this.pos.y=this.surfaceY(p,e,a),this.checkLap(p,i,m,e.sampleCount),this.syncModel(p,t,i)}surfaceY(t,e,s){const i=t.lateral,o=Math.abs(i),a=t.node.pos.y-i*Math.sin(t.node.bank);if(o<=e.halfWidth+1.3)return a+.02;if(o<=e.halfWidth+4.6)return a-.1+.02;if(!s)return a+.02;const n=s(this.pos.x,this.pos.z),r=O.smoothstep(o,e.halfWidth+4.6,e.halfWidth+7.2);return O.lerp(a-.1,n,r)+.02}checkLap(t,e,s,i){if(t.index<i*.22&&s>i*.75)if(!this.hasCrossedStart)this.hasCrossedStart=!0,this.lapStart=e,this.lastLap=e;else{const a=e-this.lapStart;this.bestLap=Math.min(this.bestLap,a),this.lapCount++,this.lapStart=e,this.lastLap=e}}syncModel(t,e,s){this.group.position.copy(this.pos);const i=this.yaw+this.driftAmount*.9;this.group.rotation.y=i;const o=-this.steer*.09-this.driftAmount*.18;this.bodyRoll+=(o-this.bodyRoll)*Math.min(1,e*7);const a=-Math.min(.06,this.speed*.0012);this.bodyPitch+=(a-this.bodyPitch)*Math.min(1,e*5),this.body.rotation.z=this.bodyRoll-t.node.bank,this.body.rotation.x=this.bodyPitch,this.bob+=e*(6+this.speed*.35);const n=this.offroad?.055:.012;this.body.position.y=Math.sin(this.bob)*n+(this.boostTime>0?.06:0)-this.brakeInput*.035,this.wheelSpin+=this.speed/.46*e;for(const c of[this.wheels.fl,this.wheels.fr,this.wheels.rl,this.wheels.rr])c.rotation.x=this.wheelSpin;const r=this.steer*.42;this.wheels.fl.parent.rotation.y=r,this.wheels.fr.parent.rotation.y=r,this.driverParts.steering.rotation.set(-1,0,-this.steer*1.35),this.driverParts.arms.forEach((c,u)=>{c.rotation.z=(u===0?-1:1)*.16+this.steer*.13,c.rotation.x=-.95+Math.abs(this.steer)*.08});for(const c of this.brakeMats)c.emissiveIntensity=this.brakeInput>0?3.6:1.1;if(this.shieldMesh.visible=this.shieldTime>0,this.shieldTime>0){this.shieldTime=Math.max(0,this.shieldTime-e);const c=1+Math.sin(s*6)*.03;this.shieldMesh.scale.setScalar(c),this.shieldMesh.material.opacity=.16+Math.sin(s*9)*.05}const l=this.boostTime>0;if(this.flames.visible=l,l){const c=.85+Math.random()*.4;this.flames.scale.set(c,1,c)}}}function Ai(h){const t=new q,e=new Ut({color:h.body,roughness:.24,metalness:.18,clearcoat:1,clearcoatRoughness:.08,normalMap:fi(),normalScale:new H(.06,.06),envMap:Fe(),envMapIntensity:.3}),s=new Ut({color:h.accent,roughness:.28,metalness:.22,clearcoat:.9,envMap:Fe(),envMapIntensity:.22}),i=new E({color:h.trim,roughness:.6,metalness:.35}),o=new E({map:ui(),color:16777215,roughness:.92,metalness:.02}),a=new E({color:2764595,roughness:.9,metalness:.05}),n=new E({color:14411500,roughness:.16,metalness:1}),r=new E({color:2108470,roughness:.8}),l=new Ut({color:661024,roughness:.04,metalness:.35,clearcoat:1}),c=(v,S,C,k=.1)=>new ke(v,S,C,3,k),u=new g(c(1.62,.24,2.6,.1),i);u.position.set(0,.44,0),t.add(u);const f=new g(c(1.52,.46,2.95,.16),e);f.position.set(0,.66,0),t.add(f);const d=new g(c(1.32,.32,1.25,.14),e);d.position.set(0,.9,.92),d.rotation.x=-.1,t.add(d);const m=new g(c(.4,.34,1.28,.08),s);m.position.set(0,.92,.92),m.rotation.x=-.1,t.add(m);const p=new g(c(1.66,.16,.3,.06),i);p.position.set(0,.5,1.62),t.add(p);for(const v of[-1,1]){const S=new g(c(.32,.34,1.4,.1),s);S.position.set(v*.84,.6,.05),t.add(S);const C=new g(new W(.26,.06,.9),n);C.position.set(v*.78,.4,.15),t.add(C);const k=new g(new st(.52,.52),new gt({map:Ue(h.number),transparent:!0}));k.position.set(v*.86,.78,.05),k.rotation.y=v*Math.PI*.5,t.add(k)}const b=new g(c(1.46,.5,1.15,.14),e);b.position.set(0,.92,-1.08),t.add(b);const w=new g(c(.9,.42,.68,.08),i);w.position.set(0,1.18,-1.05),t.add(w);const M=new g(new X(.14,.14,.24,10),n);M.position.set(0,1.45,-1),t.add(M);for(const v of[-1,1]){const S=new g(new X(.075,.1,.75,10),n);S.position.set(v*.38,1.02,-1.48),S.rotation.x=Math.PI/2-.3,t.add(S);const C=new g(new X(.12,.12,.09,10),i);C.position.set(v*.38,1.08,-1.82),C.rotation.x=Math.PI/2-.3,t.add(C)}const y=(v,S,C=.045,k=i)=>{const F=new x().subVectors(S,v),V=new g(new X(C,C,F.length(),8),k);return V.position.copy(v).addScaledVector(F,.5),V.quaternion.setFromUnitVectors(new x(0,1,0),F.clone().normalize()),V};if(h.style==="buggy"||h.style==="rally"){for(const v of[-1,1])t.add(y(new x(v*.56,.88,.42),new x(v*.5,1.76,.18))),t.add(y(new x(v*.56,.88,-.78),new x(v*.5,1.7,-.52))),t.add(y(new x(v*.5,1.76,.18),new x(v*.5,1.7,-.52)));t.add(y(new x(-.5,1.76,.18),new x(.5,1.76,.18))),t.add(y(new x(-.5,1.7,-.52),new x(.5,1.7,-.52)))}const T=new g(c(.62,.74,.54,.1),r);T.position.set(0,1.06,-.48),T.rotation.x=-.16,t.add(T);const P=new q,I=[],R=new g(new se(.21,.3,6,12),r);R.position.set(0,1.38,-.36),R.rotation.x=-.14,P.add(R);const z=new g(new se(.1,.34,4,8),s);z.position.set(0,1.47,-.38),z.rotation.z=Math.PI/2,P.add(z);for(const v of[-1,1]){const S=new g(new se(.06,.34,4,8),r);S.position.set(v*.19,1.4,.02),S.rotation.x=-.95,S.rotation.z=v*.16,P.add(S),I.push(S)}const D=new g(new $t(.15,.028,10,22),i);D.position.set(0,1.38,.26),D.rotation.x=-1;const B=new g(new X(.035,.035,.05,10),n);B.rotation.x=Math.PI/2,B.position.z=.01,D.add(B);for(let v=0;v<3;v++){const S=new g(new W(.26,.018,.02),n);S.rotation.z=v/3*Math.PI,D.add(S)}P.add(D);for(const v of[-1,1]){const S=new g(new W(.045,.42,.02),new E({color:1186336,roughness:.9}));S.position.set(v*.11,1.4,-.14),S.rotation.z=v*.28,S.rotation.x=-.14,P.add(S);const C=new g(new vt(.055,8,6),new E({color:1778732,roughness:.7}));C.position.set(v*.13,1.36,.16),P.add(C)}const N=new g(new vt(.25,20,16),s);N.position.set(0,1.8,-.34),P.add(N);const U=new g(new vt(.255,20,16,0,Math.PI*2,.72,.6),l);U.position.copy(N.position),U.rotation.x=.22,P.add(U);const Q=new g(new W(.22,.05,.1),s);Q.position.set(0,1.86,-.55),Q.rotation.x=.35,P.add(Q),h.style==="muscle"&&(P.position.y=-.3),h.style==="formula"&&(P.position.y=-.12),t.add(P);const Pt={steering:D,arms:I},wt=[],Lt=new E({color:16774358,emissive:16773320,emissiveIntensity:1.5,roughness:.2});for(const v of[-1,1]){const S=new g(new vt(.09,10,8),Lt);S.position.set(v*.36,.98,1.46),t.add(S);const C=new E({color:16724804,emissive:16716066,emissiveIntensity:1.1,roughness:.4});wt.push(C);const k=new g(new W(.38,.09,.06),C);k.position.set(v*.46,.92,-1.66),t.add(k)}const ft=new g(c(1.68,.08,.46,.04),e);ft.position.set(0,1.58,-1.62),ft.rotation.x=-.14,t.add(ft);for(const v of[-1,1]){const S=new g(c(.05,.28,.5,.03),s);S.position.set(v*.86,1.58,-1.62),t.add(S);const C=new g(new W(.06,.46,.14),i);C.position.set(v*.52,1.34,-1.58),t.add(C)}const mt=new g(new X(.014,.014,1.35,5),n);mt.position.set(-.64,1.95,-.9),mt.rotation.z=.2,t.add(mt);const G=new g(new st(.42,.24),new E({color:h.accent,side:oe,roughness:.7}));G.position.set(-.45,2.55,-.88),t.add(G);const it=new g(new st(.56,.56),new gt({map:Ue(h.number),transparent:!0}));it.position.set(0,1.1,1.42),it.rotation.x=-Math.PI/2+.14,t.add(it);const _=(v,S)=>{const C=new q,k=new q,F=new g(new X(v,v,S,24),o);F.rotation.z=Math.PI/2;const V=new g(new $t(v*.94,v*.1,6,22),a);V.rotation.y=Math.PI/2;const St=new g(new $t(v*.56,v*.055,10,28),n);St.rotation.y=Math.PI/2;const ht=new g(new X(v*.2,v*.2,S+.08,10),s);ht.rotation.z=Math.PI/2,k.add(F,V,St,ht);for(const dt of[-1,1]){const ut=new g(new $t(v*.52,v*.035,6,20),n);ut.rotation.y=Math.PI/2,ut.position.x=dt*(S/2+.015),k.add(ut);const kt=new g(new X(v*.1,v*.1,.04,10),i);kt.rotation.z=Math.PI/2,kt.position.x=dt*(S/2+.04),k.add(kt)}for(let dt=0;dt<6;dt++){const ut=new g(new W(S+.05,v*.07,v*.72),i);ut.rotation.x=dt/6*Math.PI,k.add(ut)}const Gt=new E({color:6975606,roughness:.35,metalness:.85}),zt=new g(new X(v*.5,v*.5,.035,26),Gt);zt.rotation.z=Math.PI/2;const Bt=new g(new W(.06,v*.26,v*.16),new E({color:14170666,roughness:.35,metalness:.3}));return Bt.position.set(0,v*.32,0),C.add(k,zt,Bt),{holder:C,spin:k}},ot=_(.4,.3),xt=_(.4,.3),bt=_(.5,.4),Mt=_(.5,.4);ot.holder.position.set(-.85,.4,.98),xt.holder.position.set(.85,.4,.98),bt.holder.position.set(-.95,.5,-.98),Mt.holder.position.set(.95,.5,-.98),t.add(ot.holder,xt.holder,bt.holder,Mt.holder);for(const v of[-1,1])t.add(y(new x(v*.72,.55,-.98),new x(v*.95,.5,-.98),.035,n)),t.add(y(new x(v*.66,.55,.98),new x(v*.85,.4,.98),.03,n));if(h.style==="formula"){const v=new g(c(2,.06,.42,.03),e);v.position.set(0,.3,1.62),t.add(v);for(const F of[-1,1]){const V=new g(c(.05,.26,.44,.02),s);V.position.set(F*.96,.3,1.62),t.add(V)}const S=new g(c(.62,.26,1,.12),s);S.position.set(0,.72,1.42),S.rotation.x=-.06,t.add(S);const C=new g(c(.7,.42,1.1,.14),s);C.position.set(0,1.18,-.85),t.add(C);const k=new g(c(.5,.34,.4,.1),i);k.position.set(0,1.42,-.62),t.add(k)}if(h.style==="muscle"){const v=new g(c(1.4,.16,1.5,.08),e);v.position.set(0,1,.62),t.add(v);const S=new g(c(1.34,.58,1.15,.14),e);S.position.set(0,1.32,-.35),t.add(S);const C=new g(c(1.2,.4,.06,.03),l);C.position.set(0,1.4,.24),C.rotation.x=-.45,t.add(C);const k=new g(c(.5,.28,.5,.06),n);k.position.set(0,1.16,.78),t.add(k);const F=new g(new X(.16,.2,.22,8),i);F.position.set(0,1.36,.72),t.add(F);for(const St of[-1,1]){const ht=new g(new X(.07,.09,.9,8),n);ht.rotation.x=Math.PI/2,ht.position.set(St*.86,.52,-.1),t.add(ht)}const V=new g(c(1.5,.08,.3,.04),s);V.position.set(0,1.34,-1.16),t.add(V)}if(h.style==="rally"){const v=new g(c(1.36,.14,1.3,.06),e);v.position.set(0,1.92,-.32),t.add(v);const S=new g(c(.42,.14,.42,.04),i);S.position.set(0,2.02,-.1),t.add(S);for(const C of[-1,1]){const k=new g(c(.5,.26,1.3,.12),e);k.position.set(C*.98,.84,-.98),t.add(k);const F=new g(c(.4,.3,.1,.02),i);F.position.set(C*.98,.45,-1.6),t.add(F)}}const yt=new E({color:856598,roughness:.6,metalness:.4});for(const v of[-1,1]){for(let F=0;F<3;F++){const V=new g(new W(.03,.022,.52),yt);V.position.set(v*.99,.58+F*.07,.02),t.add(V)}const S=new g(new X(.014,.018,.2,6),i);S.position.set(v*.6,1.52,.3),S.rotation.z=v*.7,t.add(S);const C=new g(c(.17,.1,.05,.02),s);C.position.set(v*.7,1.58,.3),C.rotation.y=v*.25,t.add(C);const k=new g(new W(.06,.5,.02),yt);k.position.set(v*.13,1.3,-.68),k.rotation.x=-.18,t.add(k)}const at=new g(c(.16,.06,.05,.02),yt);at.position.set(0,1.63,-.1),t.add(at);const lt=new E({color:2760728,roughness:.7});for(const v of[-1,1]){const S=new g(new W(.012,.04,1.1),lt);S.position.set(v*.78,.9,.55),t.add(S)}const K=new q,ct=new gt({color:4909311,transparent:!0,opacity:.8,toneMapped:!1}),ne=new gt({color:16773824,transparent:!0,opacity:.95,toneMapped:!1});for(const v of[-1,1]){const S=new g(new ee(.15,1,10,1,!0),ct);S.rotation.x=-Math.PI/2-.3,S.position.set(v*.38,1.02,-2.25);const C=new g(new ee(.075,.5,8,1,!0),ne);C.rotation.x=-Math.PI/2-.3,C.position.set(v*.38,1.04,-2.12),K.add(S,C)}return K.visible=!1,t.add(K),t.traverse(v=>{v.isMesh&&(v.castShadow=!0,v.receiveShadow=!0)}),{root:t,wheels:{fl:ot.spin,fr:xt.spin,rl:bt.spin,rr:Mt.spin},flames:K,brakeMats:wt,driverParts:Pt}}const Rt=new x(0,1,0);class Ci{camera;desired=new x;lookAt=new x;shakeOffset=new x;smoothLook=new x;shake=0;fov=66;orbit=0;intro=0;mobile=!1;heightBias=0;mode="chase";constructor(t){try{const e=Number(localStorage.getItem("cobalt-cam-height"));Number.isFinite(e)&&(this.heightBias=O.clamp(e,-1.5,4))}catch{}this.camera=new Fs(66,t,.35,9e3),this.camera.position.set(0,12,26),this.smoothLook.set(0,0,0)}resize(t){this.camera.aspect=t,this.camera.updateProjectionMatrix()}nudgeHeight(t){this.heightBias=O.clamp(this.heightBias+t,-1.5,4);try{localStorage.setItem("cobalt-cam-height",String(this.heightBias))}catch{}}kick(t=1){this.shake=Math.min(1.4,this.shake+t)}beginIntro(){this.intro=0}updateMenu(t,e,s){this.orbit+=t*.16;const i=8.6+Math.sin(s*.2)*.8,o=4+Math.sin(s*.31)*.5;this.desired.set(e.x+Math.sin(this.orbit)*i,e.y+o,e.z+Math.cos(this.orbit)*i);const a=1-Math.exp(-t*3.5);this.camera.position.lerp(this.desired,a),this.smoothLook.lerp(e,1-Math.exp(-t*6)),this.camera.lookAt(this.smoothLook.x,this.smoothLook.y+.9,this.smoothLook.z),this.fov+=(46-this.fov)*Math.min(1,t*3),this.camera.fov=this.fov,this.camera.updateProjectionMatrix()}updateCockpit(t,e){const s=e.forward,i=e.pos.clone().addScaledVector(Rt,1.98).addScaledVector(s,.25);this.camera.position.lerp(i,1-Math.exp(-t*30));const o=-e.driftAmount*.9,a=s.clone().applyAxisAngle(Rt,o),n=e.pos.clone().addScaledVector(a,24).addScaledVector(Rt,1.9+this.heightBias*.25);this.smoothLook.lerp(n,1-Math.exp(-t*16)),this.camera.lookAt(this.smoothLook);const r=O.clamp(-e.driftAmount*.75,-.3,.3);this.camera.rotateZ(r),this.fov+=(78-this.fov)*Math.min(1,t*5),this.camera.fov=this.fov,this.camera.updateProjectionMatrix()}update(t,e,s,i){if(this.mode==="cockpit"&&i<=0){this.updateCockpit(t,e);return}const o=O.clamp(e.speed/e.spec.stats.maxSpeed,0,1.2),a=e.forward,n=e.right,r=7.6+o*2.6+(this.mobile,0)+this.heightBias*.25,l=3.6+o*.35+(this.mobile?.1:0)+this.heightBias,c=O.clamp(e.driftAmount,-1,1)*2.4;this.desired.copy(e.pos).addScaledVector(a,-r).addScaledVector(n,-c).addScaledVector(Rt,l);const u=s.heightAt(s.nearest(this.desired,e.hint));if(this.desired.y=Math.max(this.desired.y,u+2.6,e.pos.y+2.2),i>0){this.intro=Math.min(1,this.intro+t*.32);const w=1-Math.pow(1-this.intro,3),M=O.lerp(9.5,7.4,w),y=O.lerp(6.2,3.2,w)+this.heightBias;this.camera.position.copy(e.pos).addScaledVector(a,-M).addScaledVector(n,O.lerp(1.6,0,w)).addScaledVector(Rt,y),this.smoothLook.copy(e.pos).addScaledVector(a,3).addScaledVector(Rt,1.1+this.heightBias*.4),this.camera.lookAt(this.smoothLook),this.camera.fov=O.lerp(52,60,w),this.camera.updateProjectionMatrix();return}const f=1-Math.exp(-t*(5.5+o*3));this.camera.position.lerp(this.desired,f);const d=this.camera.position.clone().sub(e.pos),m=Math.hypot(d.x,d.z);if(m<4.6){const w=4.6/Math.max(.001,m);this.camera.position.x=e.pos.x+d.x*w,this.camera.position.z=e.pos.z+d.z*w}this.lookAt.copy(e.pos).addScaledVector(a,11+o*6).addScaledVector(Rt,1.5+this.heightBias*.4),this.smoothLook.lerp(this.lookAt,1-Math.exp(-t*7)),this.shake=Math.max(0,this.shake-t*2.2);const p=this.shake*this.shake;this.shakeOffset.set((Math.random()-.5)*p*.9,(Math.random()-.5)*p*.7,(Math.random()-.5)*p*.9),this.camera.position.add(this.shakeOffset),this.camera.lookAt(this.smoothLook);const b=(this.mobile?64:62)+o*9+(e.boostTime>0?7:0);this.fov+=(b-this.fov)*Math.min(1,t*3),this.camera.fov=this.fov,this.camera.updateProjectionMatrix()}}class Ve{points;items=[];max;posAttr;colorAttr;alphaAttr;sizeAttr;cursor=0;constructor(t,e,s){this.max=t;const i=new ie,o=new Float32Array(t*3),a=new Float32Array(t*3),n=new Float32Array(t),r=new Float32Array(t);i.setAttribute("position",new tt(o,3)),i.setAttribute("aColor",new tt(a,3)),i.setAttribute("aAlpha",new tt(n,1)),i.setAttribute("aSize",new tt(r,1)),this.posAttr=i.attributes.position,this.colorAttr=i.attributes.aColor,this.alphaAttr=i.attributes.aAlpha,this.sizeAttr=i.attributes.aSize,i.setDrawRange(0,0);const l=new j({uniforms:{uMap:{value:e}},transparent:!0,depthWrite:!1,blending:s?Je:Gs,vertexShader:`
        attribute vec3 aColor;
        attribute float aAlpha;
        attribute float aSize;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSize * (420.0 / max(0.001, -mv.z)), 1.0, 120.0);
          vColor = aColor;
          vAlpha = aAlpha;
        }
      `,fragmentShader:`
        uniform sampler2D uMap;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 t = texture2D(uMap, gl_PointCoord);
          float a = t.a * vAlpha;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a);
        }
      `});this.points=new Vs(i,l),this.points.frustumCulled=!1,this.points.renderOrder=3;for(let c=0;c<t;c++)this.items.push({pos:new x,vel:new x,life:0,max:1,size:1,color:new L(1,1,1),gravity:0,drag:.5})}spawn(t,e,s,i,o,a=0,n=.8){const r=this.items[this.cursor];this.cursor=(this.cursor+1)%this.max,r.pos.copy(t),r.vel.copy(e),r.life=s,r.max=s,r.size=i,r.color.copy(o),r.gravity=a,r.drag=n}update(t){let e=0;for(let s=0;s<this.max;s++){const i=this.items[s];if(i.life<=0||(i.life-=t,i.life<=0))continue;i.vel.y-=i.gravity*t,i.vel.multiplyScalar(1-i.drag*t),i.pos.addScaledVector(i.vel,t);const o=i.life/i.max;this.posAttr.setXYZ(e,i.pos.x,i.pos.y,i.pos.z),this.colorAttr.setXYZ(e,i.color.r,i.color.g,i.color.b),this.alphaAttr.setX(e,Math.min(1,o*1.6)),this.sizeAttr.setX(e,i.size*(1.6-o*.6)),e++}this.posAttr.needsUpdate=!0,this.colorAttr.needsUpdate=!0,this.alphaAttr.needsUpdate=!0,this.sizeAttr.needsUpdate=!0,this.points.geometry.setDrawRange(0,e)}}const Ei=new L(14862234),Pi=new L(14673642),Li=new L(16757575),ki=new L(14284543);class Ri{group=new q;smoke;glow;skids;skidFade;skidCount=220;skidCursor=0;skidClock=0;time=0;constructor(){this.smoke=new Ve(420,pi(),!1),this.glow=new Ve(360,mi(),!0),this.group.add(this.smoke.points,this.glow.points);const t=new st(.42,1.05);t.rotateX(-Math.PI/2);const e=new Float32Array(this.skidCount),s=new j({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,uniforms:{uOpacity:{value:.42}},vertexShader:`
        attribute float aFade;
        varying float vFade;
        void main() {
          vFade = aFade;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uOpacity;
        varying float vFade;
        void main() {
          if (vFade <= 0.01) discard;
          gl_FragColor = vec4(0.045, 0.04, 0.045, uOpacity * vFade);
        }
      `});t.setAttribute("aFade",new Ws(e,1)),this.skids=new rt(t,s,this.skidCount),this.skids.frustumCulled=!1,this.skids.renderOrder=2;const i=new J().makeScale(0,0,0);for(let o=0;o<this.skidCount;o++)this.skids.setMatrixAt(o,i);this.skidFade=e,this.group.add(this.skids)}dust(t,e,s=1){for(let i=0;i<s;i++){const o=e.clone().multiplyScalar(2+Math.random()*3).add(new x((Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3));this.smoke.spawn(t.clone().add(new x((Math.random()-.5)*1.6,.1,(Math.random()-.5)*1.6)),o,.6+Math.random()*.5,.45+Math.random()*.35,Ei,-.4,1.6)}}spray(t){for(let e=0;e<2;e++)this.smoke.spawn(t.clone(),new x((Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4),.4,.7,ki,9,1.2)}smokePuff(t,e=3){for(let s=0;s<e;s++)this.smoke.spawn(t.clone(),new x((Math.random()-.5)*2,1+Math.random(),(Math.random()-.5)*2),.8+Math.random()*.4,.5+Math.random()*.4,Pi,-.2,1.4)}sparks(t,e=Li,s=14){for(let i=0;i<s;i++)this.glow.spawn(t.clone(),new x((Math.random()-.5)*12,Math.random()*7,(Math.random()-.5)*12),.4+Math.random()*.5,.16+Math.random()*.14,e,12,.6)}explosion(t){this.sparks(t,new L(16765286),26),this.sparks(t,new L(16735022),18),this.smokePuff(t,12)}confetti(t){for(let e=0;e<60;e++){const s=new L().setHSL(Math.random(),.85,.6);this.glow.spawn(t.clone().add(new x((Math.random()-.5)*8,Math.random()*4,(Math.random()-.5)*8)),new x((Math.random()-.5)*10,6+Math.random()*8,(Math.random()-.5)*10),2+Math.random()*1.6,.4,s,4,.5)}}skid(t,e,s){if(this.skidClock+=s,this.skidClock<.035)return;this.skidClock=0;const i=new Tt().setFromEuler(new Nt(0,e,0)),o=new J().compose(t,i,new x(1,1,1));this.skids.setMatrixAt(this.skidCursor,o),this.skidFade[this.skidCursor]=1,this.skids.geometry.attributes.aFade.needsUpdate=!0,this.skids.instanceMatrix.needsUpdate=!0,this.skidCursor=(this.skidCursor+1)%this.skidCount}update(t){this.time+=t,this.smoke.update(t),this.glow.update(t);let e=!1;for(let s=0;s<this.skidCount;s++)this.skidFade[s]>0&&(this.skidFade[s]=Math.max(0,this.skidFade[s]-t*.045),e=!0);e&&(this.skids.geometry.attributes.aFade.needsUpdate=!0)}}const pe=["turbo","missile","shield","oil"];class Di{group=new q;boxes=[];missiles=[];oils=[];effects;iconCache=new Map;time=0;onPickup=()=>{};onLaunch=()=>{};onExplode=()=>{};constructor(t,e){this.effects=e,t.itemSpots.forEach((s,i)=>{const o=t.sample(s.index),a=o.pos.clone().addScaledVector(o.side,s.lateral).add(new x(0,1.6,0)),n=new q;n.position.copy(a);const r=new g(new Pe(1.15,1),new Ut({color:10483455,transparent:!0,opacity:.28,roughness:.05,metalness:.1,transmission:.6,emissive:3142367,emissiveIntensity:.6,depthWrite:!1})),l=pe[i%pe.length],c=new g(new st(1.25,1.25),new gt({map:this.iconTexture(l),transparent:!0,depthWrite:!1,toneMapped:!1}));n.add(r,c),this.group.add(n),this.boxes.push({group:n,icon:c,halo:r,pos:a,index:s.index,active:!0,respawn:0,phase:Math.random()*6.28})})}iconTexture(t){let e=this.iconCache.get(t);return e||(e=new es(ls(t)),e.colorSpace=Me,this.iconCache.set(t,e)),e}assignKind(t){const e=5-Math.min(5,Math.max(0,t.rank-1)),s={turbo:1.2+e*.5,missile:1.4+e*.2,shield:1,oil:.7+Math.max(0,2-e)*.4},i=pe.reduce((a,n)=>a+s[n],0);let o=Math.random()*i;for(const a of pe)if(o-=s[a],o<=0)return a;return"turbo"}give(t){t.item||(t.item=this.assignKind(t),this.onPickup(t))}use(t,e){const s=t.item;s&&(t.item=null,s==="turbo"?(t.useBoost(2),this.effects.sparks(t.pos.clone().add(new x(0,.6,0)),new L(4909311),10)):s==="shield"?t.activateShield():s==="oil"?this.dropOil(t):this.fireMissile(t,e))}dropOil(t){const e=t.pos.clone().addScaledVector(t.forward,-3);e.y=t.pos.y-.38;const s=new g(new Hs(1.5,20),new Ut({color:1185305,roughness:.08,metalness:.55,clearcoat:1,transparent:!0,opacity:.92}));s.rotation.x=-Math.PI/2,s.position.copy(e),this.group.add(s),this.oils.push({mesh:s,pos:e,life:26})}fireMissile(t,e){const s=e.filter(r=>r!==t&&r.rank<t.rank).sort((r,l)=>l.rank-r.rank)[0]??null,i=new q,o=new g(new se(.18,.7,6,10),new E({color:16731501,emissive:16720452,emissiveIntensity:2.2,roughness:.3,metalness:.4}));o.rotation.x=Math.PI/2;const a=new g(new vt(.42,12,10),new gt({color:16747069,transparent:!0,opacity:.42,toneMapped:!1}));i.add(o,a);const n=t.pos.clone().addScaledVector(t.forward,2.6);n.y+=.9,i.position.copy(n),this.group.add(i),this.missiles.push({mesh:i,pos:n,dir:t.forward.clone(),target:s,life:7,trail:0}),this.onLaunch()}update(t,e,s){this.time+=t;const i=e.find(o=>o.isPlayer)??e[0];for(const o of this.boxes){if(!o.active){o.respawn-=t,o.respawn<=0&&(o.active=!0,o.group.visible=!0,o.group.scale.setScalar(.01));continue}o.phase+=t;const a=Math.min(1,o.group.scale.x+t*4),n=o.group.position.distanceTo(s.position),r=O.smoothstep(n,2.5,7);o.group.scale.setScalar(a*(.35+r*.65)),o.group.visible=n>2.2,o.halo.rotation.y+=t*.9,o.halo.rotation.z+=t*.4,o.group.position.y=o.pos.y+Math.sin(o.phase*1.6)*.22,o.icon.lookAt(s.position);for(const l of e)if(!l.finished&&l.pos.distanceTo(o.pos)<3.1){o.active=!1,o.group.visible=!1,o.respawn=5,this.give(l),this.effects.sparks(o.pos,new L(9436415),16);break}}for(let o=this.missiles.length-1;o>=0;o--){const a=this.missiles[o];if(a.life-=t,a.target){const r=a.target.pos.clone().add(new x(0,1,0)).sub(a.pos).normalize();a.dir.lerp(r,Math.min(1,t*3.4)).normalize()}a.pos.addScaledVector(a.dir,t*62),a.mesh.position.copy(a.pos),a.mesh.quaternion.setFromUnitVectors(new x(0,0,1),a.dir),a.trail+=t,a.trail>.02&&(a.trail=0,this.effects.sparks(a.pos,new L(16757575),1));let n=!1;for(const r of e)if(r.pos.distanceTo(a.pos)<2.3){r.hit(),this.effects.explosion(a.pos),this.onExplode(),n=!0;break}a.pos.distanceTo(i.pos)>260&&(n=!0),(n||a.life<=0)&&(n||this.effects.sparks(a.pos,new L(16757575),6),this.group.remove(a.mesh),this.missiles.splice(o,1))}for(let o=this.oils.length-1;o>=0;o--){const a=this.oils[o];a.life-=t,a.life<3&&a.mesh.scale.setScalar(Math.max(.01,a.life/3));for(const n of e)if(n.pos.distanceTo(a.pos)<2.2&&n.spinTime<=0){n.hit(),this.onExplode(),a.life=0;break}a.life<=0&&(this.group.remove(a.mesh),a.mesh.geometry.dispose(),this.oils.splice(o,1))}}}class Ii{ctx=null;master;musicGain;sfxGain;engineGain;engineFilter;engineOsc;engineOsc2;subOsc;windGain;driftGain;driftFilter;noiseBuffer=null;musicTimer=null;nextNote=0;step=0;enabled=!0;musicOn=!0;get ready(){return this.ctx!==null}async unlock(){this.ctx||this.build(),this.ctx&&this.ctx.state==="suspended"&&await this.ctx.resume()}build(){const t=window.AudioContext??window.webkitAudioContext,e=new t;this.ctx=e,this.master=e.createGain(),this.master.gain.value=.75,this.master.connect(e.destination),this.musicGain=e.createGain(),this.musicGain.gain.value=0,this.musicGain.connect(this.master),this.sfxGain=e.createGain(),this.sfxGain.gain.value=.9,this.sfxGain.connect(this.master),this.noiseBuffer=this.makeNoise(e,2),this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=900,this.engineFilter.Q.value=3,this.engineFilter.connect(this.engineGain),this.engineGain.connect(this.sfxGain),this.engineOsc=e.createOscillator(),this.engineOsc.type="sawtooth",this.engineOsc.frequency.value=70,this.engineOsc.connect(this.engineFilter),this.engineOsc.start(),this.engineOsc2=e.createOscillator(),this.engineOsc2.type="square",this.engineOsc2.frequency.value=35;const s=e.createGain();s.gain.value=.35,this.engineOsc2.connect(s),s.connect(this.engineFilter),this.engineOsc2.start(),this.subOsc=e.createOscillator(),this.subOsc.type="sine",this.subOsc.frequency.value=40;const i=e.createGain();i.gain.value=.25,this.subOsc.connect(i),i.connect(this.engineGain),this.subOsc.start();const o=e.createBufferSource();o.buffer=this.noiseBuffer,o.loop=!0;const a=e.createBiquadFilter();a.type="bandpass",a.frequency.value=700,a.Q.value=.7,this.windGain=e.createGain(),this.windGain.gain.value=0,o.connect(a),a.connect(this.windGain),this.windGain.connect(this.sfxGain),o.start();const n=e.createBufferSource();n.buffer=this.noiseBuffer,n.loop=!0,this.driftFilter=e.createBiquadFilter(),this.driftFilter.type="bandpass",this.driftFilter.frequency.value=2600,this.driftFilter.Q.value=4,this.driftGain=e.createGain(),this.driftGain.gain.value=0,n.connect(this.driftFilter),this.driftFilter.connect(this.driftGain),this.driftGain.connect(this.sfxGain),n.start()}makeNoise(t,e){const s=t.createBuffer(1,t.sampleRate*e,t.sampleRate),i=s.getChannelData(0);for(let o=0;o<i.length;o++)i[o]=Math.random()*2-1;return s}setEnabled(t){this.enabled=t,this.ctx&&(this.master.gain.value=t?.75:0)}setMusic(t){this.musicOn=t,this.ctx&&(this.musicGain.gain.setTargetAtTime(t?.3:0,this.ctx.currentTime,.3),t?this.startMusic():this.stopMusic())}engine(t,e,s,i,o){if(!this.ctx)return;const a=this.ctx.currentTime,n=Math.min(1.3,t/e),r=.25+n,l=58+r*120+(i?30:0);this.engineOsc.frequency.setTargetAtTime(l,a,.06),this.engineOsc2.frequency.setTargetAtTime(l*.5,a,.08),this.subOsc.frequency.setTargetAtTime(l*.5,a,.1),this.engineFilter.frequency.setTargetAtTime(560+r*1500+(i?900:0),a,.08);const c=this.enabled?(.045+s*.055+n*.055)*(o?1.15:1):0;this.engineGain.gain.setTargetAtTime(c,a,.1),this.windGain.gain.setTargetAtTime(this.enabled?n*n*.16:0,a,.2)}drift(t,e){if(!this.ctx)return;const s=this.ctx.currentTime;this.driftGain.gain.setTargetAtTime(t&&this.enabled?.1+e*.16:0,s,.05),this.driftFilter.frequency.setTargetAtTime(1800+e*2200,s,.08)}silenceEngine(){this.ctx&&(this.engineGain.gain.setTargetAtTime(0,this.ctx.currentTime,.1),this.windGain.gain.setTargetAtTime(0,this.ctx.currentTime,.1),this.driftGain.gain.setTargetAtTime(0,this.ctx.currentTime,.1))}tone(t,e,s,i,o=0,a=0){if(!this.ctx||!this.enabled)return;const n=this.ctx.currentTime+a,r=this.ctx.createOscillator(),l=this.ctx.createGain();r.type=s,r.frequency.setValueAtTime(t,n),o&&r.frequency.exponentialRampToValueAtTime(Math.max(20,t+o),n+e),l.gain.setValueAtTime(1e-4,n),l.gain.exponentialRampToValueAtTime(i,n+.012),l.gain.exponentialRampToValueAtTime(1e-4,n+e),r.connect(l),l.connect(this.sfxGain),r.start(n),r.stop(n+e+.05)}noise(t,e,s,i="lowpass",o=0){if(!this.ctx||!this.enabled||!this.noiseBuffer)return;const a=this.ctx.currentTime+o,n=this.ctx.createBufferSource();n.buffer=this.noiseBuffer;const r=this.ctx.createBiquadFilter();r.type=i,r.frequency.setValueAtTime(s,a),r.frequency.exponentialRampToValueAtTime(Math.max(60,s*.25),a+t);const l=this.ctx.createGain();l.gain.setValueAtTime(e,a),l.gain.exponentialRampToValueAtTime(1e-4,a+t),n.connect(r),r.connect(l),l.connect(this.sfxGain),n.start(a),n.stop(a+t+.05)}click(){this.tone(520,.07,"square",.05,120)}pickup(){this.tone(660,.1,"triangle",.1),this.tone(880,.12,"triangle",.08,0,.06),this.tone(1320,.16,"sine",.05,0,.12)}itemUse(){this.tone(180,.35,"sawtooth",.1,300),this.noise(.4,.14,1800,"bandpass")}explosion(){this.noise(.55,.35,900),this.tone(70,.5,"sine",.2,-40)}hit(){this.tone(140,.18,"square",.12,-80),this.noise(.22,.18,1400)}boost(){this.noise(.6,.2,2600,"bandpass"),this.tone(220,.5,"sawtooth",.07,420)}lap(){this.tone(880,.12,"triangle",.07),this.tone(1174,.18,"triangle",.06,0,.1)}countdown(t){this.tone(t?1046:523,t?.5:.16,"square",.09)}finish(){[523,659,784,1046,1318].forEach((e,s)=>this.tone(e,.32,"triangle",.08,0,s*.12))}startMusic(){!this.ctx||this.musicTimer!==null||!this.musicOn||(this.nextNote=this.ctx.currentTime+.1,this.step=0,this.musicGain.gain.setTargetAtTime(.26,this.ctx.currentTime,.4),this.musicTimer=window.setInterval(()=>this.schedule(),25))}stopMusic(){this.musicTimer!==null&&(clearInterval(this.musicTimer),this.musicTimer=null),this.ctx&&this.musicGain.gain.setTargetAtTime(0,this.ctx.currentTime,.4)}schedule(){if(!this.ctx||!this.musicOn)return;const e=60/112/4;for(;this.nextNote<this.ctx.currentTime+.2;)this.playStep(this.step,this.nextNote,e),this.step=(this.step+1)%64,this.nextNote+=e}playStep(t,e,s){if(!this.ctx)return;const i=Math.floor(t/16),a=[55,43.65,65.41,49][i],n=t%16,r=this.ctx,l=(c,u,f,d,m=1400)=>{const p=r.createOscillator(),b=r.createGain(),w=r.createBiquadFilter();w.type="lowpass",w.frequency.value=m,p.type=f,p.frequency.value=c,b.gain.setValueAtTime(1e-4,e),b.gain.exponentialRampToValueAtTime(d,e+.012),b.gain.exponentialRampToValueAtTime(1e-4,e+u),p.connect(w),w.connect(b),b.connect(this.musicGain),p.start(e),p.stop(e+u+.05)};n%2===0&&l(a,s*1.7,"triangle",.22,500),(n===0||n===6||n===10)&&l(a*2,s*1.2,"sawtooth",.05,900),(n===4||n===12)&&(i===0?[220,261.63,329.63]:i===1?[174.61,220,261.63]:i===2?[261.63,329.63,392]:[196,246.94,293.66]).forEach(u=>l(u,s*6,"sine",.035,1200)),n%4===2&&this.hat(e,.05),t%8===0&&l(a/2,s*1.4,"sine",.18,220)}hat(t,e){if(!this.ctx||!this.noiseBuffer)return;const s=this.ctx.createBufferSource();s.buffer=this.noiseBuffer;const i=this.ctx.createBiquadFilter();i.type="highpass",i.frequency.value=7e3;const o=this.ctx.createGain();o.gain.setValueAtTime(e,t),o.gain.exponentialRampToValueAtTime(1e-4,t+.06),s.connect(i),i.connect(o),o.connect(this.musicGain),s.start(t),s.stop(t+.08)}}class zi{keys=new Set;touch={left:!1,right:!1,brake:!1,drift:!1};wheelSteer=0;onCameraDrag=null;itemQueued=!1;pauseQueued=!1;respawnQueued=!1;cameraQueued=!1;onKeyDown;onKeyUp;isTouch=matchMedia("(pointer: coarse)").matches;constructor(){this.onKeyDown=t=>{const e=t.key.toLowerCase();(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e)||["w","a","s","d"].includes(e))&&t.preventDefault(),this.keys.add(e),(e===" "||e==="e"||e==="shift"||e==="enter")&&(this.itemQueued=!0),(e==="escape"||e==="p")&&(this.pauseQueued=!0),e==="r"&&(this.respawnQueued=!0),e==="c"&&(this.cameraQueued=!0)},this.onKeyUp=t=>this.keys.delete(t.key.toLowerCase()),window.addEventListener("keydown",this.onKeyDown,{passive:!1}),window.addEventListener("keyup",this.onKeyUp)}attachTouch(t){const e=t.querySelectorAll("[data-touch]"),s=(i,o)=>{const a=i.dataset.touch;if(a==="item"){o&&(this.itemQueued=!0),i.classList.toggle("pressed",o);return}this.touch[a]=o,i.classList.toggle("pressed",o)};this.attachWheel(t),e.forEach(i=>{const o=n=>{n.preventDefault();try{i.setPointerCapture(n.pointerId)}catch{}s(i,!0)},a=n=>{n.preventDefault(),s(i,!1)};i.addEventListener("pointerdown",o),i.addEventListener("pointerup",a),i.addEventListener("pointercancel",a),i.addEventListener("lostpointercapture",a),i.addEventListener("contextmenu",n=>n.preventDefault())})}attachWheel(t){const e=t.querySelector("#touch-wheel"),s=t.querySelector("#touch-wheel-rotor");if(!e||!s)return;const i=105;let o=null,a=0,n=0,r=0;const l=u=>{r=u,s.style.transform=`rotate(${u}deg)`;const f=-u/i,d=Math.sign(f)*Math.pow(Math.abs(f),1.35);this.wheelSteer=Math.abs(d)<.12?0:d};e.addEventListener("pointerdown",u=>{u.preventDefault(),o=u.pointerId;try{e.setPointerCapture(u.pointerId)}catch{}a=u.clientX,n=r,e.classList.add("active")});const c=u=>{if(o===null||u.pointerId!==o)return;o=null,e.classList.remove("active");const f=r,d=performance.now(),m=()=>{const p=Math.min(1,(performance.now()-d)/340),b=1-Math.pow(1-p,3);l(f*(1-b)),p<1&&requestAnimationFrame(m)};requestAnimationFrame(m)};window.addEventListener("pointermove",u=>{if(o===null||u.pointerId!==o)return;u.preventDefault();const f=Math.max(-i,Math.min(i,n+(u.clientX-a)*.8));l(f)}),window.addEventListener("pointerup",c),window.addEventListener("pointercancel",c)}attachCamera(t){let e=null,s=0;t.addEventListener("pointerdown",o=>{o.pointerType==="mouse"&&o.button!==0||(e=o.pointerId,s=o.clientY)}),window.addEventListener("pointermove",o=>{if(e===null||o.pointerId!==e)return;const a=o.clientY-s;s=o.clientY,Math.abs(a)>.4&&this.onCameraDrag?.(a)});const i=o=>{e===o.pointerId&&(e=null)};window.addEventListener("pointerup",i),window.addEventListener("pointercancel",i)}read(){const t=this.keys.has("arrowleft")||this.keys.has("a")||this.touch.left,e=this.keys.has("arrowright")||this.keys.has("d")||this.touch.right,s=(t?1:0)-(e?1:0);return{steer:Math.max(-1,Math.min(1,s+this.wheelSteer)),brake:this.keys.has("arrowdown")||this.keys.has("s")||this.touch.brake,drift:this.keys.has(" ")||this.keys.has("shift")||this.touch.drift,item:!1}}consumeItem(){const t=this.itemQueued;return this.itemQueued=!1,t}consumePause(){const t=this.pauseQueued;return this.pauseQueued=!1,t}consumeCamera(){const t=this.cameraQueued;return this.cameraQueued=!1,t}consumeRespawn(){const t=this.respawnQueued;return this.respawnQueued=!1,t}}const He=h=>{if(!isFinite(h))return"--:--.---";const t=Math.floor(h/60),e=Math.floor(h%60),s=Math.floor(h%1*1e3);return`${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}.${s.toString().padStart(3,"0")}`};class Bi{root=document.getElementById("hud");posNumber=document.getElementById("pos-number");posSuffix=document.getElementById("pos-suffix");lapCurrent=document.getElementById("lap-current");timer=document.getElementById("race-timer");lapTime=document.getElementById("lap-time");speedo=document.getElementById("speedo");speedCompact=document.getElementById("speed-compact-value");speedoCtx=this.speedo.getContext("2d");minimap=document.getElementById("minimap");minimapCtx=this.minimap.getContext("2d");itemSlot=document.getElementById("item-slot");itemHint=document.getElementById("item-hint");itemCanvas=document.getElementById("item-icon");drift=document.getElementById("drift-meter");driftBars=Array.from(this.drift.querySelectorAll("i"));boostFill=document.getElementById("boost-fill");countdownEl=document.getElementById("countdown");countdownText=document.getElementById("countdown-text");messageEl=document.getElementById("race-message");wrongWayEl=document.getElementById("wrong-way");lapFlash=document.getElementById("lap-flash");touch=document.getElementById("touch-controls");messageTimer=0;lastItem=null;minimapClock=0;constructor(t,e){this.track=t,this.bounds=this.computeBounds(t),e&&this.touch.classList.remove("hidden")}track;bounds;computeBounds(t){let e=1/0,s=-1/0,i=1/0,o=-1/0;for(const n of t.nodes)e=Math.min(e,n.pos.x),s=Math.max(s,n.pos.x),i=Math.min(i,n.pos.z),o=Math.max(o,n.pos.z);const a=24;return{minX:e-a,minZ:i-a,w:s-e+a*2,h:o-i+a*2}}setTrack(t){this.track=t,this.bounds=this.computeBounds(t)}show(t){this.root.classList.toggle("hidden",!t)}setItem(t){if(t===this.lastItem)return;this.lastItem=t,this.itemSlot.classList.toggle("empty",!t),this.itemSlot.classList.toggle("ready",!!t),this.itemHint.textContent=t?"USAR":"OBJETO";const e=this.itemCanvas.getContext("2d");e.clearRect(0,0,128,128),t&&e.drawImage(ls(t),0,0,128,128)}countdown(t){if(t===null){this.countdownEl.classList.add("hidden");return}this.countdownEl.classList.remove("hidden"),this.countdownText.textContent=t,this.countdownText.style.animation="none",this.countdownText.offsetWidth,this.countdownText.style.animation=""}message(t,e=1.6){this.messageEl.textContent=t,this.messageEl.classList.remove("hidden"),this.messageEl.style.animation="none",this.messageEl.offsetWidth,this.messageEl.style.animation="",this.messageTimer=e}flashLap(){this.lapFlash.classList.remove("hidden"),this.lapFlash.style.animation="none",this.lapFlash.offsetWidth,this.lapFlash.style.animation="",window.setTimeout(()=>this.lapFlash.classList.add("hidden"),800)}wrongWay(t){this.wrongWayEl.classList.toggle("hidden",!t)}update(t,e,s,i,o,a){this.messageTimer>0&&(this.messageTimer-=t,this.messageTimer<=0&&this.messageEl.classList.add("hidden"));const n=e.rank===1?"st":e.rank===2?"nd":e.rank===3?"rd":"th";this.posNumber.textContent=String(e.rank),this.posSuffix.textContent=n,this.lapCurrent.textContent=String(Math.min(o,a)),this.timer.textContent=He(i),this.lapTime.textContent=`VUELTA ${He(i-e.lapStart)}`,this.setItem(e.item);const r=Math.min(1,e.driftCharge/2.4);this.drift.classList.toggle("active",e.driftCharge>.1),this.driftBars.forEach((l,c)=>{l.classList.toggle("on",r>c/3),l.classList.toggle("hot",e.driftTier>=3&&c===2)}),this.boostFill.style.width=`${Math.min(100,e.boostTime/1.6*100+8)}%`,this.boostFill.style.background=e.boostTime>0?"linear-gradient(90deg,#ffb347,#ff5b2e)":"linear-gradient(90deg,#35e0ff,#2ff2df)",this.drawSpeedo(e),this.minimapClock+=t,this.minimapClock>.05&&(this.minimapClock=0,this.drawMinimap(e,s))}drawSpeedo(t){const e=this.speedoCtx,s=this.speedo.width,i=s/2,o=s/2+10,a=96,n=Math.min(170,Math.max(0,t.speed*3.6));this.speedCompact&&(this.speedCompact.textContent=String(Math.round(n))),e.clearRect(0,0,s,s);const r=Math.PI*.78,l=Math.PI*2.22;e.lineCap="round",e.lineWidth=12,e.strokeStyle="rgba(6, 30, 44, 0.62)",e.beginPath(),e.arc(i,o,a,r,l),e.stroke();const c=r+(l-r)*(n/170),u=e.createLinearGradient(i-a,o,i+a,o);u.addColorStop(0,"#2ff2df"),u.addColorStop(.65,"#7dfcff"),u.addColorStop(1,t.boostTime>0?"#ff8a3d":"#ffd166"),e.strokeStyle=u,e.shadowColor="rgba(47,242,223,0.65)",e.shadowBlur=18,e.beginPath(),e.arc(i,o,a,r,c),e.stroke(),e.shadowBlur=0,e.lineWidth=2;for(let f=0;f<=17;f++){const d=r+(l-r)*(f/17),m=f%2===0?a-24:a-14;e.strokeStyle=f/17<=n/170?"rgba(200,250,255,0.9)":"rgba(160,210,230,0.28)",e.beginPath(),e.moveTo(i+Math.cos(d)*m,o+Math.sin(d)*m),e.lineTo(i+Math.cos(d)*(a-4),o+Math.sin(d)*(a-4)),e.stroke()}e.fillStyle="#ffffff",e.font="700 66px Rajdhani, sans-serif",e.textAlign="center",e.textBaseline="middle",e.shadowColor="rgba(47,242,223,0.55)",e.shadowBlur=22,e.fillText(String(Math.round(n)),i,o-6),e.shadowBlur=0,e.font="600 15px Rajdhani, sans-serif",e.fillStyle="rgba(180,226,240,0.7)",e.fillText("KM/H",i,o+40),t.boostTime>0&&(e.strokeStyle="rgba(255,179,71,0.85)",e.lineWidth=4,e.beginPath(),e.arc(i,o,a+14,r,l),e.stroke())}drawMinimap(t,e){const s=this.minimapCtx,{width:i,height:o}=this.minimap,a=this.bounds;s.clearRect(0,0,i,o);const n=14,r=Math.min((i-n*2)/a.w,(o-n*2)/a.h),l=(i-a.w*r)/2,c=(o-a.h*r)/2,u=m=>l+(m-a.minX)*r,f=m=>c+(m-a.minZ)*r;s.lineJoin="round",s.lineCap="round",s.strokeStyle="rgba(4, 20, 32, 0.75)",s.lineWidth=16,s.beginPath(),this.track.nodes.forEach((m,p)=>{p===0?s.moveTo(u(m.pos.x),f(m.pos.z)):s.lineTo(u(m.pos.x),f(m.pos.z))}),s.closePath(),s.stroke(),s.strokeStyle="rgba(120, 235, 255, 0.55)",s.lineWidth=3,s.stroke();const d=this.track.nodes[0].pos;s.fillStyle="#ffffff",s.fillRect(u(d.x)-4,f(d.z)-4,8,8);for(const m of e){const p=m===t;s.beginPath(),s.arc(u(m.pos.x),f(m.pos.z),p?6:4,0,Math.PI*2),s.fillStyle=p?"#ffd166":`#${m.spec.body.toString(16).padStart(6,"0")}`,s.fill(),p&&(s.strokeStyle="#ffffff",s.lineWidth=2,s.stroke())}}}const te=[{id:"cobalt",accent:3142367,name:"COSTA DE COBALTO",tagline:"CURVAS ABIERTAS · MAR EN CALMA",radius:175,a:24,b:18,c:8,width:15.5,bankScale:26,elevA:.7,elevB:.35,h1:3,h2:2,h3:5,theme:{skyTop:2061501,skyHorizon:14676479,sunColor:16773586,fog:14478581,sandDry:16769976,sandHigh:15913114,sandWet:12163698,waterDeep:276047,waterShallow:1352616,waterSky:10934766,sunLight:16771276,ambient:16773600}},{id:"laguna",accent:16747084,name:"LAGUNA REVUELTA",tagline:"TRAMOS RATONEROS · ATARDECER",radius:170,a:22,b:17,c:7,width:14,bankScale:30,elevA:.9,elevB:.45,h1:4,h2:3,h3:7,theme:{skyTop:3287651,skyHorizon:16752483,sunColor:16766106,fog:15905932,sandDry:16172690,sandHigh:14985336,sandWet:10779740,waterDeep:2366020,waterShallow:14248773,waterSky:16757370,sunLight:16763296,ambient:16766908}},{id:"dune",accent:16762967,name:"DUNAS VELOCES",tagline:"RECTAS LARGAS · MEDIODÍA",radius:200,a:16,b:28,c:6,width:16.5,bankScale:18,elevA:1.2,elevB:.5,h1:2,h2:3,h3:4,theme:{skyTop:1798072,skyHorizon:15399167,sunColor:16777215,fog:15267071,sandDry:16773327,sandHigh:16244649,sandWet:13217930,waterDeep:675694,waterShallow:3133640,waterSky:12577535,sunLight:16774364,ambient:16775402}},{id:"jungle",accent:8122474,name:"SELVA SALVAJE",tagline:"TRAMOS CERRADOS · SELVA",radius:152,a:30,b:14,c:10,width:14,bankScale:30,elevA:1.1,elevB:.55,h1:5,h2:4,h3:9,theme:{skyTop:1140303,skyHorizon:14874831,sunColor:16774856,fog:13625796,sandDry:10466142,sandHigh:8361032,sandWet:5333039,waterDeep:736047,waterShallow:3120762,waterSky:10477768,sunLight:16773312,ambient:14217416,flora:"tropical"}},{id:"volcano",accent:16730666,name:"BORDE DEL VOLCÁN",tagline:"PERALTES FUERTES · CENIZA",radius:188,a:21,b:23,c:12,width:15,bankScale:22,elevA:1.4,elevB:.6,h1:6,h2:5,h3:8,theme:{skyTop:2756372,skyHorizon:16734762,sunColor:16756848,fog:8006174,sandDry:3812392,sandHigh:3023906,sandWet:1840403,waterDeep:2755078,waterShallow:16738858,waterSky:16751194,sunLight:16756848,ambient:16747098,flora:"barren"}},{id:"arctic",accent:9427199,name:"BUCLE ÁRTICO",tagline:"RÁPIDO Y ABIERTO · HIELO",radius:212,a:18,b:20,c:4,width:17,bankScale:16,elevA:.5,elevB:.3,h1:2,h2:2,h3:3,theme:{skyTop:10471400,skyHorizon:16777215,sunColor:16777215,fog:15398655,sandDry:16055295,sandHigh:14872826,sandWet:13163752,waterDeep:1920878,waterShallow:6273240,waterSky:14217983,sunLight:16777215,ambient:15267071,flora:"barren"}},{id:"harbor",accent:10467528,name:"CIRCUITO DEL PUERTO",tagline:"ASFALTO Y DIQUES · TARDE",radius:162,a:26,b:13,c:6,width:15.5,bankScale:28,elevA:.8,elevB:.4,h1:3,h2:2,h3:6,theme:{skyTop:3824242,skyHorizon:14214894,sunColor:16773328,fog:13162720,sandDry:10134696,sandHigh:9082008,sandWet:6976632,waterDeep:1194570,waterShallow:2783882,waterSky:9091272,sunLight:16773328,ambient:14213352,flora:"sparse"}},{id:"canyon",accent:14178858,name:"CAÑÓN VELOZ",tagline:"CURVAS CIEGAS · ROCA ROJA",radius:178,a:14,b:30,c:10,width:16,bankScale:20,elevA:1.3,elevB:.6,h1:4,h2:5,h3:7,theme:{skyTop:3828392,skyHorizon:16769200,sunColor:16769200,fog:15779984,sandDry:14191178,sandHigh:12611640,sandWet:9062948,waterDeep:1722970,waterShallow:3842208,waterSky:10541264,sunLight:16769200,ambient:16767152,flora:"barren"}},{id:"neon",accent:16730840,name:"BAHÍA NEÓN",tagline:"NOCHE · CURVAS RÁPIDAS",radius:168,a:28,b:16,c:14,width:15,bankScale:26,elevA:1,elevB:.5,h1:4,h2:3,h3:7,theme:{skyTop:330266,skyHorizon:1718890,sunColor:10143999,fog:660520,sandDry:1714746,sandHigh:2242634,sandWet:924198,waterDeep:135192,waterShallow:678522,waterSky:2792128,sunLight:10143999,ambient:4876954,flora:"sparse"}}];function Oi(h,t=120){const e=[];for(let s=0;s<t;s++){const i=s/t*Math.PI*2,o=h.radius+h.a*Math.sin(h.h1*i)+h.b*Math.cos(h.h2*i)+h.c*Math.sin(h.h3*i+.6);e.push({x:Math.cos(i)*o,z:Math.sin(i)*o})}return e}const je={high:"ALTA",medium:"MEDIA",low:"BAJA"},ge=h=>{if(!isFinite(h))return"--:--.---";const t=Math.floor(h/60),e=Math.floor(h%60),s=Math.floor(h%1*1e3);return`${t}:${e.toString().padStart(2,"0")}.${s.toString().padStart(3,"0")}`};function Ni(h,t,e){const s=o=>`<circle cx="${o}" cy="52" r="13" fill="#0d1216"/><circle cx="${o}" cy="52" r="6" fill="${e}"/>`,i=`
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${e}"/>
    </linearGradient></defs>`;return h==="formula"?`<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${i}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <rect x="12" y="49" width="34" height="5" rx="2" fill="${e}"/>
        <path d="M30 51 L40 43 L74 41 L96 33 L136 33 L156 41 L182 46 L182 52 L28 52 Z" fill="url(#g)"/>
        <path d="M96 33 L120 27 L138 27 L142 34 Z" fill="rgba(10,18,24,0.85)"/>
        <path d="M118 29 L136 29 L140 34 L116 34 Z" fill="rgba(120,235,255,0.35)"/>
        <rect x="158" y="24" width="30" height="5" rx="2" fill="${t}"/>
        <rect x="170" y="29" width="4" height="12" fill="${e}"/>
        <rect x="162" y="29" width="4" height="12" fill="${e}"/>
      </g>${s(58)}${s(156)}</svg>`:h==="muscle"?`<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${i}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <path d="M22 52 L26 41 L58 37 L84 30 L130 30 L150 34 L174 39 L178 52 Z" fill="url(#g)"/>
        <path d="M86 32 L128 32 L142 40 L82 40 Z" fill="rgba(8,16,22,0.9)"/>
        <path d="M92 34 L124 34 L133 39 L90 39 Z" fill="rgba(120,235,255,0.3)"/>
        <rect x="62" y="34" width="18" height="6" rx="2" fill="#d7e2ea"/>
        <rect x="100" y="24" width="26" height="4" rx="2" fill="${e}"/>
        <rect x="166" y="36" width="12" height="4" rx="2" fill="${e}"/>
      </g>${s(56)}${s(154)}</svg>`:h==="rally"?`<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${i}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <path d="M26 52 L30 38 L54 30 L104 26 L142 29 L166 38 L176 48 L176 52 Z" fill="url(#g)"/>
        <path d="M58 31 L104 27 L138 30 L142 38 L60 38 Z" fill="rgba(8,16,22,0.9)"/>
        <path d="M64 33 L102 30 L130 33 L133 37 L66 37 Z" fill="rgba(120,235,255,0.3)"/>
        <rect x="98" y="23" width="18" height="4" rx="2" fill="${e}"/>
        <rect x="150" y="26" width="24" height="5" rx="2" fill="${t}"/>
        <path d="M68 38 a18 18 0 0 1 36 0" fill="${t}" stroke="rgba(0,0,0,0.3)"/>
        <path d="M126 38 a18 18 0 0 1 36 0" fill="${t}" stroke="rgba(0,0,0,0.3)"/>
      </g>${s(58)}${s(150)}</svg>`:`<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${i}
    <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
      <path d="M28 50 L40 34 L150 32 L172 46 L172 52 L26 52 Z" fill="url(#g)"/>
      <path d="M78 34 L92 18 L128 18 L140 33 Z" fill="rgba(10,18,24,0.85)"/>
      <path d="M96 20 L124 20 L133 32 L92 32 Z" fill="rgba(120,235,255,0.35)"/>
      <rect x="150" y="26" width="22" height="6" rx="2" fill="${e}"/>
      <path d="M74 34 L74 20 M146 32 L146 20 M74 20 L146 20" stroke="#1a232b" stroke-width="4" fill="none"/>
      <circle cx="110" cy="22" r="6" fill="${e}"/>
    </g>${s(56)}${s(152)}</svg>`}class Ui{selected=0;cb;rail=document.getElementById("car-rail");trackRail=document.getElementById("track-rail");cupBtn=document.getElementById("btn-cup");selectedTrack=0;stats=document.getElementById("car-stats");title=document.getElementById("title-screen");results=document.getElementById("results-screen");pause=document.getElementById("pause-screen");startBtn=document.getElementById("start-race");qualityBtn=document.getElementById("btn-quality");soundBtn=document.getElementById("btn-sound");installBtn=document.getElementById("btn-install");installFab=document.getElementById("install-fab");installToast=document.getElementById("install-toast");quality="high";soundOn=!0;installPrompt=null;constructor(t){this.cb=t,this.buildRail(),this.select(0),this.buildTracks(),this.selectTrack(0,!1),this.startBtn.addEventListener("click",()=>{this.cb.onStart(this.selected)}),this.cupBtn.addEventListener("click",()=>{this.cb.onCup()}),this.qualityBtn.addEventListener("click",()=>{const o=["high","medium","low"];this.quality=o[(o.indexOf(this.quality)+1)%o.length],this.qualityBtn.textContent=`CALIDAD: ${je[this.quality]}`,this.cb.onQuality(this.quality)}),this.soundBtn.addEventListener("click",()=>{this.soundOn=!this.soundOn,this.soundBtn.textContent=`SONIDO: ${this.soundOn?"SÍ":"NO"}`,this.cb.onSound(this.soundOn)}),document.getElementById("btn-resume").addEventListener("click",()=>this.cb.onResume()),document.getElementById("btn-restart").addEventListener("click",()=>this.cb.onRestart()),document.getElementById("btn-quit").addEventListener("click",()=>this.cb.onQuit()),document.getElementById("btn-again").addEventListener("click",()=>this.cb.onAgain()),document.getElementById("btn-menu").addEventListener("click",()=>this.cb.onMenu()),document.getElementById("btn-settings").addEventListener("click",()=>{document.getElementById("help-screen").classList.remove("hidden")}),document.getElementById("btn-help-close").addEventListener("click",()=>{document.getElementById("help-screen").classList.add("hidden")});const e=matchMedia("(display-mode: standalone)").matches||navigator.standalone===!0,s=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1;window.addEventListener("beforeinstallprompt",o=>{o.preventDefault();const a=o;this.installPrompt=()=>a.prompt(),this.showInstall()}),window.addEventListener("appinstalled",()=>{this.installFab.classList.add("hidden"),this.installBtn.classList.add("hidden"),this.showToast("App instalada. Ábrela desde el icono de tu pantalla de inicio.")});const i=()=>{const o=document.getElementById("install-steps"),a=document.getElementById("install-note");s?(o.innerHTML="<li>Toca el botón Compartir (⬆) de Safari.</li><li>Elige «Añadir a pantalla de inicio».</li><li>Confirma con «Añadir».</li>",a.textContent="En iPhone no existe el aviso automático: Apple obliga a hacerlo desde Compartir."):/Android/i.test(navigator.userAgent)?(o.innerHTML="<li>Abre el menú ⋮ de Chrome.</li><li>Toca «Instalar app» o «Añadir a pantalla de inicio».</li><li>Confirma con «Instalar».</li>",a.textContent="Si Chrome dice que ya está instalada y no ves el icono: escribe chrome://webapks en la barra, busca Cobalt Coast y pulsa Desinstalar. Después vuelve a intentarlo."):(o.innerHTML="<li>Pulsa el icono de instalar de la barra de direcciones.</li><li>O abre el menú ⋮ y elige «Instalar Cobalt Coast».</li>",a.textContent="Si el navegador dice que ya está instalada, desinstálala primero desde el menú de la app o desde la barra de direcciones."),document.getElementById("install-help").classList.remove("hidden")};document.getElementById("install-help-close").addEventListener("click",()=>{document.getElementById("install-help").classList.add("hidden")}),this.installFab.addEventListener("click",()=>{if(this.installPrompt){this.installPrompt();return}i()}),this.installBtn.addEventListener("click",()=>{this.installPrompt?this.installPrompt():i()}),!e&&(s||matchMedia("(pointer: coarse)").matches)&&(this.installFab.textContent=this.installPrompt?"INSTALAR APP":"CÓMO INSTALAR",this.installFab.classList.remove("hidden"))}showInstall(){this.installFab.textContent="INSTALAR APP",this.installFab.classList.remove("hidden"),this.installBtn.classList.remove("hidden")}showToast(t){this.installToast.textContent=t,this.installToast.classList.remove("hidden"),window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>this.installToast.classList.add("hidden"),7e3)}toastTimer=0;buildRail(){this.rail.innerHTML="",be.forEach((t,e)=>{const s=`#${t.body.toString(16).padStart(6,"0")}`,i=`#${t.accent.toString(16).padStart(6,"0")}`,o=document.createElement("button");o.className="car-card",o.innerHTML=`
        <div class="car-thumb" style="--c1:${s};--c2:${i}">${Ni(t.style,s,i)}</div>
        <div class="car-name">${t.name}</div>
        <div class="car-tag">${t.tag}</div>
      `,o.addEventListener("click",()=>this.select(e)),this.rail.appendChild(o)})}buildTracks(){this.trackRail.innerHTML="",te.forEach((t,e)=>{const s=document.createElement("button");s.className="track-card";const i=document.createElement("canvas");i.width=260,i.height=132,s.style.setProperty("--accent",`#${t.accent.toString(16).padStart(6,"0")}`);const o=document.createElement("div");o.className="track-name",o.textContent=t.name;const a=document.createElement("div");a.className="track-tag",a.textContent=t.tagline,s.append(i,o,a),s.addEventListener("click",()=>this.selectTrack(e)),this.trackRail.appendChild(s),this.drawTrack(i,t)})}drawTrack(t,e){const s=t.getContext("2d");if(!s)return;const i=`#${e.accent.toString(16).padStart(6,"0")}`,o=Oi(e);let a=1/0,n=-1/0,r=1/0,l=-1/0;for(const w of o)a=Math.min(a,w.x),n=Math.max(n,w.x),r=Math.min(r,w.z),l=Math.max(l,w.z);const c=12,u=Math.min((t.width-c*2)/(n-a),(t.height-c*2)/(l-r)),f=(t.width-(n-a)*u)/2,d=(t.height-(l-r)*u)/2,m=w=>f+(w-a)*u,p=w=>d+(w-r)*u;s.clearRect(0,0,t.width,t.height),s.lineJoin="round",s.lineCap="round",s.beginPath(),o.forEach((w,M)=>M===0?s.moveTo(m(w.x),p(w.z)):s.lineTo(m(w.x),p(w.z))),s.closePath(),s.strokeStyle="rgba(4, 18, 30, 0.95)",s.lineWidth=20,s.stroke(),s.save(),s.shadowColor=i,s.shadowBlur=12,s.strokeStyle=i,s.lineWidth=7,s.stroke(),s.restore(),s.strokeStyle="rgba(255, 255, 255, 0.85)",s.lineWidth=2,s.stroke();const b=o[0];s.fillStyle="#ffd166",s.beginPath(),s.arc(m(b.x),p(b.z),6,0,Math.PI*2),s.fill(),s.strokeStyle="rgba(4, 18, 30, 0.9)",s.lineWidth=2,s.stroke()}selectTrack(t,e=!0){this.selectedTrack=t,Array.from(this.trackRail.children).forEach((s,i)=>s.classList.toggle("selected",i===t)),e&&this.cb.onTrack(t)}get track(){return this.selectedTrack}get car(){return this.selected}select(t){this.selected=t,this.cb.onCar(t),Array.from(this.rail.children).forEach((i,o)=>i.classList.toggle("selected",o===t));const e=be[t].stats,s={speed:(e.maxSpeed-34)/8,accel:(e.accel-14)/9,grip:(e.turn-1.8)/.7};for(const i of Array.from(this.stats.querySelectorAll("[data-stat]"))){const o=i.dataset.stat;i.style.width=`${Math.round(Math.min(1,Math.max(.2,s[o]))*100)}%`}}showTitle(){this.title.classList.remove("hidden"),this.results.classList.add("hidden"),this.pause.classList.add("hidden")}showRace(){this.title.classList.add("hidden"),this.results.classList.add("hidden"),this.pause.classList.add("hidden")}showPause(t){this.pause.classList.toggle("hidden",!t)}showResults(t,e,s,i,o){const a=document.getElementById("results-title"),n=document.getElementById("results-time"),r=document.getElementById("standings"),l=t.find(d=>d.isPlayer);a.textContent=o?.final&&o.champion?"CAMPEÓN DE COPA":i?"¡VICTORIA!":`${l?.rank}º PUESTO`;const c=document.getElementById("results-cup"),f=document.getElementById("btn-again").querySelector(".btn-label");o?(c.classList.remove("hidden"),o.final?(c.textContent=`TOTAL COPA · ${o.total} PTS`,f.textContent="NUEVA COPA"):(c.textContent=`CARRERA ${o.race} DE ${o.races} · +${o.gain} PTS · SIGUIENTE: ${o.next??""}`,f.textContent="SIGUIENTE CARRERA")):(c.classList.add("hidden"),f.textContent="OTRA CARRERA"),n.textContent=`${ge(s)}  ·  MEJOR VUELTA ${ge(e)}`,o?r.innerHTML=o.table.map((d,m)=>`<div class="row ${d.isPlayer?"you":""}">
            <span class="rank">${m+1}</span>
            <span class="swatch" style="background:${d.color}"></span>
            <span class="name">${d.name}</span>
            <span class="pts">${d.points}</span>
            <span class="best">${d.gain>0?`+${d.gain}`:""}</span>
          </div>`).join(""):r.innerHTML=t.map(d=>`<div class="row ${d.isPlayer?"you":""}">
            <span class="rank">${d.rank}</span>
            <span class="swatch" style="background:${d.color}"></span>
            <span class="name">${d.name}</span>
            <span class="time">${ge(d.time)}</span>
            <span class="best">${isFinite(d.best)?ge(d.best):""}</span>
          </div>`).join(""),this.title.classList.add("hidden"),this.pause.classList.add("hidden"),this.results.classList.remove("hidden")}hideResults(){this.results.classList.add("hidden")}setTrackIndex(t){this.selectTrack(t,!1)}setQuality(t){this.quality=t,this.qualityBtn.textContent=`CALIDAD: ${je[t]}`}}const Fi=["SAND SHARK","RIPTIDE","CORAL KING","SHELL SHOCK","TIDAL WAVE"],Xe=[[16731501,16765286],[8146431,3142367],[49919,16777215],[16757575,2829099],[9268835,16769202]],Wi={uniforms:{tDiffuse:{value:null},uVignette:{value:.42},uSaturation:{value:1.02},uContrast:{value:1.05},uGrain:{value:.02},uAberration:{value:45e-5},uSpeed:{value:0},uBoost:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uGrain;
    uniform float uAberration;
    uniform float uSpeed;
    uniform float uBoost;
    varying vec2 vUv;

    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 uv = vUv;
      vec2 center = uv - 0.5;
      float r2 = dot(center, center);
      vec2 dir = normalize(center + 0.0001);
      float ca = uAberration * r2 * r2 + uBoost * 0.0025 * r2;
      float edge = smoothstep(0.04, 0.32, r2);
      vec2 smear = dir * (uSpeed * 0.005 + uBoost * 0.008) * edge;
      vec3 base = texture2D(tDiffuse, uv).rgb;
      vec3 spread = texture2D(tDiffuse, uv + smear).rgb + texture2D(tDiffuse, uv - smear).rgb;
      vec3 col = mix(base, spread * 0.5, clamp(uSpeed * 0.3 + uBoost * 0.25, 0.0, 0.4) * edge);
      float r = texture2D(tDiffuse, uv + dir * ca).r;
      float b = texture2D(tDiffuse, uv - dir * ca).b;
      col.r = mix(col.r, r, 0.6);
      col.b = mix(col.b, b, 0.6);

      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(luma), col, uSaturation);
      col = (col - 0.5) * uContrast + 0.5;

      float vig = smoothstep(0.95, 0.25, r2 * 2.0);
      col *= mix(1.0, vig, uVignette);

      col = mix(col, col * vec3(1.03, 1.0, 0.96), 0.6);
      float grain = (rand(uv * 1024.0) - 0.5) * uGrain;
      col += grain;

      gl_FragColor = vec4(col, 1.0);
    }
  `};class Re{renderer;scene=new is;composer;cameraRig;track;world;effects=new Ri;fillLight;items;audio=new Ii;input=new zi;hud;menu;clock=new Ke;bloom;grade;smaa;gtao;karts=[];ai=[];player;state="menu";raceTime=0;countdown=0;finishedShown=!1;totalLaps=3;quality="high";gtaoSupported=!1;lowSpec=matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0;ultraSpec=(()=>{if(new URLSearchParams(window.location.search).get("lite")==="1")return!0;const t=navigator.deviceMemory??8,e=navigator.hardwareConcurrency??8;return t<=4||e<=4})();lastBoost=!1;driftClock=0;groundAt=(t,e)=>this.world.groundHeight(t,e);wrongWayTimer=0;bootProgress=0;heroAngle=0;trackIndex=0;pendingTrack=null;cameraMode="chase";cupTracks=[0,2,4,6,8];cup={active:!1,index:0,points:{},gain:{}};initialCar;autoRace;constructor(t){this.quality=Re.detectQuality();const e=new URLSearchParams(window.location.search),s=Number(e.get("track"));this.trackIndex=Number.isInteger(s)&&s>=0&&s<te.length?s:0,this.initialCar=Number(e.get("car"))||0,this.autoRace=e.get("race")==="1";try{const a=sessionStorage.getItem("cobalt-cup");a&&(this.cup=JSON.parse(a))}catch{}this.renderer=new js({canvas:t,antialias:!1,powerPreference:"high-performance",stencil:!1}),this.renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.outputColorSpace=Me,this.renderer.toneMapping=_e,this.renderer.toneMappingExposure=.95,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Xs,this.cameraRig=new Ci(window.innerWidth/window.innerHeight),this.cameraRig.mobile=matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,this.track=new Mi(te[this.trackIndex]),this.scene.add(this.track.group),this.world=new Ti(this.track,this.renderer,this.scene,te[this.trackIndex].theme,this.lowSpec,this.ultraSpec),this.scene.add(this.world.group);const i=new ss(12575999,.55);i.position.set(0,6,10),this.scene.add(i),this.fillLight=i,this.scene.add(this.effects.group),this.items=new Di(this.track,this.effects),this.scene.add(this.items.group),this.hud=new Bi(this.track,this.input.isTouch),this.input.attachTouch(document.getElementById("hud")),this.input.attachCamera(t),this.input.onCameraDrag=a=>{this.cameraRig.nudgeHeight(-a*.012),this.showCameraHint()},this.menu=new Ui({onStart:a=>{this.startRace(a)},onCar:a=>{this.currentCar=a,this.state==="menu"&&this.createHero()},onTrack:a=>this.selectTrack(a),onCup:()=>this.startCup(),onQuality:a=>this.setQuality(a),onSound:a=>this.audio.setEnabled(a),onResume:()=>this.resume(),onRestart:()=>{this.startRace(this.selectedCar())},onQuit:()=>this.toMenu(),onAgain:()=>this.nextRace(),onMenu:()=>this.toMenu()});const o=new H(window.innerWidth,window.innerHeight);this.composer=new Ks(this.renderer),this.composer.addPass(new Js(this.scene,this.cameraRig.camera)),this.gtaoSupported=this.renderer.capabilities.isWebGL2&&this.renderer.extensions.has("EXT_color_buffer_float"),this.gtao=new nt(this.scene,this.cameraRig.camera,window.innerWidth,window.innerHeight),this.gtao.output=nt.OUTPUT.Default,this.gtao.blendIntensity=.85,this.gtao.enabled=this.quality==="high"&&this.gtaoSupported,this.composer.addPass(this.gtao),this.bloom=new Wt(o,.22,.45,1.05),this.composer.addPass(this.bloom),this.composer.addPass(new $s),this.grade=new os(Wi),this.composer.addPass(this.grade),this.smaa=new ti,this.composer.addPass(this.smaa),this.composer.setPixelRatio(Math.min(1.75,window.devicePixelRatio)),this.wireItems(),this.menu.setQuality(this.quality),this.menu.setTrackIndex(this.trackIndex),this.currentCar=this.initialCar,this.setQuality(this.quality),t.addEventListener("webglcontextlost",a=>{a.preventDefault();const n=document.getElementById("boot-status");n&&(n.textContent="CONTEXTO GRÁFICO PERDIDO · RECARGA LA PÁGINA"),document.getElementById("boot")?.classList.remove("done"),document.getElementById("fatal")?.classList.remove("hidden")});try{localStorage.getItem("cobalt-camera-mode")==="cockpit"&&(this.cameraMode="cockpit")}catch{}this.cameraRig.mode=this.cameraMode,document.getElementById("btn-pov")?.addEventListener("click",()=>this.toggleCameraMode()),window.addEventListener("resize",()=>this.onResize()),document.addEventListener("visibilitychange",()=>{document.hidden&&this.state==="race"&&this.pause()}),this.createHero(),this.menu.showTitle(),this.loop()}get booted(){return this.bootProgress}selectedCar(){return this.menu?.car??this.currentCar}currentCar=0;wireItems(){this.items.onPickup=t=>{t===this.player&&this.audio.pickup(),this.effects.sparks(t.pos.clone().add(new x(0,1.2,0)),new L(9436415),12)},this.items.onLaunch=()=>this.audio.itemUse(),this.items.onExplode=()=>{this.audio.explosion(),this.player&&this.cameraRig.kick(.5)}}selectTrack(t){this.pendingTrack=t===this.trackIndex?null:t}saveCup(){try{sessionStorage.setItem("cobalt-cup",JSON.stringify(this.cup))}catch{}}startCup(){this.cup={active:!0,index:0,points:{},gain:{}},this.audio.click(),this.saveCup(),this.pendingTrack=this.trackIndex===this.cupTracks[0]?null:this.cupTracks[0],this.startRace(0)}cupPointsFor(t){const e=[25,18,15,12,10,8];return e[Math.min(e.length-1,Math.max(0,t-1))]}awardCupPoints(){if(this.cup.active)for(const t of this.karts){const e=t.isPlayer?"YOU":t.spec.name,s=this.cupPointsFor(t.rank);this.cup.points[e]=(this.cup.points[e]??0)+s,this.cup.gain[e]=s}}cupResult(){if(!this.cup.active)return;const t=this.cup.index>=this.cupTracks.length-1,e=this.cup.points.YOU??0,s=Math.max(e,...Object.values(this.cup.points)),i=this.karts.map(o=>{const a=o.isPlayer?"YOU":o.spec.name;return{name:o.isPlayer?"TÚ":o.spec.name,color:`#${o.spec.accent.toString(16).padStart(6,"0")}`,points:this.cup.points[a]??0,gain:this.cup.gain[a]??0,isPlayer:o.isPlayer}}).sort((o,a)=>a.points-o.points);return{points:e,total:e,gain:this.cup.gain.YOU??0,race:this.cup.index+1,races:this.cupTracks.length,table:i,next:t?void 0:te[this.cupTracks[this.cup.index+1]].name,final:t,champion:t&&e>=s}}nextRace(){if(this.cup.active){if(this.cup.index<this.cupTracks.length-1){this.cup.index++,this.saveCup(),this.menu.hideResults(),this.pendingTrack=this.cupTracks[this.cup.index],this.startRace(this.currentCar);return}this.cup.active=!1,this.startCup();return}this.startRace(this.currentCar)}createHero(){this.disposeKarts();const t=be[this.currentCar],e=new Ee(t,!0,this.track,3),s=this.track.sample(210);e.pos.copy(s.pos).addScaledVector(s.side,-4.4),e.pos.y=s.pos.y+.02,e.yaw=Math.atan2(s.tan.x,s.tan.z),e.group.position.copy(e.pos),e.group.rotation.y=e.yaw,this.scene.add(e.group),this.player=e,this.karts=[e],this.ai=[],this.bootProgress=1}disposeKarts(){for(const t of this.karts)this.scene.remove(t.group),t.group.traverse(e=>{const s=e;s.isMesh&&s.geometry.dispose()});this.karts=[],this.ai=[]}buildAI(){return Fi.map((e,s)=>({id:`ai-${s}`,name:e,tag:"RIVAL",number:2+s*2,style:["muscle","formula","rally","buggy","formula"][s%5],body:Xe[s][0],accent:Xe[s][1],trim:1317666,stats:{maxSpeed:35+Math.random()*1.6,accel:19.5+Math.random()*2.4,turn:2.2+Math.random()*.25,grip:1}}))}async startRace(t){if(this.pendingTrack!==null&&this.pendingTrack!==this.trackIndex){this.saveCup();const a=new URL(window.location.href);a.searchParams.set("track",String(this.pendingTrack)),a.searchParams.set("car",String(t)),a.searchParams.set("race","1"),this.cup.active?a.searchParams.set("cup","1"):a.searchParams.delete("cup"),window.location.assign(a.toString());return}this.pendingTrack=null,this.currentCar=t,this.audio.unlock(),this.audio.click(),this.audio.setMusic(!0),this.disposeKarts(),this.state="countdown",this.finishedShown=!1,this.raceTime=0,this.countdown=3.9;const e=new Ee(be[t],!0,this.track,3);e.speedScale=this.input.isTouch?.92:1;const s=document.getElementById("btn-pov");s&&(s.textContent=this.cameraMode==="cockpit"?"EXTERIOR":"PILOTO"),this.cameraRig.mode=this.cameraMode,e.group.visible=this.cameraMode!=="cockpit",this.scene.add(e.group),this.player=e,this.karts=[e];const i=this.buildAI(),o=[0,1,2,4,5];i.forEach((a,n)=>{const r=new Ee(a,!1,this.track,o[n]);r.speedScale=this.input.isTouch?.97:1,this.scene.add(r.group),this.karts.push(r),this.ai.push({kart:r,itemTimer:3+Math.random()*5,lane:0,laneTarget:0})}),this.menu.showRace(),this.hud.show(!0),this.hud.setTrack(this.track),this.hud.countdown("3"),this.cameraRig.beginIntro(),this.hud.setItem(null),this.audio.countdown(!1),this.hud.message("GET READY",1.6),this.track.setStartLights("red");for(const a of this.karts)a.item=null}toMenu(){this.cup.active=!1,this.state="menu",this.menu.showTitle(),this.hud.show(!1),this.audio.stopMusic(),this.audio.silenceEngine(),this.createHero(),this.hud.countdown(null)}resume(){this.state==="paused"&&(this.state="race",this.menu.showPause(!1))}pause(){this.state!=="race"&&this.state!=="countdown"||(this.state="paused",this.menu.showPause(!0),this.audio.silenceEngine())}static detectQuality(){const t=new URLSearchParams(window.location.search).get("quality");return t==="low"||t==="medium"||t==="high"?t:matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0||"ontouchstart"in window||Math.min(window.innerWidth,window.innerHeight)<600?"low":"high"}get webglInfo(){try{const t=this.renderer.getContext(),e=t.getExtension("WEBGL_debug_renderer_info");return`${e?String(t.getParameter(e.UNMASKED_RENDERER_WEBGL)):"GPU desconocida"} · WebGL2 ${this.renderer.capabilities.isWebGL2?"sí":"no"}`}catch{return"sin contexto WebGL"}}get hasRendered(){return this.firstFrameChecked}setQuality(t){this.quality=t;const e=t==="high"?Math.min(1.75,window.devicePixelRatio):t==="medium"?Math.min(1.2,window.devicePixelRatio):1;this.renderer.setPixelRatio(e),this.composer.setPixelRatio(e),this.world.sunLight.castShadow=t!=="low",this.bloom.enabled=t!=="low",this.gtao.enabled=t==="high"&&this.gtaoSupported,this.smaa.enabled=t!=="low",this.grade.enabled=t!=="low",this.onResize()}onResize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setSize(t,e),this.composer.setSize(t,e),this.cameraRig.resize(t/e),this.bloom.setSize(t,e),this.gtao.setSize(t,e),this.smaa.setSize(t,e)}aiInput(t,e){const s=t.kart,i=s.speed,o=Math.round(this.track.sampleCount*.0025+i*1.4),a=this.track.sample(s.index+o),n=this.track.sample(s.index+o*2).curv;t.laneTarget=O.clamp(-n*1600,-3,3),t.lane+=(t.laneTarget-t.lane)*Math.min(1,e*1.6);let r=0;for(const T of this.karts){if(T===s)continue;const P=T.pos.clone().sub(s.pos),I=P.dot(s.forward);if(I>0&&I<7){const R=P.dot(s.right);Math.abs(R)<2.2&&(r-=Math.sign(R||.3)*.35)}}const l=a.pos.clone().addScaledVector(a.side,t.lane),c=l.x-s.pos.x,u=l.z-s.pos.z;let d=Math.atan2(c,u)-s.yaw;for(;d>Math.PI;)d-=Math.PI*2;for(;d<-Math.PI;)d+=Math.PI*2;const m=O.clamp(d*2.6+r,-1,1);let p=999;const b=Math.abs(n);b>8e-4&&(p=Math.sqrt(26/b));const w=s.rank<=2?.985:s.rank>=5?1.06:1.02,M=Math.min(s.spec.stats.maxSpeed*w,p),y=i>M*1.02;return t.itemTimer-=e,s.item&&t.itemTimer<=0?(this.items.use(s,this.karts),t.itemTimer=6+Math.random()*8):s.item&&s.rank>3&&Math.random()<e*.35&&(this.items.use(s,this.karts),t.itemTimer=6+Math.random()*8),{steer:m,brake:y,drift:!1,item:!1}}checkCollisions(t){for(let e=0;e<this.karts.length;e++)for(let s=e+1;s<this.karts.length;s++){const i=this.karts[e],o=this.karts[s],a=o.pos.x-i.pos.x,n=o.pos.z-i.pos.z,r=a*a+n*n;if(r>6.4||r<1e-4)continue;const l=Math.sqrt(r),c=(2.9-l)*.7,u=a/l,f=n/l;i.pos.x-=u*c,i.pos.z-=f*c,o.pos.x+=u*c,o.pos.z+=f*c,i.speed*=.992,o.speed*=.992,(i===this.player||o===this.player)&&t>0&&(this.cameraRig.kick(.35),this.audio.hit()),this.effects.sparks(new x((i.pos.x+o.pos.x)/2,i.pos.y+.7,(i.pos.z+o.pos.z)/2),new L(16765286),2)}}updateRanks(){[...this.karts].sort((e,s)=>e.finished&&s.finished?e.finishTime-s.finishTime:e.finished?-1:s.finished?1:s.totalProgress-e.totalProgress).forEach((e,s)=>e.rank=s+1)}standings(){const t=this.totalLaps*this.track.sampleCount,e=Math.max(20,this.raceTime/Math.max(1,this.player.lapCount));return[...this.karts].sort((s,i)=>s.rank-i.rank).map(s=>{const i=Math.max(0,t-s.totalProgress),o=this.raceTime+i/this.track.sampleCount*e;return{rank:s.rank,name:s.isPlayer?"YOU":s.spec.name,color:`#${s.spec.body.toString(16).padStart(6,"0")}`,time:s.finished?s.finishTime:o,best:s.bestLap,isPlayer:s.isPlayer}})}stuckTimer=0;checkStuck(t){if(!this.player||this.player.finished||this.state!=="race")return;Math.abs(this.track.nearest(this.player.pos,this.player.hint).lateral)>this.track.halfWidth+1.5&&this.player.speed<4?this.stuckTimer+=t:this.stuckTimer=0,this.stuckTimer>2.2&&(this.player.respawn(this.track),this.stuckTimer=0,this.cameraRig.kick(.3))}updatePlayerEffects(t,e){const s=this.player;if(!s)return;const i=s.boostTime>0;if(i&&!this.lastBoost&&(this.audio.boost(),this.cameraRig.kick(.22)),this.lastBoost=i,this.audio.engine(s.speed,s.spec.stats.maxSpeed,1,i,s.offroad),this.audio.drift(s.drifting,Math.abs(s.steer)),this.driftClock+=t,s.drifting&&s.speed>8){const o=s.pos.clone().addScaledVector(s.forward,-1.5),a=s.right;this.effects.skid(o.clone().addScaledVector(a,.9),s.yaw,t),this.effects.skid(o.clone().addScaledVector(a,-.9),s.yaw,t),this.driftClock>.07&&(this.driftClock=0,this.effects.smokePuff(o,1))}s.offroad&&s.speed>4&&this.driftClock>.09&&this.effects.dust(s.pos.clone().addScaledVector(s.forward,-1),s.forward,1),s.wallHit>.3&&Math.random()<.2&&this.effects.sparks(s.pos.clone().addScaledVector(s.right,1.2),new L(16765286),4)}loop=()=>{const t=this.clock.getDelta(),e=Math.min(.05,t),s=this.clock.elapsedTime;if(this.monitorPerformance(t),this.state==="menu"){this.heroAngle+=e,this.cameraRig.updateMenu(e,this.player.pos,s),this.world.update(e,s,this.player.pos,this.cameraRig.camera),this.effects.update(e);const a=this.cameraRig.camera;for(const n of this.karts)n!==this.player&&(n.group.visible=n.pos.distanceTo(a.position)>3.4);this.items.update(e,this.karts,this.cameraRig.camera),this.player.group.rotation.y=this.player.yaw+Math.sin(this.heroAngle*.4)*.02,this.hud.show(!1)}else if(this.state!=="paused"){if(this.input.consumePause()&&(this.state==="race"?this.pause():this.isPaused()&&this.resume()),this.isPaused()){this.renderComposer(),requestAnimationFrame(this.loop);return}if(this.state==="countdown"){this.countdown-=e;const l=Math.ceil(this.countdown-.9);l>0&&l<=3&&this.hud.countdown(String(l)),this.countdown<=.9&&this.countdown+e>.9&&(this.hud.countdown("GO!"),this.audio.countdown(!0),this.track.setStartLights("green"),window.setTimeout(()=>this.track.setStartLights("off"),1400),window.setTimeout(()=>this.hud.countdown(null),700)),this.countdown<=0&&(this.state="race",this.raceTime=0)}else this.state==="race"&&(this.raceTime+=e);const a=this.state==="race",n=this.input.read();this.input.consumeItem()&&this.player.item&&a&&this.items.use(this.player,this.karts),this.input.consumeCamera()&&this.toggleCameraMode(),this.input.consumeRespawn()&&a&&this.player.respawn(this.track);for(const l of this.karts){let c={steer:0,brake:!1,drift:!1,item:!1};if(l===this.player)c=n;else if(a&&!l.finished){const f=this.ai.find(d=>d.kart===l);f&&(c=this.aiInput(f,e))}const u=l.lapCount;if(l.update(e,this.track,c,this.raceTime,a,this.groundAt),l.lapCount>u){if(l===this.player){this.hud.flashLap(),this.audio.lap();const f=this.totalLaps-l.lapCount;f>0&&this.hud.message(f===1?"ÚLTIMA VUELTA":`VUELTA ${l.lapCount+1}/${this.totalLaps}`,1.6)}l.lapCount>=this.totalLaps&&!l.finished&&(l.finished=!0,l.finishTime=this.raceTime,l===this.player&&this.finishRace())}}this.checkCollisions(e),this.checkStuck(e);const r=this.cameraRig.camera;for(const l of this.karts)l!==this.player&&(l.group.visible=l.pos.distanceTo(r.position)>3.4);if(this.items.update(e,this.karts,this.cameraRig.camera),this.effects.update(e),this.world.update(e,s,this.player.pos,this.cameraRig.camera),this.updateRanks(),this.updatePlayerEffects(e,s),this.state==="race"||this.state==="countdown"){this.cameraRig.update(e,this.player,this.track,this.state==="countdown"?this.countdown:0);const l=this.isWrongWay();this.wrongWayTimer=l?this.wrongWayTimer+e:0,this.hud.wrongWay(this.wrongWayTimer>.8)}this.hud.update(e,this.player,this.karts,this.raceTime,Math.min(this.player.lapCount+1,this.totalLaps),this.totalLaps)}const i=this.state==="race"||this.state==="countdown",o=i?O.clamp(this.player.speed/this.player.spec.stats.maxSpeed,0,1):0;this.grade.uniforms.uSpeed.value=o*o,this.grade.uniforms.uBoost.value=i&&this.player.boostTime>0?1:0,this.fillLight.position.copy(this.cameraRig.camera.position).add(new x(0,2,0)),this.fillLight.target.position.copy(this.player.pos),this.fillLight.target.updateMatrixWorld(),this.renderComposer(),requestAnimationFrame(this.loop)};perfFrames=0;perfTime=0;perfChecked=0;monitorPerformance(t){if(this.state==="menu"||this.perfChecked>=2||(this.perfFrames++,this.perfTime+=t,this.perfTime<2.5))return;const e=this.perfFrames/this.perfTime;this.perfFrames=0,this.perfTime=0,e<32&&this.quality==="high"?(this.setQuality("medium"),this.menu.setQuality("medium")):e<24&&this.quality==="medium"?(this.setQuality("low"),this.menu.setQuality("low")):this.perfChecked++}firstFrameChecked=!1;camHintTimer=0;showCameraHint(){const t=document.getElementById("cam-hint");if(!t)return;const e=this.cameraRig.heightBias;t.textContent=`CÁMARA ${e>=0?"+":""}${e.toFixed(1)}`,t.classList.remove("hidden"),window.clearTimeout(this.camHintTimer),this.camHintTimer=window.setTimeout(()=>t.classList.add("hidden"),1200)}renderComposer(){this.quality==="low"?this.renderer.render(this.scene,this.cameraRig.camera):this.composer.render(),this.firstFrameChecked||(this.firstFrameChecked=!0,this.checkFrameNotBlank())}checkFrameNotBlank(){try{const t=this.renderer.getContext(),e=this.renderer.domElement,s=new Uint8Array(4),i=[[.25,.2],[.5,.1],[.75,.25]];let o=0;for(const[a,n]of i)t.readPixels(Math.floor(e.width*a),Math.floor(e.height*n),1,1,t.RGBA,t.UNSIGNED_BYTE,s),s[0]>248&&s[1]>248&&s[2]>248&&o++;o>=2&&this.quality!=="low"&&(this.setQuality("low"),this.menu.setQuality("low"))}catch{}}toggleCameraMode(){this.cameraMode=this.cameraMode==="chase"?"cockpit":"chase",this.cameraRig.mode=this.cameraMode;const t=document.getElementById("btn-pov");t&&(t.textContent=this.cameraMode==="cockpit"?"EXTERIOR":"PILOTO"),this.player.group.visible=this.cameraMode!=="cockpit";try{localStorage.setItem("cobalt-camera-mode",this.cameraMode)}catch{}}isPaused(){return this.state==="paused"}isWrongWay(){const t=this.player,e=this.track.sample(t.index);return e.tan.x*Math.sin(t.yaw)+e.tan.z*Math.cos(t.yaw)<-.45&&t.speed>4}finishRace(){if(this.finishedShown)return;this.finishedShown=!0,this.state="finished",this.updateRanks(),this.awardCupPoints(),this.saveCup(),this.audio.finish(),this.audio.silenceEngine(),this.effects.confetti(this.player.pos.clone().add(new x(0,3,0))),this.hud.message(this.player.rank===1?"¡VICTORIA!":"CARRERA TERMINADA",2.4),this.cameraRig.kick(.6);const t=this.standings(),e=this.cupResult();window.setTimeout(()=>{this.menu.showResults(t,this.player.bestLap,this.raceTime,this.player.rank===1,e),this.hud.show(!1)},2200)}}const Gi=document.getElementById("scene"),qe=document.getElementById("boot"),ve=document.getElementById("boot-fill"),_t=document.getElementById("boot-status"),Vi=document.getElementById("rotate-hint");function Ye(){const h=window.innerHeight>window.innerWidth,t=matchMedia("(pointer: coarse)").matches;Vi.classList.toggle("hidden",!(t&&h))}function Qe(h){const t=document.getElementById("boot");if(t){t.classList.remove("done");const e=document.getElementById("boot-status");e&&(e.textContent=h)}De(h)}const Ze="cobalt-build-id";async function we(){try{const h=await fetch(`./build.json?t=${Date.now()}`,{cache:"no-store"});if(!h.ok)return;const t=await h.json();if(!t.id||t.id==="mvhts7ep"||sessionStorage.getItem(Ze)===t.id)return;sessionStorage.setItem(Ze,t.id),Hi()}catch{}}function De(h){const t=document.getElementById("fatal"),e=document.getElementById("fatal-text");t&&t.classList.remove("hidden"),e&&(e.textContent=h)}async function Le(){try{await navigator.serviceWorker?.getRegistration()?.then(h=>h?.update())}catch{}location.replace(`${location.pathname}?u=${Date.now()}`)}function Hi(){const h=document.getElementById("update-banner");h&&(h.classList.remove("hidden"),h.onclick=()=>{Le()})}document.getElementById("fatal-reload")?.addEventListener("click",()=>location.reload());window.addEventListener("webglcontextlost",()=>{De("El navegador perdió el contexto gráfico. Pulsa RECARGAR.")});async function ji(){window.__buildId="mvhts7ep",window.__forceUpdate=Le;const h=document.getElementById("build-badge");h&&(h.textContent="v mvhts7ep · ACTUALIZAR",h.addEventListener("click",()=>{Le()})),window.__checkUpdate=we,window.addEventListener("error",s=>{Qe(`ERROR: ${s.message}`)}),window.addEventListener("unhandledrejection",s=>{Qe(`ERROR: ${String(s.reason)}`)}),Ye(),window.addEventListener("resize",Ye),ve.style.width="18%",await new Promise(s=>requestAnimationFrame(()=>s(null))),_t.textContent="DIBUJANDO LA COSTA",await new Promise(s=>setTimeout(s,60)),ve.style.width="46%",await new Promise(s=>requestAnimationFrame(()=>s(null)));let t;try{const s=performance.now();t=new Re(Gi),window.__buildMs=Math.round(performance.now()-s)}catch(s){_t.textContent="TU NAVEGADOR NO PUEDE CREAR EL CONTEXTO WEBGL",console.error(s);return}window.__game=t,ve.style.width="82%",_t.textContent="AJUSTANDO LOS BUGGIES",await new Promise(s=>setTimeout(s,320)),ve.style.width="100%",_t.textContent="LISTO";const e=performance.now();for(;!t.hasRendered&&performance.now()-e<8e3;)await new Promise(s=>setTimeout(s,150));if(!t.hasRendered){_t.textContent=`NO SE PUDO DIBUJAR · ${t.webglInfo}`,De(`WebGL no ha dibujado. ${t.webglInfo}`);return}await new Promise(s=>setTimeout(s,200)),qe.classList.add("done"),window.setTimeout(()=>qe.remove(),900),"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js?v=mvhts7ep").then(s=>s.update()).catch(()=>{}),t.autoRace&&t.startRace(t.initialCar),we(),window.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&we()}),window.setInterval(()=>{document.visibilityState==="visible"&&we()},3e5)}ji();
