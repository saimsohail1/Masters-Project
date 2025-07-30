import os
from fastapi import UploadFile
import shutil

def save_upload_file(upload_file: UploadFile, dest_folder: str) -> str:
    file_path = os.path.join(dest_folder, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path
