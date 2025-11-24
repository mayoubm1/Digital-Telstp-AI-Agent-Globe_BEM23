import boto3
import os
from pathlib import Path
from botocore.exceptions import ClientError

class FileUploader:
    def __init__(self, base_directory="./ai_data"):
        self.base_directory = Path(base_directory)
        self.s3_client = None
        
    def initialize_s3(self, aws_access_key=None, aws_secret_key=None, bucket_name=None):
        """Initialize S3 client"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key or os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=aws_secret_key or os.getenv('AWS_SECRET_ACCESS_KEY')
            )
            self.bucket_name = bucket_name or os.getenv('S3_BUCKET_NAME', 'ai-assistant-storage')
            return True
        except Exception as e:
            print(f"Error initializing S3: {e}")
            return False
            
    def upload_file_to_s3(self, file_path, s3_key=None):
        """Upload a single file to S3"""
        if not self.s3_client:
            return {"status": "error", "message": "S3 not initialized"}
            
        if not s3_key:
            s3_key = Path(file_path).name
            
        try:
            self.s3_client.upload_file(str(file_path), self.bucket_name, s3_key)
            return {"status": "success", "s3_key": s3_key}
        except ClientError as e:
            return {"status": "error", "message": str(e)}
            
    def upload_directory(self, directory=None, clear_after_upload=True):
        """Upload entire directory to S3"""
        if not directory:
            directory = self.base_directory / "organized"
            
        directory_path = Path(directory)
        if not directory_path.exists():
            return {"status": "error", "message": "Directory not found"}
            
        if not self.initialize_s3():
            return {"status": "error", "message": "Failed to initialize S3"}
            
        uploaded_count = 0
        failed_count = 0
        
        for file_path in directory_path.rglob("*"):
            if file_path.is_file():
                # Create S3 key preserving directory structure
                relative_path = file_path.relative_to(directory_path)
                s3_key = str(relative_path).replace("\\", "/")
                
                result = self.upload_file_to_s3(file_path, s3_key)
                if result["status"] == "success":
                    uploaded_count += 1
                    if clear_after_upload:
                        try:
                            file_path.unlink()  # Delete local file
                        except Exception as e:
                            print(f"Error deleting {file_path}: {e}")
                else:
                    failed_count += 1
                    print(f"Failed to upload {file_path}: {result['message']}")
                    
        return {
            "status": "success",
            "uploaded": uploaded_count,
            "failed": failed_count,
            "message": f"Uploaded {uploaded_count} files, {failed_count} failed"
        }

def upload_files():
    """Main function for file uploading"""
    uploader = FileUploader()
    return uploader.upload_directory()
