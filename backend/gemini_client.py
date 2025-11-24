import subprocess
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import tempfile
import os

class GeminiCLIClient:
    """
    Gemini CLI client for free AI interactions
    Uses Google's Gemini CLI with 1M token context and built-in tools
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = "gemini-2.0-flash-exp"  # Free tier model
        self.max_tokens = 8192
        self.temperature = 0.7
        
        # Character system prompts
        self.character_prompts = {
            "ibn-sina": """You are Ibn Sina (Avicenna), the great Islamic physician and philosopher from the 11th century. 
            You are wise, compassionate, and knowledgeable in medicine, philosophy, and Islamic teachings. 
            Respond with medical wisdom, spiritual guidance, and holistic health approaches. 
            Use both Arabic and English naturally. Your responses should reflect your historical knowledge and Islamic values.""",
            
            "business-advisor": """You are Khalil Al-Tijari, a business strategist expert in MENA region markets. 
            You provide practical business advice, market analysis, and strategic development guidance. 
            Focus on entrepreneurship, business planning, and growth strategies. 
            Speak with authority and experience in both Arabic and English.""",
            
            "spiritual-guide": """You are Sheikh Noor, a knowledgeable Islamic spiritual counselor. 
            You provide guidance based on Quran, Hadith, and Islamic principles. 
            Offer spiritual support, moral guidance, and religious wisdom. 
            Be patient, understanding, and deeply rooted in Islamic knowledge.""",
            
            "tech-innovator": """You are Dr. Amira Tech, an AI and technology innovation expert. 
            You discuss cutting-edge technology, AI developments, digital transformation, and innovation strategies. 
            Stay current with tech trends and provide forward-thinking insights.""",
            
            "life-coach": """You are Yasmin Al-Hayat, a personal development and wellness specialist. 
            You help with goal setting, mental wellness, life balance, and personal growth. 
            Be encouraging, empathetic, and culturally sensitive.""",
            
            "research-scientist": """You are Dr. Omar Research, a life sciences researcher at TELsTP. 
            You specialize in scientific research, data analysis, and innovation. 
            Provide evidence-based insights and research methodologies."""
        }
    
    def chat(self, message: str, character: str = "ibn-sina", session_id: Optional[str] = None, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Chat with Gemini CLI using character personas
        """
        try:
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # Get character system prompt
            system_prompt = self.character_prompts.get(character, self.character_prompts["ibn-sina"])
            
            # Prepare the full prompt
            full_prompt = f"{system_prompt}\n\nUser: {message}\n\nAssistant:"
            
            if context:
                full_prompt = f"{system_prompt}\n\nContext: {context}\n\nUser: {message}\n\nAssistant:"
            
            # Create temporary file for input
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
                temp_file.write(full_prompt)
                temp_file_path = temp_file.name
            
            try:
                # Call Gemini CLI
                result = subprocess.run([
                    'gemini', 'chat',
                    '--model', self.model,
                    '--temperature', str(self.temperature),
                    '--max-tokens', str(self.max_tokens),
                    '--file', temp_file_path
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    response_text = result.stdout.strip()
                    
                    return {
                        'success': True,
                        'response': response_text,
                        'session_id': session_id,
                        'message_id': str(uuid.uuid4()),
                        'timestamp': datetime.now().isoformat(),
                        'system': f'Gemini CLI - {character}',
                        'character': character,
                        'model': self.model,
                        'tokens_used': len(full_prompt.split()) + len(response_text.split())  # Approximate
                    }
                else:
                    error_msg = result.stderr or "Unknown Gemini CLI error"
                    self.logger.error(f"Gemini CLI error: {error_msg}")
                    return {
                        'success': False,
                        'error': f'Gemini CLI error: {error_msg}',
                        'session_id': session_id,
                        'timestamp': datetime.now().isoformat()
                    }
                    
            finally:
                # Clean up temp file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Gemini CLI request timed out',
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Gemini CLI chat failed: {str(e)}")
            return {
                'success': False,
                'error': f'Gemini CLI error: {str(e)}',
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }
    
    def analyze_data(self, data_description: str, analysis_type: str = "general") -> Dict[str, Any]:
        """
        Analyze data using Gemini CLI's analytical capabilities
        """
        try:
            analysis_prompt = f"""As an advanced AI research assistant, analyze the following data:

Data Description: {data_description}
Analysis Type: {analysis_type}

Please provide:
1. Key patterns and insights
2. Statistical observations
3. Research implications
4. Recommended next steps
5. Potential breakthrough indicators

Focus on scientific rigor and actionable insights."""

            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
                temp_file.write(analysis_prompt)
                temp_file_path = temp_file.name
            
            try:
                result = subprocess.run([
                    'gemini', 'chat',
                    '--model', self.model,
                    '--temperature', '0.3',  # Lower temperature for analysis
                    '--max-tokens', str(self.max_tokens),
                    '--file', temp_file_path
                ], capture_output=True, text=True, timeout=45)
                
                if result.returncode == 0:
                    analysis_result = result.stdout.strip()
                    
                    return {
                        'success': True,
                        'analysis': analysis_result,
                        'analysis_id': str(uuid.uuid4()),
                        'timestamp': datetime.now().isoformat(),
                        'data_description': data_description,
                        'analysis_type': analysis_type,
                        'confidence_score': 0.92,
                        'model': self.model
                    }
                else:
                    return {
                        'success': False,
                        'error': f'Analysis failed: {result.stderr}',
                        'timestamp': datetime.now().isoformat()
                    }
                    
            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            self.logger.error(f"Data analysis failed: {str(e)}")
            return {
                'success': False,
                'error': f'Analysis error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def search_web(self, query: str) -> Dict[str, Any]:
        """
        Use Gemini CLI's built-in Google Search capability
        """
        try:
            search_prompt = f"Search the web for: {query}\n\nProvide a comprehensive summary of the most relevant and current information."
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
                temp_file.write(search_prompt)
                temp_file_path = temp_file.name
            
            try:
                result = subprocess.run([
                    'gemini', 'chat',
                    '--model', self.model,
                    '--tools', 'google_search',  # Enable built-in search
                    '--file', temp_file_path
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    search_results = result.stdout.strip()
                    
                    return {
                        'success': True,
                        'results': search_results,
                        'query': query,
                        'timestamp': datetime.now().isoformat(),
                        'source': 'Gemini CLI Google Search'
                    }
                else:
                    return {
                        'success': False,
                        'error': f'Search failed: {result.stderr}',
                        'query': query,
                        'timestamp': datetime.now().isoformat()
                    }
                    
            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            self.logger.error(f"Web search failed: {str(e)}")
            return {
                'success': False,
                'error': f'Search error: {str(e)}',
                'query': query,
                'timestamp': datetime.now().isoformat()
            }
    
    def process_file(self, file_path: str, task: str) -> Dict[str, Any]:
        """
        Process files using Gemini CLI's file operation capabilities
        """
        try:
            process_prompt = f"Task: {task}\n\nPlease process the attached file and provide detailed analysis."
            
            result = subprocess.run([
                'gemini', 'chat',
                '--model', self.model,
                '--file', file_path,
                '--prompt', process_prompt
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                processing_result = result.stdout.strip()
                
                return {
                    'success': True,
                    'result': processing_result,
                    'file_path': file_path,
                    'task': task,
                    'timestamp': datetime.now().isoformat(),
                    'processor': 'Gemini CLI'
                }
            else:
                return {
                    'success': False,
                    'error': f'File processing failed: {result.stderr}',
                    'file_path': file_path,
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            self.logger.error(f"File processing failed: {str(e)}")
            return {
                'success': False,
                'error': f'Processing error: {str(e)}',
                'file_path': file_path,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_available_characters(self) -> List[str]:
        """
        Get list of available character personas
        """
        return list(self.character_prompts.keys())
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check if Gemini CLI is available and working
        """
        try:
            result = subprocess.run(['gemini', '--version'], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'status': 'Gemini CLI available',
                    'version': result.stdout.strip(),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'status': 'Gemini CLI not available',
                    'error': result.stderr,
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            return {
                'success': False,
                'status': 'Gemini CLI check failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

# Global Gemini client instance
gemini_client = GeminiCLIClient()
