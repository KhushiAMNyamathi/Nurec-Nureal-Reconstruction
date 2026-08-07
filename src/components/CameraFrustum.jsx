import * as THREE from "three";


export default function CameraFrustum({ position }) {

    const geometry = new THREE.BufferGeometry();


    const vertices = new Float32Array([

        // camera origin to corners

        0,0,0,
        -0.3,0.2,-0.5,

        0,0,0,
        0.3,0.2,-0.5,

        0,0,0,
        0.3,-0.2,-0.5,

        0,0,0,
        -0.3,-0.2,-0.5,


        // camera rectangle

        -0.3,0.2,-0.5,
        0.3,0.2,-0.5,

        0.3,0.2,-0.5,
        0.3,-0.2,-0.5,

        0.3,-0.2,-0.5,
        -0.3,-0.2,-0.5,

        -0.3,-0.2,-0.5,
        -0.3,0.2,-0.5

    ]);


    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices,3)
    );


    return (

        <lineSegments
            geometry={geometry}
            position={position}
        >

            <lineBasicMaterial
                color="red"
            />

        </lineSegments>

    );
}