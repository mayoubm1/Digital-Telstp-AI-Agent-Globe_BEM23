import os
import shutil
from pathlib import Path
import filetype
from datetime import datetime

class FileOrganizer:
    def __init__(self, base_directory="./ai_data"):
        self.base_directory = Path(base_directory)
        self.base_directory.mkdir(exist_ok=True)
        
    def organize_files(self, source_directory=None):
        """Organize files by type and date"""
        if not source_directory:
            source_directory = self.base_directory / "uploads"
            
        source_path = Path(source_directory)
        if not source_path.exists():
            return {"status": "error", "message": "Source directory not found"}
            
        organized_count = 0
        
        for file_path in source_path.rglob("*"):
            if file_path.is_file():
                try:
                    # Determine file type
                    kind = filetype.guess(str(file_path))
                    file_type = kind.extension if kind else "unknown"
                    
                    # Create organized directory structure
                    date_folder = datetime.now().strftime("%Y-%m")
                    target_dir = self.base_directory / "organized" / file_type / date_folder
                    target_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Move file
                    target_path = target_dir / file_path.name
                    shutil.move(str(file_path), str(target_path))
                    organized_count += 1
                    
                except Exception as e:
                    print(f"Error organizing {file_path}: {e}")
                    
        return {
            "status": "success", 
            "message": f"Organized {organized_count} files",
            "count": organized_count
        }

def organize_files():
    """Main function for file organization"""
    organizer = FileOrganizer()
    return organizer.organize_files()
