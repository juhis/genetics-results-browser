from typing import Any, Dict


class Singleton(type):
    _instances: Dict["Singleton", Any] = {}

    def __call__(cls: "Singleton", *args: str, **kwargs: dict[str, Any]) -> Any:
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]
