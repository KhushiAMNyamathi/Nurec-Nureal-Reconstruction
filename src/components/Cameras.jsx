import { useEffect, useState } from "react";
import CameraFrustum from "./CameraFrustum";


export default function Cameras() {

    const [cameras, setCameras] = useState([]);


    useEffect(() => {

        async function loadCameras(){

            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/colmap/cameras?project_path=C:/Users/adminusr/Desktop/demo1"
                );


                const data = await response.json();


                console.log(
                    "COLMAP Cameras:",
                    data
                );


                setCameras(
                    data.cameras
                );


            }
            catch(error){

                console.error(
                    "Camera loading failed:",
                    error
                );

            }

        }


        loadCameras();


    },[]);



    return (

        <>

        {
            cameras.map(
                (camera)=>(

                    <CameraFrustum

                        key={camera.id}

                        position={
                            camera.position
                        }

                    />

                )
            )
        }

        </>

    );
}