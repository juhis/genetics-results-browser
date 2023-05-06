from typing import Optional
from google.cloud import storage  # type: ignore
import google.cloud.exceptions


class CloudStorage:
    def __init__(self) -> None:
        # Uses "GOOGLE_APPLICATION_CREDENTIALS" environment variable
        # or metadata server in GCP to get service account key
        self.client: storage.Client = storage.Client()

    def read_bytes(self, bucket_name: str, file: str) -> Optional[bytes]:
        try:
            bucket: storage.Bucket = self.client.bucket(bucket_name)
            blob: storage.Blob = bucket.blob(file)
            data: bytes = blob.download_as_bytes()
        except google.cloud.exceptions.NotFound:
            return None

        return data
