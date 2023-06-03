import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

const canvasContainer = document.querySelector('#canvasContainer')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	canvasContainer.offsetWidth / canvasContainer.offsetHeight,
	0.1,
	1000
)
camera.position.z = 15

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: document.querySelector('canvas'),
})

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

//CREATE A SPHERE
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms: {
			globeTexture: { value: new THREE.TextureLoader().load('earth.jpg') },
		},
	})
	// new THREE.MeshBasicMaterial({
	// 	map: new THREE.TextureLoader().load('earth.jpg'),
	// })
)

//ATMOSPHERE
const atmosphere = new THREE.Mesh(
	new THREE.SphereGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader: atmosphereVertexShader,
		fragmentShader: atmosphereFragmentShader,
		blending: THREE.AdditiveBlending,
		side: THREE.BackSide,
	})
)
atmosphere.scale.set(1.1, 1.1, 1.1)
scene.add(atmosphere)

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff })

const starVertices = []

for (let i = 0; i < 7000; i++) {
	const x = (Math.random() - 0.5) * 2000
	const y = (Math.random() - 0.5) * 2000
	const z = -Math.random() * 4050
	starVertices.push(x, y, z)
}

starGeometry.setAttribute(
	'position',
	new THREE.Float32BufferAttribute(starVertices, 3)
)

const star = new THREE.Points(starGeometry, starMaterial)
scene.add(star)

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)

	sphere.rotation.y += 0.003
	group.rotation.y = mouse.y * 1.5
	gsap.to(group.rotation, {
		x: mouse.x * 0.5,
		y: mouse.y * 0.5,
		duration: 2,
	})
	activateWarpDrive()
}

let cameraSpeed = 0.1
let acceleration = 0.01

function activateWarpDrive() {
	if (cameraMove === true) {
		if (camera.position.y < 12) {
			camera.position.y += 0.1
			return
		}
		warpDrive = true
	}
	if (warpDrive === true) {
		if (camera.position.z <= -3000) {
			cameraSpeed = 0
			acceleration = 0
			const bgText = document.getElementById('bg-text')
			setTimeout(() => bgText.classList.remove('opacity-0'), 500)
		}
		cameraSpeed += acceleration
		camera.position.z -= cameraSpeed
	}
}

const mouse = {
	x: undefined,
	y: undefined,
}

addEventListener('mousemove', (e) => {
	mouse.x = (e.clientX / innerWidth) * 2 - 1
	mouse.y = (e.clientX / innerHeight) * 2 - 1
})

const button = document.getElementById('learn-more')

let cameraMove = false
let warpDrive = false

button.addEventListener('click', () => {
	cameraMove = true
	button.classList.add('bg-blue-800')
	setTimeout(() => button.classList.remove('bg-blue-800'), 100)
})

animate()
