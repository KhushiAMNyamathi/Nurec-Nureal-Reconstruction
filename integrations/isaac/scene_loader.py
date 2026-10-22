
import asyncio
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import omni.ext
import omni.usd


USDZ_PATH = (
    "/home/adminusr/Shashank/results/3dgut_mcmc/"
    "DEMO-1509_083650/export_last_lightfield.usdz"
)

HOST = "127.0.0.1"
PORT = 8765


class NuRecSceneLoaderExtension(omni.ext.IExt):

    def on_startup(self, ext_id):
        self._pending = None
        self._lock = threading.Lock()
        extension = self

        class Handler(BaseHTTPRequestHandler):

            def log_message(self, fmt, *args):
                print("[NuRec Scene Loader]", fmt % args)

            def do_POST(self):
                if self.path != "/load-scene":
                    self._send(404, {"error": "Not found"})
                    return

                if not os.path.isfile(USDZ_PATH):
                    self._send(404, {"error": "USDZ file not found"})
                    return

                with extension._lock:
                    if extension._pending is not None:
                        self._send(409, {"error": "A scene load is already pending"})
                        return

                    done = threading.Event()
                    result = {}
                    extension._pending = (done, result)

                if not done.wait(timeout=180):
                    self._send(504, {"error": "Scene loading timed out"})
                    return

                self._send(
                    200 if result.get("ok") else 500,
                    result
                )

            def _send(self, status, data):
                body = json.dumps(data).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        self._server = ThreadingHTTPServer((HOST, PORT), Handler)
        self._thread = threading.Thread(
            target=self._server.serve_forever,
            daemon=True
        )
        self._thread.start()

        self._subscription = (
            omni.kit.app.get_app()
            .get_update_event_stream()
            .create_subscription_to_pop(self._on_update)
        )

        print(f"[NuRec] Scene loader listening on {HOST}:{PORT}")

    def _on_update(self, event):
        with self._lock:
            pending = self._pending

        if pending is None:
            return

        done, result = pending

        async def open_scene():
            try:
                print(f"[NuRec] Opening USDZ: {USDZ_PATH}")
                success = await omni.usd.get_context().open_stage_async(
                    USDZ_PATH
                )
                result["ok"] = bool(success)
                if success:
                    result["message"] = "3DGUT scene loaded"
                    result["path"] = USDZ_PATH
                else:
                    result["error"] = "Isaac Sim failed to open the USDZ"
            except Exception as exc:
                result.update({"ok": False, "error": str(exc)})
            finally:
                with self._lock:
                    self._pending = None
                done.set()

        with self._lock:
            self._pending = None

        asyncio.ensure_future(open_scene())

    def on_shutdown(self):
        if getattr(self, "_server", None):
            self._server.shutdown()
            self._server.server_close()

        self._subscription = None
        print("[NuRec] Scene loader stopped")