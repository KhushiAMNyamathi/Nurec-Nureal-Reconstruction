import asyncio
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import omni.ext
import omni.kit.app
import omni.usd


USDZ_PATH = (
    "/home/adminusr/Shashank/results/3dgut_mcmc/"
    "DEMO-1509_083650/export_last_lightfield.usdz"
)

HOST = "127.0.0.1"
PORT = 8765


class NuRecSceneLoaderExtension(omni.ext.IExt):

    def on_startup(self, ext_id):
        self._lock = threading.Lock()
        self._pending = None
        self._loading = False

        extension = self

        class Handler(BaseHTTPRequestHandler):

            def log_message(self, fmt, *args):
                print("[NuRec HTTP] " + (fmt % args))

            def _send(self, status, data):
                body = json.dumps(data).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_POST(self):
                if self.path != "/load-scene":
                    self._send(404, {"ok": False, "error": "Not found"})
                    return

                if not os.path.isfile(USDZ_PATH):
                    self._send(404, {
                        "ok": False,
                        "error": f"USDZ file not found: {USDZ_PATH}",
                    })
                    return

                with extension._lock:
                    if extension._pending is not None or extension._loading:
                        self._send(409, {
                            "ok": False,
                            "error": "A scene load is already in progress",
                        })
                        return

                    done = threading.Event()
                    result = {}
                    extension._pending = (done, result)

                print("[NuRec] Received request to load USDZ")

                if not done.wait(timeout=180):
                    with extension._lock:
                        if extension._pending == (done, result):
                            extension._pending = None

                    self._send(504, {
                        "ok": False,
                        "error": "Timed out waiting for Isaac Sim to load the scene",
                    })
                    return

                self._send(200 if result.get("ok") else 500, result)

        self._server = ThreadingHTTPServer((HOST, PORT), Handler)
        self._server.daemon_threads = True

        self._server_thread = threading.Thread(
            target=self._server.serve_forever,
            daemon=True,
        )
        self._server_thread.start()

        self._update_subscription = (
            omni.kit.app.get_app()
            .get_update_event_stream()
            .create_subscription_to_pop(self._on_update)
        )

        print(f"[NuRec] Scene loader listening on http://{HOST}:{PORT}")
        print(f"[NuRec] USDZ path: {USDZ_PATH}")

    def _on_update(self, event):
        with self._lock:
            if self._pending is None or self._loading:
                return

            self._loading = True
            done, result = self._pending

        asyncio.ensure_future(self._open_scene(done, result))

    async def _open_scene(self, done, result):
        try:
            print(f"[NuRec] Opening USDZ: {USDZ_PATH}")

            success = await omni.usd.get_context().open_stage_async(USDZ_PATH)

            if success:
                result.update({
                    "ok": True,
                    "message": "3DGUT scene loaded",
                    "path": USDZ_PATH,
                })
                print("[NuRec] SUCCESS: USDZ scene loaded")
            else:
                result.update({
                    "ok": False,
                    "error": "Isaac Sim could not open the USDZ scene",
                })
                print("[NuRec] ERROR: Isaac Sim could not open the USDZ")

        except Exception as exc:
            result.update({"ok": False, "error": str(exc)})
            print(f"[NuRec] ERROR loading USDZ: {exc}")

        finally:
            with self._lock:
                self._pending = None
                self._loading = False
            done.set()

    def on_shutdown(self):
        server = getattr(self, "_server", None)

        if server is not None:
            server.shutdown()
            server.server_close()

        self._update_subscription = None
        print("[NuRec] Scene loader stopped")
