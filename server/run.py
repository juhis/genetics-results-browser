#!/usr/bin/env python3

import sys
import argparse
from typing import Any
import gunicorn.app.base  # type: ignore
from server import app

# import multiprocessing as mp
# mp.set_start_method('spawn')


# This is badly typed and I don't find stubs for gunicorn
def run_gunicorn(app: Any, args: Any) -> None:
    print("Running gunicorn")

    class StandaloneGunicornApplication(gunicorn.app.base.BaseApplication):  # type: ignore
        # from <http://docs.gunicorn.org/en/stable/custom.html>
        def __init__(self, app: Any, opts: Any = None) -> None:
            self.application = app
            self.options = opts or {}
            super().__init__()

        def load_config(self) -> None:
            for key, val in self.options.items():
                self.cfg.set(key, val)

        def load(self) -> Any:
            return self.application

    options = {
        "bind": "{}:{}".format(args.host, args.port),
        "reload": False,
        "workers": args.num_workers,
        "accesslog": args.accesslog,
        "access_log_format": '%(t)s | %(s)s | %(L)ss | %(m)s %(U)s | resp_len:%(B)s | referrer:"%(f)s" | ip:%(h)s | agent:%(a)s',
        "loglevel": args.loglevel,
        "timeout": 300,
        "worker_class": "sync",
    }
    sga = StandaloneGunicornApplication(app, options)
    sga.run()


def run(argv: Any) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--host", default="0.0.0.0", help="the hostname to use to access this server"
    )
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument(
        "--accesslog", default="-", help="the file to write the access log"
    )
    parser.add_argument("--loglevel", default="info", help="log level")
    parser.add_argument(
        "--num-workers", type=int, default=4, help="number of worker threads"
    )
    args = parser.parse_args(argv)

    if args.host != "0.0.0.0":
        print("http://{}:{}".format(args.host, args.port))

    run_gunicorn(app, args)


if __name__ == "__main__":
    run(sys.argv[1:])
