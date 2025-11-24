from flask import Blueprint, request, jsonify
from src.models.knowledge_base import db, KnowledgeEntry, ErrorLog, ConceptualFramework
from datetime import datetime
import json

knowledge_bp = Blueprint('knowledge', __name__)

@knowledge_bp.route('/knowledge', methods=['GET'])
def get_knowledge():
    """Retrieve knowledge entries with optional filtering"""
    category = request.args.get('category')
    tags = request.args.get('tags')
    search = request.args.get('search')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = KnowledgeEntry.query
    
    if category:
        query = query.filter(KnowledgeEntry.category == category)
    
    if tags:
        tag_list = tags.split(',')
        for tag in tag_list:
            query = query.filter(KnowledgeEntry.tags.contains(f'"{tag}"'))
    
    if search:
        query = query.filter(
            db.or_(
                KnowledgeEntry.title.contains(search),
                KnowledgeEntry.content.contains(search)
            )
        )
    
    query = query.order_by(KnowledgeEntry.updated_at.desc())
    entries = query.offset(offset).limit(limit).all()
    
    return jsonify({
        'entries': [entry.to_dict() for entry in entries],
        'total': query.count()
    })

@knowledge_bp.route('/knowledge', methods=['POST'])
def add_knowledge():
    """Add a new knowledge entry"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['category', 'title', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    entry = KnowledgeEntry(
        category=data['category'],
        title=data['title'],
        content=data['content'],
        meta_data=json.dumps(data.get('metadata', {})),
        tags=json.dumps(data.get('tags', [])),
        confidence_score=data.get('confidence_score', 1.0),
        source=data.get('source')
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify(entry.to_dict()), 201

@knowledge_bp.route('/knowledge/<int:entry_id>', methods=['PUT'])
def update_knowledge(entry_id):
    """Update an existing knowledge entry"""
    entry = KnowledgeEntry.query.get_or_404(entry_id)
    data = request.get_json()
    
    if 'title' in data:
        entry.title = data['title']
    if 'content' in data:
        entry.content = data['content']
    if 'metadata' in data:
        entry.meta_data = json.dumps(data['metadata'])
    if 'tags' in data:
        entry.tags = json.dumps(data['tags'])
    if 'confidence_score' in data:
        entry.confidence_score = data['confidence_score']
    if 'source' in data:
        entry.source = data['source']
    
    entry.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(entry.to_dict())

@knowledge_bp.route('/knowledge/<int:entry_id>', methods=['DELETE'])
def delete_knowledge(entry_id):
    """Delete a knowledge entry"""
    entry = KnowledgeEntry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': 'Knowledge entry deleted successfully'})

@knowledge_bp.route('/errors', methods=['GET'])
def get_errors():
    """Retrieve error logs with optional filtering"""
    error_type = request.args.get('error_type')
    status = request.args.get('status')
    impact = request.args.get('impact')
    source_ai = request.args.get('source_ai')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = ErrorLog.query
    
    if error_type:
        query = query.filter(ErrorLog.error_type == error_type)
    if status:
        query = query.filter(ErrorLog.status == status)
    if impact:
        query = query.filter(ErrorLog.impact == impact)
    if source_ai:
        query = query.filter(ErrorLog.source_ai == source_ai)
    
    query = query.order_by(ErrorLog.created_at.desc())
    errors = query.offset(offset).limit(limit).all()
    
    return jsonify({
        'errors': [error.to_dict() for error in errors],
        'total': query.count()
    })

@knowledge_bp.route('/errors', methods=['POST'])
def log_error():
    """Log a new error"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['error_type', 'description']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    error = ErrorLog(
        error_type=data['error_type'],
        description=data['description'],
        context=json.dumps(data.get('context', {})),
        root_cause=data.get('root_cause'),
        impact=data.get('impact', 'medium'),
        corrective_action=data.get('corrective_action'),
        source_ai=data.get('source_ai', 'manus_ii')
    )
    
    db.session.add(error)
    db.session.commit()
    
    return jsonify(error.to_dict()), 201

@knowledge_bp.route('/errors/<int:error_id>/resolve', methods=['PUT'])
def resolve_error(error_id):
    """Mark an error as resolved"""
    error = ErrorLog.query.get_or_404(error_id)
    data = request.get_json()
    
    error.status = 'resolved'
    error.resolved_at = datetime.utcnow()
    if data and 'corrective_action' in data:
        error.corrective_action = data['corrective_action']
    
    db.session.commit()
    
    return jsonify(error.to_dict())

@knowledge_bp.route('/frameworks', methods=['GET'])
def get_frameworks():
    """Retrieve conceptual frameworks"""
    frameworks = ConceptualFramework.query.order_by(ConceptualFramework.updated_at.desc()).all()
    return jsonify([framework.to_dict() for framework in frameworks])

@knowledge_bp.route('/frameworks', methods=['POST'])
def add_framework():
    """Add a new conceptual framework"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['name', 'description']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    framework = ConceptualFramework(
        name=data['name'],
        description=data['description'],
        principles=json.dumps(data.get('principles', [])),
        applications=json.dumps(data.get('applications', [])),
        relationships=json.dumps(data.get('relationships', {})),
        version=data.get('version', '1.0')
    )
    
    db.session.add(framework)
    db.session.commit()
    
    return jsonify(framework.to_dict()), 201
