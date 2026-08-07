import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import * as THREE from "three";
import { useEffect } from "react";
import Cameras from "./Cameras";


function PointCloud() {

    const geometry = useLoader(
        PLYLoader,
        "http://127.0.0.1:8000/point-cloud?project_path=C:/Users/adminusr/Desktop/demo1"
    );


    useEffect(() => {

        if (!geometry) return;


        geometry.computeBoundingBox();


        const center = new THREE.Vector3();

        geometry.boundingBox.getCenter(center);


        geometry.translate(
            -center.x,
            -center.y,
            -center.z
        );


        console.log(
            "Point cloud loaded:",
            geometry.attributes.position.count,
            "points"
        );


    }, [geometry]);


    return (

        <points geometry={geometry}>

            <pointsMaterial
                color="#222222"
                size={0.015}
                sizeAttenuation={true}
            />
        </points>
    );
}

export default function PointCloudViewer({
    height,
}) {
    return (

        <div
            style={{
                width: "100%",
                height,
                background: "#ffffff",
                borderRadius: 10,
                overflow: "hidden"
            }}
        >
            <Canvas
                camera={{
                    position: [0, 0, 5],
                    fov: 50
                }}
            >
                {/* White Three.js background */}
                <color
                    attach="background"
                    args={["white"]}
                />


                <ambientLight intensity={2} />


                <Bounds
                    fit
                    clip
                    observe
                    margin={1.5}
                >

                    <PointCloud />

                    <Cameras />

                </Bounds>


                <OrbitControls
                    makeDefault
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                />

            </Canvas>

        </div>

    );
}