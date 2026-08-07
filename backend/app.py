from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
import asyncio
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil
import subprocess
from pydantic import BaseModel
from tkinter import Tk
from tkinter.filedialog import askdirectory
import pycolmap
CURRENT_COLMAP_PROJECT = None

COLMAP_ROOT = r"C:\Users\adminusr\Desktop\Shashank\ColmapNoCuda"

COLMAP_EXE = os.path.join(
    COLMAP_ROOT,
    "bin",
    "colmap.exe"
)


# =========================
# APP INITIALIZATION
# =========================

app = FastAPI(
    title="NuRec Backend",
    version="1.0"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DIRECTORIES
# =========================

UPLOAD_DIR = os.path.abspath("uploads")

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def home():
    return {
        "status": "NuRec Backend Running"
    }

@app.get("/select-project-folder")
def select_project_folder():
    print("Opening folder dialog...")
    root = Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    root.update()
    folder = askdirectory(
        parent=root,
        title="Select COLMAP Project Folder"
    )
    root.destroy()
    print("Selected folder:", folder)
    return {
        "folder": folder
    }
# =========================
# IMAGE UPLOAD
# =========================

@app.post("/upload-images")
async def upload_images(
    files: List[UploadFile] = File(...)
):

    try:

        print("\n========== UPLOAD START ==========")
        print("Total files:", len(files))
        saved_files = []
        for file in files:

            print("Uploading:", file.filename)

            # allow only images
            if not file.content_type.startswith("image/"):
                print(
                    "Skipped:",
                    file.filename
                )
                continue

            # Remove folder path from filename
            filename = os.path.basename(file.filename)
            folder_name = "images"
            image_folder = os.path.join(
            UPLOAD_DIR,
            folder_name
            )
            os.makedirs(
            image_folder,
            exist_ok=True
            )
            file_path = os.path.join(
            image_folder,
            filename
            )

            with open(
                file_path,
                "wb"
                ) as buffer:

                shutil.copyfileobj(
                file.file,
                buffer
            )

            saved_files.append(
                file.filename
            )


        print(
            "Uploaded:",
            len(saved_files)
        )

        print("========== UPLOAD END ==========\n")


        return {
            "success": True,
    "message": "Images uploaded successfully",
    "count": len(saved_files),
    "files": saved_files,
    "image_folder": os.path.abspath(UPLOAD_DIR)
        }


    except Exception as e:

        print(
            "UPLOAD ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# =========================
# DATASET INFO
# =========================

@app.get("/dataset-info")
def dataset_info():

    files = []

    if os.path.exists(UPLOAD_DIR):

        files = [
            f for f in os.listdir(UPLOAD_DIR)
            if f.lower().endswith(
                (
                    ".jpg",
                    ".jpeg",
                    ".png"
                )
            )
        ]


    return {
        "image_count": len(files),
        "path": os.path.abspath(UPLOAD_DIR)
    }

# =========================
# COLMAP LIVE LOG STREAM
# =========================

@app.websocket("/colmap-progress")
async def colmap_progress(websocket: WebSocket):

    origin = websocket.headers.get("origin")

    print("WebSocket origin:", origin)


    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]


    if origin not in allowed_origins:

        await websocket.close(
            code=1008
        )

        return


    await websocket.accept()

    print("WebSocket connected")
# =========================
# COLMAP REQUEST MODEL
# =========================

class ColmapRequest(BaseModel):

    project_path: str

    image_path: str

    camera_model: str
    single_camera: bool

    max_image_size: int

    affine_shape: bool

    domain_pooling: bool

    gpu_matching: bool
# =========================
# RUN COLMAP PLACEHOLDER
# =========================

# =========================
# RUN COLMAP
# =========================
@app.post("/run-colmap")
def run_colmap(config: ColmapRequest):
    global CURRENT_COLMAP_PROJECT
    try:

        print("\n========== COLMAP START ==========")

        project_path = config.project_path
       
        CURRENT_COLMAP_PROJECT = project_path

        print("CURRENT PROJECT:",CURRENT_COLMAP_PROJECT)
        
        image_path = os.path.abspath(config.image_path)


        # =========================
        # CREATE COLMAP FOLDERS
        # =========================

        colmap_folder = os.path.join(
            project_path,
            "colmap"
        )

        database_path = os.path.join(
            colmap_folder,
            "database.db"
        )

        sparse_path = os.path.join(
            colmap_folder,
            "sparse"
        )

        os.makedirs(
            sparse_path,
            exist_ok=True
        )


        print("Project :", project_path)
        print("Images  :", image_path)

        print("COLMAP EXE:", COLMAP_EXE)
        print("COLMAP BIN:", os.path.dirname(COLMAP_EXE))
        print("IMAGE PATH:", image_path)
        print("IMAGE EXISTS:", os.path.exists(image_path))
        print("DATABASE:", database_path)



        # =========================
        # STEP 1 FEATURE EXTRACTION
        # =========================

        feature_command = [

            COLMAP_EXE,
            "feature_extractor",

            "--database_path",
            database_path,

            "--image_path",
            image_path,

            "--ImageReader.single_camera",
            "1" if config.single_camera else "0",

            "--ImageReader.camera_model",
            config.camera_model,

            "--FeatureExtraction.max_image_size",
            str(config.max_image_size),

            "--SiftExtraction.estimate_affine_shape",
            "1" if config.affine_shape else "0",

            "--SiftExtraction.domain_size_pooling",
            "1" if config.domain_pooling else "0"

        ]


        print("Running Feature Extraction...")
        print("\nRunning command:")
        print(" ".join(feature_command))


        subprocess.run(
            feature_command,
            check=True
        )



        # =========================
        # STEP 2 FEATURE MATCHING
        # =========================

        matching_command = [

            COLMAP_EXE,

            "exhaustive_matcher",

            "--database_path",
            database_path,

            "--FeatureMatching.use_gpu",
            "1" if config.gpu_matching else "0"

        ]


        print("Running Feature Matching...")


        subprocess.run(
            matching_command,
            check=True
        )



        # =========================
        # STEP 3 MAPPER
        # =========================

        mapper_command = [

            COLMAP_EXE,

            "mapper",

            "--database_path",
            database_path,

            "--image_path",
            image_path,

            "--output_path",
            sparse_path

        ]


        print("Running Mapper...")


        subprocess.run(
            mapper_command,
            check=True
        )



        # =========================
        # COLMAP COMPLETE
        # =========================

        print("========== COLMAP DONE ==========")



        # =========================
        # CONVERT MODEL TO PLY
        # =========================

        model_path = os.path.join(
            sparse_path,
            "0"
        )


        ply_path = os.path.join(
            project_path,
            "point_cloud.ply"
        )


        print(
            "Converting COLMAP model to PLY..."
        )


        converter_command = [

            COLMAP_EXE,

            "model_converter",

            "--input_path",
            model_path,

            "--output_path",
            ply_path,

            "--output_type",
            "PLY"

        ]


        subprocess.run(
            converter_command,
            check=True
        )


        print(
            "PLY CREATED:",
            ply_path
        )


        print(
            "COLMAP_PROGRESS:100"
        )


        return {

            "status": "success",

            "message": "COLMAP reconstruction completed",

            "output_folder": sparse_path,

            "ply_path": ply_path

        }



    except subprocess.CalledProcessError as e:

        print(
            "COLMAP ERROR:",
            e
        )


        raise HTTPException(

            status_code=500,

            detail="COLMAP command failed"

        )



    except Exception as e:

        print(
            "ERROR:",
            e
        )


        raise HTTPException(

            status_code=500,

            detail=str(e)

        )



# =========================
# GET POINT CLOUD INFO
# =========================


# =========================
# CONVERT PCD TO PLY
# =========================

@app.post("/convert-pcd")
def convert_pcd(project_path: str):

    sparse_path = os.path.join(
        project_path,
        "colmap",
        "sparse",
        "0"
    )


    output = os.path.join(
        project_path,
        "point_cloud.ply"
    )


    command = [

        COLMAP_EXE,

        "model_converter",

        "--input_path",
        sparse_path,

        "--output_path",
        output,

        "--output_type",
        "PLY"

    ]


    subprocess.run(
        command,
        check=True
    )


    return {

        "ply": output

    }
@app.get("/point-cloud")
def get_point_cloud(project_path: str):

    ply_file = os.path.join(
        project_path,
        "point_cloud.ply"
    )


    print("Requested PLY:")
    print(ply_file)


    if not os.path.exists(ply_file):

        raise HTTPException(
            status_code=404,
            detail="PLY file not found"
        )


    return FileResponse(
        ply_file,
        media_type="application/octet-stream",
        filename="point_cloud.ply"
    )
# =========================
# OPEN COLMAP GUI VIEWER
# =========================

@app.post("/open-colmap")
def open_colmap():

    try:

        if CURRENT_COLMAP_PROJECT is None:

            raise HTTPException(
                status_code=400,
                detail="No COLMAP project available"
            )


        project_path = CURRENT_COLMAP_PROJECT


        sparse_model = os.path.join(
            project_path,
            "colmap",
            "sparse",
            "0"
        )


        database_path = os.path.join(
            project_path,
            "colmap",
            "database.db"
        )


        image_path = os.path.join(
    UPLOAD_DIR,
    "images"
)


        command = [

            COLMAP_EXE,
            "gui",
            "--import_path",
            sparse_model,
            "--database_path",
            database_path,
            "--image_path",
            image_path

        ]

        # subprocess.Popen(command)
#         cmd = (
#     f'"{COLMAP_EXE}" '
#     f'gui '
#     f'--import_path "{sparse_model}" '
#     f'--database_path "{database_path}" '
#     f'--image_path "{image_path}"'
# )

#         print(cmd)

#         subprocess.Popen(
#     cmd,
#     shell=True
# )
        env = os.environ.copy()

        env["QT_QPA_PLATFORM_PLUGIN_PATH"] = os.path.join(
    COLMAP_ROOT,
    "plugins",
    "platforms"
)

        env["PATH"] = (
    os.path.join(COLMAP_ROOT, "bin")
    + ";"
    + env["PATH"]
)

        command = [
    COLMAP_EXE,
    "gui",
    "--import_path", sparse_model,
    "--database_path", database_path,
    "--image_path", image_path
]

        print(command)
        subprocess.Popen(
    command,
    cwd=os.path.join(COLMAP_ROOT, "bin"),
    env=env
)
        


        return {
            "status":"success",
            "project":project_path,
            "message":"COLMAP viewer launched"
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =========================
# GET COLMAP CAMERA DATA
# =========================

@app.get("/colmap/cameras")
def get_colmap_cameras(project_path: str):

    try:

        sparse_model = os.path.join(
            project_path,
            "colmap",
            "sparse",
            "0"
        )


        print("Reading COLMAP model:")
        print(sparse_model)


        if not os.path.exists(sparse_model):

            raise HTTPException(
                status_code=404,
                detail="COLMAP sparse model not found"
            )


        reconstruction = pycolmap.Reconstruction(
            sparse_model
        )


        cameras = []


        for image_id, image in reconstruction.images.items():


            center = image.projection_center()


            cameras.append({

                "id": image_id,

                "name": image.name,

                "position": [

                    float(center[0]),
                    float(center[1]),
                    float(center[2])

                ]

            })


        print(
            "Cameras loaded:",
            len(cameras)
        )


        return {

            "count": len(cameras),

            "cameras": cameras

        }


    except Exception as e:

        print(
            "Camera extraction error:",
            e
        )

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )