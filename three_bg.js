// three_bg.js
(function() {
    // Basic Three.JS Setup
    const scene = new THREE.Scene();
    
    // We want a transparent background
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Styling the canvas to be fixed behind everything
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    
    document.body.appendChild(renderer.domElement);

    // Create a Heart Shape
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7, x - 6, y + 7 );
    heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

    const extrudeSettings = { depth: 2, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 1, bevelThickness: 1 };
    const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
    
    // Center the geometry
    geometry.computeBoundingBox();
    const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( centerOffset, -10, -1 );

    // Glowing Pink Material
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff6fa3, 
        emissive: 0xff4c8f,
        emissiveIntensity: 0.2,
        roughness: 0.2,
        metalness: 0.1
    });

    const heart = new THREE.Mesh( geometry, material );
    heart.scale.set(0.08, -0.08, 0.08); // Flip Y because ThreeJS shape y is inverted visually
    scene.add( heart );

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener( 'mousemove', (event) => {
        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame( animate );

        targetX = mouseX * .001;
        targetY = mouseY * .001;

        heart.rotation.y += 0.05 * ( targetX - heart.rotation.y );
        heart.rotation.x += 0.05 * ( targetY - heart.rotation.x );
        
        // Add a continuous gentle float
        heart.position.y = Math.sin(Date.now() * 0.002) * 0.2;

        renderer.render( scene, camera );
    }

    animate();

    // Handle Resize
    window.addEventListener( 'resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    });
})();
