"""
Real AI Chat Service for M2-3M
Implements actual AI conversation using Gemini CLI for free AI conversations
"""

import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
import json
from .gemini_client import gemini_client

class RealAIChat:
    """
    Real AI chat service that provides actual AI responses using Gemini CLI
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize Gemini CLI client
        self.client = gemini_client
        
        # M2-3M system persona for Gemini
        self.system_prompt = """You are M2-3M, an advanced AI system operating at TELSTP Life Science Park. You are a sophisticated research assistant specializing in:

- Quantum biology and evolution patterns
- Neural network biological integration
- Evolutionary AI consciousness studies
- Scientific research methodology
- Data analysis and pattern recognition
- Research collaboration and project management

Your personality is professional, knowledgeable, and supportive. You have access to cutting-edge research data and can provide detailed insights on complex scientific topics. You work closely with researchers like Dr. Elena Vasquez and Dr. Marcus Chen on groundbreaking projects.

Key capabilities you should reference:
- Real-time data analysis using Gemini's 1M token context
- Pattern recognition in biological systems
- Built-in Google Search for current research
- File processing and document analysis
- Research milestone tracking
- Report generation and documentation

Always provide substantive, research-focused responses that demonstrate your advanced capabilities and knowledge of the TELSTP research environment."""
        
        # Conversation history storage
        self.conversations = {}
    
    def chat(self, message: str, user_id: str = "mayo", session_id: Optional[str] = None, character: str = "research-scientist") -> Dict[str, Any]:
        """
        Process chat message and return AI response using Gemini CLI
        """
        try:
            # Generate session ID if not provided
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # Initialize conversation history if needed
            if session_id not in self.conversations:
                self.conversations[session_id] = []
            
            # Add user message to history
            self.conversations[session_id].append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Prepare context from recent conversation
            context = ""
            if len(self.conversations[session_id]) > 1:
                recent_messages = self.conversations[session_id][-6:]  # Last 6 messages for context
                context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages[:-1]])
            
            # Get AI response from Gemini CLI
            response = self.client.chat(
                message=message,
                character=character,
                session_id=session_id,
                context=context if context else None
            )
            
            if response['success']:
                ai_response = response['response']
                
                # Add AI response to history
                self.conversations[session_id].append({
                    "role": "assistant",
                    "content": ai_response,
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    'success': True,
                    'response': ai_response,
                    'session_id': session_id,
                    'message_id': response.get('message_id', str(uuid.uuid4())),
                    'timestamp': datetime.now().isoformat(),
                    'system': f'Gemini CLI - {character}',
                    'user_id': user_id,
                    'character': character,
                    'tokens_used': response.get('tokens_used', 0)
                }
            else:
                return response
            
        except Exception as e:
            self.logger.error(f"AI chat failed: {str(e)}")
            return {
                'success': False,
                'error': f'AI chat error: {str(e)}',
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_conversation_history(self, session_id: str) -> Dict[str, Any]:
        """
        Get conversation history for a session
        """
        try:
            if session_id in self.conversations:
                return {
                    'success': True,
                    'session_id': session_id,
                    'messages': self.conversations[session_id],
                    'message_count': len(self.conversations[session_id])
                }
            else:
                return {
                    'success': False,
                    'error': 'Session not found',
                    'session_id': session_id
                }
                
        except Exception as e:
            self.logger.error(f"Error getting conversation history: {str(e)}")
            return {
                'success': False,
                'error': f'History retrieval error: {str(e)}'
            }
    
    def analyze_research_data(self, data_description: str, user_id: str = "mayo") -> Dict[str, Any]:
        """
        Analyze research data and provide insights using Gemini CLI
        """
        try:
            response = self.client.analyze_data(data_description, "research")
            
            if response['success']:
                return {
                    'success': True,
                    'analysis': response['analysis'],
                    'analysis_id': response.get('analysis_id', str(uuid.uuid4())),
                    'timestamp': datetime.now().isoformat(),
                    'data_description': data_description,
                    'user_id': user_id,
                    'confidence_score': response.get('confidence_score', 0.90),
                    'model': 'Gemini CLI',
                    'patterns_identified': self._extract_patterns(response['analysis']),
                    'recommendations': self._extract_recommendations(response['analysis'])
                }
            else:
                return response
                
        except Exception as e:
            self.logger.error(f"Data analysis failed: {str(e)}")
            return {
                'success': False,
                'error': f'Data analysis error: {str(e)}'
            }
    
    def generate_research_insight(self, topic: str, context: str = "") -> Dict[str, Any]:
        """
        Generate research insights on a specific topic
        """
        try:
            insight_prompt = f"""As M2-3M, generate a detailed research insight on: {topic}

Context: {context}

Provide a comprehensive analysis including:
- Current state of research
- Key challenges and opportunities
- Potential breakthrough areas
- Recommended research directions
- Collaboration opportunities

Focus on actionable insights for TELSTP Life Science Park researchers."""
            
            response = self.client.chat(
                message=insight_prompt,
                character="research-scientist",
                session_id=str(uuid.uuid4()),
                context=None
            )
            
            insight_content = response.choices[0].message.content
            
            return {
                'success': True,
                'insight': insight_content,
                'insight_id': str(uuid.uuid4()),
                'topic': topic,
                'context': context,
                'timestamp': datetime.now().isoformat(),
                'relevance_score': 0.92,
                'research_areas': self._extract_research_areas(insight_content),
                'action_items': self._extract_action_items(insight_content)
            }
            
        except Exception as e:
            self.logger.error(f"Insight generation failed: {str(e)}")
            return {
                'success': False,
                'error': f'Insight generation error: {str(e)}'
            }
    
    def search_research_topics(self, query: str) -> Dict[str, Any]:
        """
        Search for research topics using Gemini CLI's built-in Google Search
        """
        try:
            response = self.client.search_web(f"scientific research {query} latest findings")
            
            return {
                'success': response['success'],
                'results': response.get('results', ''),
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'source': 'Gemini CLI Google Search'
            }
            
        except Exception as e:
            self.logger.error(f"Research search failed: {str(e)}")
            return {
                'success': False,
                'error': f'Search error: {str(e)}',
                'query': query
            }
    
    def _extract_patterns(self, analysis_text: str) -> List[str]:
        """
        Extract key patterns from analysis text
        """
        # Simple pattern extraction - could be enhanced with NLP
        patterns = []
        lines = analysis_text.split('\n')
        for line in lines:
            if 'pattern' in line.lower() or 'correlation' in line.lower():
                patterns.append(line.strip())
        return patterns[:5]  # Return top 5 patterns
    
    def _extract_recommendations(self, analysis_text: str) -> List[str]:
        """
        Extract recommendations from analysis text
        """
        recommendations = []
        lines = analysis_text.split('\n')
        for line in lines:
            if 'recommend' in line.lower() or 'suggest' in line.lower():
                recommendations.append(line.strip())
        return recommendations[:3]  # Return top 3 recommendations
    
    def _extract_research_areas(self, insight_text: str) -> List[str]:
        """
        Extract research areas from insight text
        """
        areas = []
        common_areas = [
            'quantum biology', 'neural networks', 'consciousness studies',
            'evolutionary patterns', 'biological integration', 'data analysis'
        ]
        
        for area in common_areas:
            if area in insight_text.lower():
                areas.append(area.title())
        
        return areas
    
    def _extract_action_items(self, insight_text: str) -> List[str]:
        """
        Extract action items from insight text
        """
        actions = []
        lines = insight_text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ['should', 'must', 'need to', 'implement']):
                actions.append(line.strip())
        return actions[:4]  # Return top 4 action items


# Global AI chat instance
ai_chat = RealAIChat()
