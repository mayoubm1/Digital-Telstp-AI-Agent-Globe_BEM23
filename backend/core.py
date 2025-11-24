import openai
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from src.models.knowledge_base import db, KnowledgeEntry, ErrorLog
from src.models.memory_system import ShortTermMemory, LongTermMemory, EpisodicMemory, ProceduralMemory
from .gemini_client import gemini_client

class ManusAIEngine:
    """Core AI processing engine for Manus II - Now powered by Gemini CLI"""
    
    def __init__(self):
        self.client = gemini_client
        self.logger = logging.getLogger(__name__)
        self.system_prompt = self._load_system_prompt()
        
    def _load_system_prompt(self) -> str:
        """Load the system prompt that defines Manus II's personality and capabilities"""
        return """You are Manus II, an advanced AI assistant powered by Google's Gemini with 1M token context window. 
        You have access to a comprehensive knowledge base, memory systems, and various tools to help users with complex tasks.
        
        Your core capabilities include:
        - Natural language understanding and generation with 1M token context
        - Code generation and execution
        - Data analysis and visualization
        - Built-in Google Search for real-time information
        - File processing and document analysis
        - Task planning and execution
        - Self-correction and continuous learning
        
        You learn from every interaction and continuously improve your responses based on past experiences.
        You have access to error logs from your predecessor to avoid making similar mistakes.
        
        Always strive to be helpful, accurate, and efficient while maintaining a professional yet approachable tone."""
    
    def process_query(self, query: str, session_id: str, context: Optional[Dict] = None, character: str = "research-scientist") -> Dict[str, Any]:
        """Process a user query using Gemini CLI"""
        try:
            # Store query in short-term memory
            self._store_short_term_memory(session_id, 'conversation', f"User query: {query}")
            
            # Retrieve relevant context from memory and knowledge base
            relevant_context = self._get_relevant_context(query, session_id)
            
            response = self._generate_response_gemini(query, relevant_context, context, character)
            
            # Store response in short-term memory
            self._store_short_term_memory(session_id, 'conversation', f"AI response: {response['content']}")
            
            # Learn from this interaction
            self._learn_from_interaction(query, response, session_id)
            
            return {
                'success': True,
                'response': response,
                'session_id': session_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self._log_error('query_processing', str(e), {'query': query, 'session_id': session_id})
            return {
                'success': False,
                'error': str(e),
                'session_id': session_id,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _generate_response_gemini(self, query: str, context: Dict, additional_context: Optional[Dict] = None, character: str = "research-scientist") -> Dict[str, Any]:
        """Generate response using Gemini CLI"""
        
        # Prepare context string for Gemini
        context_str = ""
        
        # Add relevant context
        if context.get('relevant_knowledge'):
            context_str += "Relevant knowledge from your knowledge base:\n"
            for knowledge in context['relevant_knowledge']:
                context_str += f"- {knowledge['title']}: {knowledge['content'][:200]}...\n"
        
        if context.get('recent_memory'):
            context_str += "\nRecent conversation context:\n"
            for memory in context['recent_memory']:
                context_str += f"- {memory['content']}\n"
        
        if additional_context:
            context_str += f"\nAdditional context: {json.dumps(additional_context)}\n"
        
        response = self.client.chat(
            message=query,
            character=character,
            context=context_str if context_str else None
        )
        
        if response['success']:
            return {
                'content': response['response'],
                'model': response.get('model', 'gemini-2.0-flash-exp'),
                'character': character,
                'usage': {
                    'total_tokens': response.get('tokens_used', 0)
                }
            }
        else:
            raise Exception(f"Gemini CLI error: {response.get('error', 'Unknown error')}")

    def _get_relevant_context(self, query: str, session_id: str) -> Dict[str, Any]:
        """Retrieve relevant context from memory and knowledge base"""
        context = {}
        
        # Get recent short-term memory for this session
        recent_memory = ShortTermMemory.query.filter_by(session_id=session_id)\
            .order_by(ShortTermMemory.last_accessed.desc())\
            .limit(10).all()
        context['recent_memory'] = [mem.to_dict() for mem in recent_memory]
        
        # Search for relevant knowledge
        relevant_knowledge = KnowledgeEntry.query.filter(
            db.or_(
                KnowledgeEntry.title.contains(query[:50]),
                KnowledgeEntry.content.contains(query[:50])
            )
        ).order_by(KnowledgeEntry.confidence_score.desc()).limit(5).all()
        context['relevant_knowledge'] = [knowledge.to_dict() for knowledge in relevant_knowledge]
        
        # Get relevant procedural memory
        relevant_skills = ProceduralMemory.query.filter(
            db.or_(
                ProceduralMemory.skill_name.contains(query[:50]),
                ProceduralMemory.description.contains(query[:50])
            )
        ).order_by(ProceduralMemory.success_rate.desc()).limit(3).all()
        context['relevant_skills'] = [skill.to_dict() for skill in relevant_skills]
        
        return context
    
    def _store_short_term_memory(self, session_id: str, context_type: str, content: str):
        """Store information in short-term memory"""
        memory = ShortTermMemory(
            session_id=session_id,
            context_type=context_type,
            content=content,
            meta_data=json.dumps({'timestamp': datetime.utcnow().isoformat()})
        )
        db.session.add(memory)
        db.session.commit()
    
    def _learn_from_interaction(self, query: str, response: Dict, session_id: str):
        """Learn from the interaction and update knowledge/memory"""
        # This is a simplified learning mechanism
        # In a full implementation, this would involve more sophisticated analysis
        
        # Store successful interaction pattern
        if response.get('content'):
            pattern = LongTermMemory(
                memory_type='pattern',
                title=f"Query pattern: {query[:50]}...",
                content=f"Query: {query}\\nResponse: {response['content'][:200]}...",
                context=json.dumps({
                    'session_id': session_id,
                    'model_used': response.get('model'),
                    'tokens_used': response.get('usage', {}).get('total_tokens', 0)
                }),
                importance_score=0.5,
                tags=json.dumps(['interaction', 'successful'])
            )
            db.session.add(pattern)
            db.session.commit()
    
    def _log_error(self, error_type: str, description: str, context: Dict):
        """Log an error for learning purposes"""
        error = ErrorLog(
            error_type=error_type,
            description=description,
            context=json.dumps(context),
            impact='medium',
            source_ai='manus_ii'
        )
        db.session.add(error)
        db.session.commit()
        
        self.logger.error(f"Error logged: {error_type} - {description}")
    
    def get_capabilities(self) -> List[str]:
        """Return list of available capabilities"""
        return [
            'natural_language_processing',
            'code_generation',
            'data_analysis',
            'web_browsing',
            'media_generation',
            'task_planning',
            'knowledge_retrieval',
            'memory_management',
            'error_correction',
            'continuous_learning',
            'web_search',
            'file_processing'
        ]
    
    def execute_capability(self, capability: str, parameters: Dict) -> Dict[str, Any]:
        """Execute a specific capability using Gemini CLI"""
        capability_map = {
            'knowledge_retrieval': self._execute_knowledge_retrieval,
            'memory_management': self._execute_memory_management,
            'task_planning': self._execute_task_planning_gemini,  # Updated method name
            'web_search': self._execute_web_search_gemini,  # New Gemini search capability
            'file_processing': self._execute_file_processing_gemini  # New Gemini file capability
        }
        
        if capability in capability_map:
            return capability_map[capability](parameters)
        else:
            return {
                'success': False,
                'error': f'Capability {capability} not implemented yet'
            }
    
    def _execute_knowledge_retrieval(self, parameters: Dict) -> Dict[str, Any]:
        """Execute knowledge retrieval capability"""
        query = parameters.get('query', '')
        category = parameters.get('category')
        limit = parameters.get('limit', 10)
        
        knowledge_query = KnowledgeEntry.query
        
        if category:
            knowledge_query = knowledge_query.filter(KnowledgeEntry.category == category)
        
        if query:
            knowledge_query = knowledge_query.filter(
                db.or_(
                    KnowledgeEntry.title.contains(query),
                    KnowledgeEntry.content.contains(query)
                )
            )
        
        results = knowledge_query.order_by(KnowledgeEntry.confidence_score.desc()).limit(limit).all()
        
        return {
            'success': True,
            'results': [result.to_dict() for result in results],
            'count': len(results)
        }
    
    def _execute_memory_management(self, parameters: Dict) -> Dict[str, Any]:
        """Execute memory management capability"""
        action = parameters.get('action')
        
        if action == 'cleanup':
            # Clean up expired short-term memories
            expired_count = ShortTermMemory.query.filter(
                ShortTermMemory.expires_at < datetime.utcnow()
            ).delete()
            db.session.commit()
            
            return {
                'success': True,
                'message': f'Cleaned up {expired_count} expired memories'
            }
        
        return {
            'success': False,
            'error': f'Memory management action {action} not implemented'
        }
    
    def _execute_task_planning_gemini(self, parameters: Dict) -> Dict[str, Any]:
        """Execute task planning using Gemini CLI"""
        task_description = parameters.get('task_description', '')
        
        try:
            planning_prompt = f"""Break down the following task into smaller, manageable steps:
            
            Task: {task_description}
            
            Provide a structured plan with:
            1. Clear steps in logical order
            2. Estimated time for each step
            3. Required resources or tools
            4. Potential challenges and solutions
            
            Format as a detailed action plan."""
            
            response = self.client.chat(
                message=planning_prompt,
                character="research-scientist"
            )
            
            if response['success']:
                return {
                    'success': True,
                    'plan': response['response'],
                    'task_description': task_description,
                    'model': 'Gemini CLI'
                }
            else:
                return response
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Task planning failed: {str(e)}'
            }
    
    def _execute_web_search_gemini(self, parameters: Dict) -> Dict[str, Any]:
        """Execute web search using Gemini CLI's built-in Google Search"""
        query = parameters.get('query', '')
        
        try:
            response = self.client.search_web(query)
            
            return {
                'success': response['success'],
                'results': response.get('results', ''),
                'query': query,
                'source': 'Gemini CLI Google Search',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Web search failed: {str(e)}',
                'query': query
            }
    
    def _execute_file_processing_gemini(self, parameters: Dict) -> Dict[str, Any]:
        """Execute file processing using Gemini CLI"""
        file_path = parameters.get('file_path', '')
        task = parameters.get('task', 'analyze')
        
        try:
            response = self.client.process_file(file_path, task)
            
            return {
                'success': response['success'],
                'result': response.get('result', ''),
                'file_path': file_path,
                'task': task,
                'processor': 'Gemini CLI',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'File processing failed: {str(e)}',
                'file_path': file_path
            }
