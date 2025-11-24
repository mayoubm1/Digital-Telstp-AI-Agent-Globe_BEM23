import hashlib
import os
from pathlib import Path
from collections import defaultdict

class DuplicateExtractor:
    def __init__(self, base_directory="./ai_data"):
        self.base_directory = Path(base_directory)
        
    def calculate_file_hash(self, file_path):
        """Calculate MD5 hash of a file"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            print(f"Error hashing {file_path}: {e}")
            return None
            
    def find_duplicates(self, directory=None):
        """Find duplicate files by hash"""
        if not directory:
            directory = self.base_directory
            
        directory_path = Path(directory)
        if not directory_path.exists():
            return {"status": "error", "message": "Directory not found"}
            
        file_hashes = defaultdict(list)
        
        # Calculate hashes for all files
        for file_path in directory_path.rglob("*"):
            if file_path.is_file():
                file_hash = self.calculate_file_hash(file_path)
                if file_hash:
                    file_hashes[file_hash].append(str(file_path))
                    
        # Find duplicates
        duplicates = {hash_val: paths for hash_val, paths in file_hashes.items() if len(paths) > 1}
        
        return {
            "status": "success",
            "duplicates": duplicates,
            "count": len(duplicates)
        }
        
    def extract_duplicates(self, target_directory=None):
        """Extract duplicates to a separate directory"""
        if not target_directory:
            target_directory = self.base_directory / "duplicates"
            
        target_path = Path(target_directory)
        target_path.mkdir(exist_ok=True)
        
        duplicates_result = self.find_duplicates()
        if duplicates_result["status"] == "error":
            return duplicates_result
            
        extracted_count = 0
        for hash_val, file_paths in duplicates_result["duplicates"].items():
            # Keep the first file, move others to duplicates folder
            for duplicate_path in file_paths[1:]:
                try:
                    source = Path(duplicate_path)
                    target = target_path / f"{hash_val}_{source.name}"
                    source.rename(target)
                    extracted_count += 1
                except Exception as e:
                    print(f"Error extracting {duplicate_path}: {e}")
                    
        return {
            "status": "success",
            "message": f"Extracted {extracted_count} duplicate files",
            "count": extracted_count
        }

def extract_duplicates():
    """Main function for duplicate extraction"""
    extractor = DuplicateExtractor()
    return extractor.extract_duplicates()
