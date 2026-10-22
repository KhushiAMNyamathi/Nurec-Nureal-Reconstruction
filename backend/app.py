from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
import asyncio
import threading
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil
import subprocess
from pydantic import BaseModel
from tkinter import Tk
from tkinter.filedialog import askdirectory,asksaveasfilename
import pycolmap
import json
import urllib.error
import urllib.request
import time
import socket


CURRENT_COLMAP_PROJECT = None
# =========================
# 3DGUT TRAINING
# =========================


THREEDGUT_DIR = "/home/adminusr/Shashank/3DGUT/3dgrut"
THREEDGUT_PYTHON = os.path.join(
    THREEDGUT_DIR,
    ".venv",
    "bin",
    "python"
)

THREEDGUT_PROCESS = None

THREEDGUT_LOGS = []

THREEDGUT_ERROR = {
    "message": None
}

COLMAP_EXE = "/usr/bin/colmap"
COLMAP_ROOT = "/usr"


# =========================
# APP INITIALIZATION
# =========================

app = FastAPI(
    title="NuRec Backend",
    version="1.0"
)

# =========================
# ISAAC SIM CONFIGURATION
# =========================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

ISAAC_ROOT = "/datadrive/Shashank/isaacsim"

ISAAC_EXPERIENCE = os.path.join(
    ISAAC_ROOT,
    "apps",
    "isaacsim.exp.full.streaming.kit"
)

ISAAC_EXTENSION_FOLDER = os.path.join(
    PROJECT_ROOT,
    "integrations",
    "isaac"
)

ISAAC_LOG_DIR = os.path.join(PROJECT_ROOT, "logs")
os.makedirs(ISAAC_LOG_DIR, exist_ok=True)

ISAAC_LOG_FILE = os.path.join(ISAAC_LOG_DIR, "isaac.log")

ISAAC_PROCESS = None
ISAAC_LOCK = threading.Lock()

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

class ExportRequest(BaseModel):
    format: str
    output_path: str
    
class ThreeDGUTStartRequest(BaseModel):
    path: str = "data/playroom_test"
    out_dir: str 
    experiment_name: str = "3dgut_mcmc"

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

            "--SiftExtraction.max_image_size",
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

           "--SiftMatching.use_gpu",
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
    cwd="/usr/bin",
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

# =========================
# COLMAP MODEL EXPORT
# =========================
@app.get("/select-export-file")
def select_export_file(format: str):

    format = format.upper()

    extension_map = {
        "NVM": ".nvm",
        "BUNDLER": ".out",
        "VRML": ".wrl"
    }

    if format not in extension_map:
        raise HTTPException(
            status_code=400,
            detail="Unsupported export format"
        )

    extension = extension_map[format]

    root = Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    root.update()

    file_path = asksaveasfilename(
        parent=root,
        title=f"Export COLMAP as {format}",
        defaultextension=extension,
        filetypes=[
            (f"{format} files", f"*{extension}"),
            ("All files", "*.*")
        ]
    )

    root.destroy()

    print("Selected export path:", file_path)

    return {
        "path": file_path
    }

@app.post("/api/colmap/export")
def export_colmap(request: ExportRequest):

    try:

        # ---------------------------------
        # Check current COLMAP project
        # ---------------------------------

        if CURRENT_COLMAP_PROJECT is None:

            raise HTTPException(
                status_code=400,
                detail="No COLMAP project available. Run COLMAP first."
            )

        project_path = CURRENT_COLMAP_PROJECT

        # ---------------------------------
        # COLMAP sparse model
        # ---------------------------------

        sparse_model = os.path.join(
            project_path,
            "colmap",
            "sparse",
            "0"
        )

        if not os.path.exists(sparse_model):

            raise HTTPException(
                status_code=404,
                detail=f"COLMAP sparse model not found: {sparse_model}"
            )

        # ---------------------------------
        # Requested format
        # ---------------------------------

        export_format = request.format.upper()

        # ---------------------------------
        # Validate format
        # ---------------------------------

        format_map = {
            "NVM": "NVM",
            "BUNDLER": "Bundler",
            "VRML": "VRML"
        }

        if export_format not in format_map:

            raise HTTPException(
                status_code=400,
                detail="Unsupported export format"
            )

        output_type = format_map[export_format]

        # ---------------------------------
        # Output path
        # ---------------------------------

        output_path = os.path.abspath(
            request.output_path
        )

        # Create parent directory if needed

        parent_directory = os.path.dirname(
            output_path
        )

        if parent_directory:

            os.makedirs(
                parent_directory,
                exist_ok=True
            )

        # ---------------------------------
        # COLMAP command
        # ---------------------------------

        command = [

            COLMAP_EXE,

            "model_converter",

            "--input_path",

            sparse_model,

            "--output_path",

            output_path,

            "--output_type",

            output_type

        ]

        print()
        print("========== COLMAP EXPORT ==========")
        print("Format:", export_format)
        print("Input:", sparse_model)
        print("Output:", output_path)
        print("Command:")
        print(" ".join(command))

        # ---------------------------------
        # Run COLMAP
        # ---------------------------------

        subprocess.run(
            command,
            check=True
        )

        print("EXPORT COMPLETE")
        print("====================================")

        return {

            "status": "success",

            "format": export_format,

            "outputPath": output_path,

            "message": "COLMAP export completed successfully"

        }

    except subprocess.CalledProcessError as e:

        print(
            "COLMAP EXPORT ERROR:",
            e
        )

        raise HTTPException(

            status_code=500,

            detail="COLMAP model export failed"

        )

    except HTTPException:

        raise

    except Exception as e:

        print(
            "EXPORT ERROR:",
            e
        )

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )
def read_3dgut_output(process):

    global THREEDGUT_PROCESS

    try:

        for line in process.stdout:

            if not line:
                continue

            # Show output in VS Code terminal
            print(
                "[3DGUT]",
                line,
                end="",
                flush=True
            )

            # Save output for UI
            THREEDGUT_LOGS.append(line)

            # Detect CUDA errors
            if "No CUDA GPUs are available" in line:

                THREEDGUT_ERROR["message"] = (
                    "3DGUT training failed: "
                    "No CUDA GPUs are available"
                )

            elif "CUDA is not available" in line:

                THREEDGUT_ERROR["message"] = (
                    "3DGUT training failed: "
                    "CUDA is not available"
                )

            # Keep only latest 1000 lines
            if len(THREEDGUT_LOGS) > 1000:

                THREEDGUT_LOGS.pop(0)

    except Exception as e:

        print(
            "3DGUT output reader error:",
            e
        )

    finally:

        return_code = process.wait()

        print()
        print("======================================")
        print("3DGUT PROCESS FINISHED")
        print("Exit code:", return_code)
        print("======================================")

        if return_code != 0:

            if not THREEDGUT_ERROR["message"]:

                THREEDGUT_ERROR["message"] = (
                    "3DGUT training failed. "
                    "Check the terminal output."
                )

        else:

            THREEDGUT_ERROR["message"] = None


# =========================
# 3DGUT START TRAINING
# =========================

@app.post("/3dgut/start")
def start_3dgut(request: ThreeDGUTStartRequest):

    global THREEDGUT_PROCESS
    global THREEDGUT_LOGS

    try:

        # ---------------------------------
        # CHECK IF ALREADY RUNNING
        # ---------------------------------

        if (
            THREEDGUT_PROCESS is not None
            and THREEDGUT_PROCESS.poll() is None
        ):

            return {
                "status": "already_running",
                "message": "3DGUT training is already running",
                "pid": THREEDGUT_PROCESS.pid
            }

        # ---------------------------------
        # CHECK 3DGUT DIRECTORY
        # ---------------------------------

        if not os.path.isdir(THREEDGUT_DIR):

            raise HTTPException(
                status_code=500,
                detail=(
                    "3DGUT directory not found: "
                    + THREEDGUT_DIR
                )
            )

        # ---------------------------------
        # CHECK 3DGUT PYTHON
        # ---------------------------------

        if not os.path.isfile(THREEDGUT_PYTHON):

            raise HTTPException(
                status_code=500,
                detail=(
                    "3DGUT Python not found: "
                    + THREEDGUT_PYTHON
                )
            )

        # ---------------------------------
        # CHECK TRAIN.PY
        # ---------------------------------

        train_file = os.path.join(
            THREEDGUT_DIR,
            "train.py"
        )

        if not os.path.isfile(train_file):

            raise HTTPException(
                status_code=500,
                detail=(
                    "3DGUT train.py not found: "
                    + train_file
                )
            )

        # ---------------------------------
        # CLEAR PREVIOUS LOGS
        # ---------------------------------

        THREEDGUT_LOGS.clear()

        THREEDGUT_ERROR["message"] = None

        # ---------------------------------
        # BUILD TRAINING COMMAND
        # ---------------------------------

        command = [

            THREEDGUT_PYTHON,

            "train.py",

            "--config-name",
            "apps/colmap_3dgut_mcmc.yaml",

            f"path={request.path}",

            f"out_dir={request.out_dir}",

            f"experiment_name={request.experiment_name}"

        ]

        # ---------------------------------
        # PRINT COMMAND
        # ---------------------------------

        print()
        print("======================================")
        print("3DGUT TRAINING START")
        print("======================================")

        print("Working directory:")
        print(THREEDGUT_DIR)

        print()
        print("Python:")
        print(THREEDGUT_PYTHON)

        print()
        print("Command:")
        print(" ".join(command))

        print()
        print("Selected input path:")
        print(request.path)

        print()
        print("Selected output directory:")
        print(request.out_dir)

        print()
        print("Experiment name:")
        print(request.experiment_name)

        # ---------------------------------
        # CREATE ENVIRONMENT
        # ---------------------------------

        env = os.environ.copy()

        # Path to 3DGUT virtual environment
        venv_dir = os.path.join(
            THREEDGUT_DIR,
            ".venv"
        )

        # Path to .venv/bin
        venv_bin = os.path.join(
            venv_dir,
            "bin"
        )

        # ---------------------------------
        # VERIFY VENV
        # ---------------------------------

        if not os.path.isdir(venv_dir):

            raise HTTPException(
                status_code=500,
                detail=(
                    "3DGUT virtual environment not found: "
                    + venv_dir
                )
            )

        if not os.path.isdir(venv_bin):

            raise HTTPException(
                status_code=500,
                detail=(
                    "3DGUT .venv/bin not found: "
                    + venv_bin
                )
            )

        # ---------------------------------
        # SET VIRTUAL ENVIRONMENT
        # ---------------------------------

        env["VIRTUAL_ENV"] = venv_dir

        # Put .venv/bin FIRST
        env["PATH"] = (
            venv_bin
            + os.pathsep
            + env.get("PATH", "")
        )

        # Make Python output immediately
        env["PYTHONUNBUFFERED"] = "1"

        # ---------------------------------
        # PRINT ENVIRONMENT
        # ---------------------------------

        print()
        print("======================================")
        print("3DGUT ENVIRONMENT")
        print("======================================")

        print("VIRTUAL_ENV:")
        print(env["VIRTUAL_ENV"])

        print()
        print("PATH:")
        print(env["PATH"])

        # ---------------------------------
        # CHECK PYTHON
        # ---------------------------------

        print()
        print("Python executable:")
        print(THREEDGUT_PYTHON)

        # ---------------------------------
        # CHECK SLANGC
        # ---------------------------------

        slangc_path = shutil.which(
            "slangc",
            path=env["PATH"]
        )

        print()
        print("slangc:")
        print(slangc_path)

        # ---------------------------------
        # CHECK INPUT DATA
        # ---------------------------------

        input_path = request.path

        if not os.path.isabs(input_path):

            input_path = os.path.join(
                THREEDGUT_DIR,
                input_path
            )

        print()
        print("Resolved input path:")
        print(input_path)

        print(
            "Input exists:",
            os.path.exists(input_path)
        )

        # ---------------------------------
        # START 3DGUT
        # ---------------------------------

        print()
        print("======================================")
        print("STARTING 3DGUT PROCESS")
        print("======================================")

        THREEDGUT_PROCESS = subprocess.Popen(

            command,

            cwd=THREEDGUT_DIR,

            # IMPORTANT:
            # pass our .venv environment
            env=env,

            stdout=subprocess.PIPE,

            stderr=subprocess.STDOUT,

            text=True,

            bufsize=1

        )

        # ---------------------------------
        # START LOG READER
        # ---------------------------------

        threading.Thread(

            target=read_3dgut_output,

            args=(THREEDGUT_PROCESS,),

            daemon=True

        ).start()

        # ---------------------------------
        # RETURN TO FRONTEND
        # ---------------------------------

        print()
        print("3DGUT PROCESS STARTED")
        print("PID:", THREEDGUT_PROCESS.pid)

        print("======================================")
        print()

        return {

            "status": "started",

            "message": "3DGUT training started",

            "pid": THREEDGUT_PROCESS.pid,

            "python": THREEDGUT_PYTHON,

            "working_directory": THREEDGUT_DIR,

            "command": " ".join(command)

        }

    except HTTPException:

        raise

    except Exception as e:

        print()
        print("======================================")
        print("3DGUT START ERROR")
        print("======================================")
        print(str(e))
        print("======================================")

        THREEDGUT_ERROR["message"] = str(e)

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )

        
@app.get("/3dgut/status")
def get_3dgut_status():

    global THREEDGUT_PROCESS
    global THREEDGUT_LOGS

    if THREEDGUT_PROCESS is None:
        return {
            "running": False,
            "status": "not_running",
            "logs": THREEDGUT_LOGS,
        }

    return_code = THREEDGUT_PROCESS.poll()

    if return_code is None:
        return {
            "running": True,
            "status": "running",
            "pid": THREEDGUT_PROCESS.pid,
            "logs": THREEDGUT_LOGS,
        }

    if return_code == 0:
        return {
            "running": False,
            "status": "completed",
            "pid": THREEDGUT_PROCESS.pid,
            "return_code": return_code,
            "logs": THREEDGUT_LOGS,
        }

    return {
        "running": False,
        "status": "failed",
        "pid": THREEDGUT_PROCESS.pid,
        "return_code": return_code,
        "logs": THREEDGUT_LOGS,
    }

@app.get("/select-3dgut-output-folder")
def select_3dgut_output_folder():

    try:
        root = Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        root.update()

        folder = askdirectory(
            parent=root,
            title="Select 3DGUT Output Directory"
        )

        root.destroy()

        print("Selected 3DGUT output directory:", folder)

        return {
            "folder": folder
        }

    except Exception as e:

        print(
            "3DGUT output folder selection error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================
# 3DGUT EXPORT FORMAT
# =========================

class ThreeDGUTExportRequest(BaseModel):
    format: str
    # input_ply: str | None = None
    # output_directory: str | None = None
    output_dir: str 



    
@app.post("/3dgut/export-format")
def export_3dgut_format(request: ThreeDGUTExportRequest):
    import os
    import shutil
    import subprocess

    # -----------------------------------------
    # 1. FIXED INPUT PLY FILE
    # -----------------------------------------
    input_ply = "/home/adminusr/Desktop/khushi/export_last.ply"

    # -----------------------------------------
    # 2. OUTPUT FOLDER SELECTED IN THE UI
    # -----------------------------------------
    output_dir = os.path.abspath(
        os.path.expanduser(request.output_dir)
    )

    export_format = request.format.lower().strip()

    extension_map = {
        "spz": ".spz",
        "splat": ".splat",
        "sog": ".sog",
        "compressed_ply": ".compressed.ply",
        "glb": ".glb",
        "html": ".html",
    }

    print("\n========== 3DGUT EXPORT ==========")
    print("Input PLY:", input_ply)
    print("Input exists:", os.path.isfile(input_ply))
    print("Selected format:", export_format)
    print("Output directory:", output_dir)

    # -----------------------------------------
    # 3. VALIDATE INPUT AND FORMAT
    # -----------------------------------------
    if export_format not in extension_map:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported export format: {export_format}",
        )

    if not os.path.isfile(input_ply):
        raise HTTPException(
            status_code=404,
            detail=f"Input PLY file not found: {input_ply}",
        )

    if not input_ply.lower().endswith(".ply"):
        raise HTTPException(
            status_code=400,
            detail="Input file must be a .ply file.",
        )

    if not os.path.isdir(output_dir):
        raise HTTPException(
            status_code=400,
            detail=f"Output folder does not exist: {output_dir}",
        )

    # -----------------------------------------
    # 4. BUILD OUTPUT FILE PATH
    # -----------------------------------------
    base_name = os.path.splitext(
        os.path.basename(input_ply)
    )[0]

    output_file = os.path.join(
        output_dir,
        base_name + extension_map[export_format],
    )

    print("Output file:", output_file)

    # -----------------------------------------
    # 5. CONFIGURE 3DGUT ENVIRONMENT
    # -----------------------------------------
    three_dgut_root = "/home/adminusr/Shashank/3DGUT/3dgrut"

    env = os.environ.copy()
    env["PATH"] = (
        os.path.join(three_dgut_root, ".venv", "bin")
        + os.pathsep
        + env.get("PATH", "")
    )

    # -----------------------------------------
    # 6. BUILD CONVERTER COMMAND
    # -----------------------------------------
    if export_format == "spz":
        # hardcoding the spz path to test directlty
        converter = "/home/adminusr/Shashank/results/3dgut_mcmc/DEMO-1509_083650/spz/build/ply_to_spz"
        # converter = os.path.join(
        #     three_dgut_root,
        #     "spz",
        #     "build",
        #     "ply_to_spz",
        # )

        if not os.path.isfile(converter):
            raise HTTPException(
                status_code=500,
                detail=f"SPZ converter not found: {converter}",
            )

        command = [converter, input_ply, output_file]

    else:
        converter = shutil.which(
            "splat-transform",
            path=env["PATH"],
        )

        if not converter:
            raise HTTPException(
                status_code=500,
                detail=(
                    "splat-transform was not found in the "
                    "3DGUT virtual environment."
                ),
            )

        command = [converter, input_ply, output_file]

    print("Command:", command)

    # -----------------------------------------
    # 7. RUN EXPORT
    # -----------------------------------------
    try:
        result = subprocess.run(
            command,
            cwd=three_dgut_root,
            env=env,
            capture_output=True,
            text=True,
            timeout=600,
        )

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Export timed out after 10 minutes.",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not run exporter: {str(exc)}",
        )

    print("Return code:", result.returncode)
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)

    # -----------------------------------------
    # 8. CHECK EXPORT RESULT
    # -----------------------------------------
    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Export converter failed.",
                "format": export_format,
                "stdout": result.stdout,
                "stderr": result.stderr,
            },
        )

    if not os.path.isfile(output_file):
        raise HTTPException(
            status_code=500,
            detail=(
                "Converter completed but output file was not found: "
                + output_file
            ),
        )

    # -----------------------------------------
    # 9. RETURN SUCCESS TO UI
    # -----------------------------------------
    print("Export successful:", output_file)
    print("==================================\n")

    return {
        "success": True,
        "format": export_format,
        "input_file": input_ply,
        "output_file": output_file,
        "message": (
            f"{export_format.upper()} export completed successfully."
        ),
        "logs": result.stdout,
    }

# =========================
# 3DGUT STOP TRAINING
# =========================

@app.post("/3dgut/stop")
def stop_3dgut():

    global THREEDGUT_PROCESS
    global THREEDGUT_LOGS

    try:

        # ---------------------------------
        # No training process exists
        # ---------------------------------

        if THREEDGUT_PROCESS is None:

            return {
                "status": "not_running",
                "message": "3DGUT training is not running"
            }


        # ---------------------------------
        # Training already finished
        # ---------------------------------

        if THREEDGUT_PROCESS.poll() is not None:

            THREEDGUT_PROCESS = None

            return {
                "status": "not_running",
                "message": "3DGUT training has already stopped"
            }


        # ---------------------------------
        # Training is currently running
        # ---------------------------------

        print()

        print("======================================")
        print("STOPPING 3DGUT TRAINING")
        print("PID:", THREEDGUT_PROCESS.pid)
        print("======================================")


        # ---------------------------------
        # Stop the process
        # ---------------------------------

        THREEDGUT_PROCESS.terminate()


        try:

            # Give process time to exit normally
            THREEDGUT_PROCESS.wait(
                timeout=10
            )

        except subprocess.TimeoutExpired:

            print(
                "3DGUT did not stop gracefully."
            )

            print(
                "Force killing process..."
            )

            THREEDGUT_PROCESS.kill()

            THREEDGUT_PROCESS.wait()


        # ---------------------------------
        # Add message to terminal logs
        # ---------------------------------

        print(
            "3DGUT TRAINING STOPPED"
        )

        THREEDGUT_LOGS.append(
            "======================================"
        )

        THREEDGUT_LOGS.append(
            "3DGUT TRAINING STOPPED BY USER"
        )

        THREEDGUT_LOGS.append(
            "======================================"
        )


        # ---------------------------------
        # Clear process
        # ---------------------------------

        THREEDGUT_PROCESS = None


        return {
            "status": "stopped",
            "message": "3DGUT training stopped"
        }


    except Exception as e:

        print(
            "3DGUT STOP ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# =========================
# ISAAC SIM - START ON DEMAND
# =========================

def isaac_service_ready():
    """Check whether Isaac's scene-loader port is accepting connections."""
    try:
        with socket.create_connection(
            ("127.0.0.1", 8765),
            timeout=1
        ):
            return True
    except OSError:
        return False


def start_isaac_if_needed():
    """Start Isaac Sim only when requested and not already running."""
    global ISAAC_PROCESS

    # Reuse an existing Isaac scene-loader service.
    if isaac_service_ready():
        return

    # Avoid starting another process if Isaac is already starting.
    if ISAAC_PROCESS is not None and ISAAC_PROCESS.poll() is None:
        return

    kit_executable = os.path.join(
        ISAAC_ROOT, "kit", "kit"
    )

    extension_config = os.path.join(
        ISAAC_EXTENSION_FOLDER,
        "nurec.scene_loader",
        "extension.toml"
    )

    required_paths = [
        kit_executable,
        ISAAC_EXPERIENCE,
        extension_config
    ]

    for path in required_paths:
        if not os.path.exists(path):
            raise HTTPException(
                status_code=500,
                detail=f"Required Isaac Sim file not found: {path}"
            )

    print("Starting Isaac Sim on demand...")

    try:
        with open(ISAAC_LOG_FILE, "a", buffering=1) as log_file:
            ISAAC_PROCESS = subprocess.Popen(
                [
                    kit_executable,
                    ISAAC_EXPERIENCE,
                    "--ext-folder",
                    ISAAC_EXTENSION_FOLDER,
                    "--enable",
                    "nurec.scene_loader"
                ],
                cwd=ISAAC_ROOT,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                start_new_session=True
            )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not start Isaac Sim: {exc}"
        )


@app.post("/isaac/load-scene")
def load_isaac_scene():
    """Start Isaac if needed, then ask it to load the scene."""

    with ISAAC_LOCK:
        start_isaac_if_needed()

        # Wait up to 180 seconds for the service port.
        deadline = time.monotonic() + 180

        while not isaac_service_ready():

            if (
                ISAAC_PROCESS is not None
                and ISAAC_PROCESS.poll() is not None
            ):
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Isaac Sim exited during startup. "
                        f"Check the log: {ISAAC_LOG_FILE}"
                    )
                )

            if time.monotonic() >= deadline:
                raise HTTPException(
                    status_code=504,
                    detail=(
                        "Isaac Sim did not start its scene-loader service "
                        f"within 180 seconds. Check: {ISAAC_LOG_FILE}"
                    )
                )

            time.sleep(1)

        # Ask the running Isaac extension to load the scene.
        url = "http://127.0.0.1:8765/load-scene"

        request = urllib.request.Request(
            url,
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=190
            ) as response:
                result = json.loads(
                    response.read().decode("utf-8")
                )

                return {
                    "status": "success",
                    "message": "Isaac Sim scene-load request completed",
                    "result": result
                }

        except urllib.error.HTTPError as exc:
            message = exc.read().decode(
                "utf-8",
                errors="replace"
            )

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Isaac scene loader returned HTTP {exc.code}: "
                    f"{message}"
                )
            )

        except urllib.error.URLError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Could not contact Isaac scene loader: {exc}"
            )

        except TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Timed out while waiting for the scene to load."
            )