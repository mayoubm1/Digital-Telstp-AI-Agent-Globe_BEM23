import datetime
import speech_recognition as sr
from gtts import gTTS
import os
import playsound
import psutil
import shutil
import subprocess
import sqlite3
from pathlib import Path
import json
from typing import Dict, List, Optional
import logging

class VoiceAssistant:
    def __init__(self):
        self.setup_logging()
        self.setup_database()
        self.user_preferences = self.load_preferences()
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('assistant.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_database(self):
        """Initialize SQLite database for user data and preferences"""
        self.conn = sqlite3.connect('assistant_data.db')
        cursor = self.conn.cursor()
        
        # Create tables for user interactions and preferences
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_commands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                command TEXT,
                response TEXT,
                success BOOLEAN
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_access (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                file_path TEXT,
                action TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')
        
        self.conn.commit()
    
    def listen(self) -> str:
        """Phase 1: Voice recognition function"""
        r = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening...")
            self.logger.info("Listening for voice input")
            r.adjust_for_ambient_noise(source)
            audio = r.listen(source, timeout=5, phrase_time_limit=10)
        
        try:
            text = r.recognize_google(audio)
            print(f"You said: {text}")
            self.logger.info(f"Voice input recognized: {text}")
            return text
        except sr.UnknownValueError:
            self.logger.warning("Could not understand audio")
            return ""
        except sr.RequestError as e:
            self.logger.error(f"Speech recognition error: {e}")
            return ""
    
    def speak(self, text: str, lang: str = 'en'):
        """Phase 1: Text to speech function with language support"""
        try:
            tts = gTTS(text=text, lang=lang)
            tts.save("output.mp3")
            playsound.playsound("output.mp3")
            os.remove("output.mp3")
            self.logger.info(f"Spoke: {text}")
        except Exception as e:
            self.logger.error(f"Speech synthesis error: {e}")
    
    def browse_files(self, directory: str = None) -> List[str]:
        """Phase 2: File browsing functionality"""
        if not directory:
            directory = os.path.expanduser("~")
        
        try:
            files = []
            for item in os.listdir(directory):
                item_path = os.path.join(directory, item)
                if os.path.isfile(item_path):
                    size = os.path.getsize(item_path)
                    files.append(f"File: {item} ({size} bytes)")
                else:
                    files.append(f"Folder: {item}")
            
            # Log file access
            cursor = self.conn.cursor()
            cursor.execute("INSERT INTO file_access (file_path, action) VALUES (?, ?)", 
                         (directory, "browse"))
            self.conn.commit()
            
            return files[:10]  # Return first 10 items
        except Exception as e:
            self.logger.error(f"File browsing error: {e}")
            return []
    
    def get_free_space(self, path: str = "/") -> str:
        """Phase 2: Get disk space information"""
        try:
            total, used, free = shutil.disk_usage(path)
            return f"Free space: {free // (2**30)} GB, Total: {total // (2**30)} GB"
        except Exception as e:
            self.logger.error(f"Disk space error: {e}")
            return "Could not retrieve disk space information"
    
    def delete_file(self, file_path: str) -> bool:
        """Phase 2: File deletion with confirmation"""
        try:
            if os.path.exists(file_path):
                # Log the deletion attempt
                cursor = self.conn.cursor()
                cursor.execute("INSERT INTO file_access (file_path, action) VALUES (?, ?)", 
                             (file_path, "delete"))
                self.conn.commit()
                
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            self.logger.error(f"File deletion error: {e}")
            return False
    
    def get_battery_percentage(self) -> str:
        """Phase 3: Battery status"""
        try:
            battery = psutil.sensors_battery()
            if battery:
                return f"Battery: {battery.percent}% ({'Charging' if battery.power_plugged else 'Not charging'})"
            return "Battery information not available"
        except Exception as e:
            self.logger.error(f"Battery status error: {e}")
            return "Could not retrieve battery status"
    
    def get_cpu_usage(self) -> str:
        """Phase 3: CPU usage information"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            return f"CPU usage: {cpu_percent}%"
        except Exception as e:
            self.logger.error(f"CPU usage error: {e}")
            return "Could not retrieve CPU usage"
    
    def search_web(self, query: str) -> str:
        """Phase 3: Web search placeholder"""
        # This would integrate with your existing knowledge API
        return f"Searching for: {query} (Integration with knowledge API needed)"
    
    def log_command(self, command: str, response: str, success: bool):
        """Phase 4: Log user interactions for learning"""
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO user_commands (command, response, success) VALUES (?, ?, ?)",
            (command, response, success)
        )
        self.conn.commit()
    
    def load_preferences(self) -> Dict:
        """Phase 4: Load user preferences"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT key, value FROM user_preferences")
        return dict(cursor.fetchall())
    
    def save_preference(self, key: str, value: str):
        """Phase 4: Save user preference"""
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)",
            (key, value)
        )
        self.conn.commit()
    
    def chatbot(self):
        """Main chatbot loop integrating all phases"""
        self.speak("AI Assistant activated. How can I help you?")
        
        while True:
            try:
                command = self.listen().lower()
                if not command:
                    continue
                
                response = ""
                success = True
                
                # Phase 1: Basic commands
                if "hello" in command or "hi" in command:
                    response = "Hello! How can I help you today?"
                    self.speak(response)
                
                elif "time" in command:
                    now = datetime.datetime.now()
                    response = f"The time is {now.strftime('%H:%M')}"
                    self.speak(response)
                
                elif "date" in command:
                    today = datetime.date.today()
                    response = f"Today is {today.strftime('%B %d, %Y')}"
                    self.speak(response)
                
                # Phase 2: File management
                elif "browse files" in command or "list files" in command:
                    files = self.browse_files()
                    response = f"Found {len(files)} items: " + ", ".join(files[:3])
                    self.speak(response)
                
                elif "disk space" in command or "free space" in command:
                    response = self.get_free_space()
                    self.speak(response)
                
                # Phase 3: System information
                elif "battery" in command:
                    response = self.get_battery_percentage()
                    self.speak(response)
                
                elif "cpu" in command or "processor" in command:
                    response = self.get_cpu_usage()
                    self.speak(response)
                
                elif "search" in command:
                    query = command.replace("search", "").strip()
                    response = self.search_web(query)
                    self.speak(response)
                
                # Exit command
                elif "exit" in command or "goodbye" in command or "quit" in command:
                    response = "Goodbye! Have a great day!"
                    self.speak(response)
                    break
                
                else:
                    response = "I'm sorry, I didn't understand that. Please try again."
                    self.speak(response)
                    success = False
                
                # Phase 4: Log interaction
                self.log_command(command, response, success)
                
            except KeyboardInterrupt:
                self.speak("Assistant shutting down. Goodbye!")
                break
            except Exception as e:
                self.logger.error(f"Chatbot error: {e}")
                self.speak("I encountered an error. Please try again.")

if __name__ == "__main__":
    assistant = VoiceAssistant()
    assistant.chatbot()
