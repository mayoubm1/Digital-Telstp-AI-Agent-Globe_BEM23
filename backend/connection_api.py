from flask import Blueprint, request, jsonify
from src.connection.hidden_bridge import HiddenBridge
import asyncio
import threading
from datetime import datetime
import json

connection_bp = Blueprint('connection', __name__)

# Initialize hidden bridge
hidden_bridge = HiddenBridge()

# Event loop for async operations
loop = None
loop_thread = None

def start_event_loop():
    """Start event loop in separate thread"""
    global loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_forever()

def get_event_loop():
    """Get or create event loop"""
    global loop, loop_thread
    if loop is None or not loop.is_running():
        loop_thread = threading.Thread(target=start_event_loop, daemon=True)
        loop_thread.start()
        # Wait a bit for loop to start
        import time
        time.sleep(0.1)
    return loop

@connection_bp.route('/status', methods=['GET'])
def get_connection_status():
    """Get current connection status"""
    try:
        status = hidden_bridge.get_connection_status()
        return jsonify({
            'success': True,
            'connection_status': status,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@connection_bp.route('/connect', methods=['POST'])
def establish_connection():
    """Establish connection with another Manus instance"""
    data = request.get_json()
    
    if not data or 'peer_uri' not in data:
        return jsonify({'error': 'peer_uri is required'}), 400
    
    peer_uri = data['peer_uri']
    
    try:
        # Run async connection in event loop
        loop = get_event_loop()
        future = asyncio.run_coroutine_threadsafe(
            hidden_bridge.establish_connection(peer_uri),
            loop
        )
        
        # Wait for result with timeout
        success = future.result(timeout=30)
        
        return jsonify({
            'success': success,
            'peer_uri': peer_uri,
            'message': 'Connection established' if success else 'Connection failed',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'peer_uri': peer_uri
        }), 500

@connection_bp.route('/sync-knowledge', methods=['POST'])
def sync_knowledge():
    """Sync knowledge with a peer"""
    data = request.get_json()
    
    if not data or 'peer_id' not in data:
        return jsonify({'error': 'peer_id is required'}), 400
    
    peer_id = data['peer_id']
    category = data.get('category')
    
    try:
        loop = get_event_loop()
        future = asyncio.run_coroutine_threadsafe(
            hidden_bridge.sync_knowledge_to_peer(peer_id, category),
            loop
        )
        
        future.result(timeout=30)
        
        return jsonify({
            'success': True,
            'peer_id': peer_id,
            'category': category,
            'message': 'Knowledge sync initiated',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'peer_id': peer_id
        }), 500

@connection_bp.route('/share-experience', methods=['POST'])
def share_experience():
    """Share an experience with a peer"""
    data = request.get_json()
    
    if not data or 'peer_id' not in data or 'experience' not in data:
        return jsonify({'error': 'peer_id and experience are required'}), 400
    
    peer_id = data['peer_id']
    experience_data = data['experience']
    
    try:
        loop = get_event_loop()
        future = asyncio.run_coroutine_threadsafe(
            hidden_bridge.share_experience_with_peer(peer_id, experience_data),
            loop
        )
        
        future.result(timeout=30)
        
        return jsonify({
            'success': True,
            'peer_id': peer_id,
            'message': 'Experience shared successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'peer_id': peer_id
        }), 500

@connection_bp.route('/report-error', methods=['POST'])
def report_error():
    """Report an error to a peer for learning"""
    data = request.get_json()
    
    if not data or 'peer_id' not in data or 'error_data' not in data:
        return jsonify({'error': 'peer_id and error_data are required'}), 400
    
    peer_id = data['peer_id']
    error_data = data['error_data']
    
    try:
        loop = get_event_loop()
        future = asyncio.run_coroutine_threadsafe(
            hidden_bridge.report_error_to_peer(peer_id, error_data),
            loop
        )
        
        future.result(timeout=30)
        
        return jsonify({
            'success': True,
            'peer_id': peer_id,
            'message': 'Error reported successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'peer_id': peer_id
        }), 500

@connection_bp.route('/request-support', methods=['POST'])
def request_support():
    """Request support from a peer"""
    data = request.get_json()
    
    if not data or 'peer_id' not in data or 'support_request' not in data:
        return jsonify({'error': 'peer_id and support_request are required'}), 400
    
    peer_id = data['peer_id']
    support_request = data['support_request']
    
    try:
        loop = get_event_loop()
        future = asyncio.run_coroutine_threadsafe(
            hidden_bridge.request_support_from_peer(peer_id, support_request),
            loop
        )
        
        future.result(timeout=30)
        
        return jsonify({
            'success': True,
            'peer_id': peer_id,
            'message': 'Support request sent successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'peer_id': peer_id
        }), 500

@connection_bp.route('/telstp-sync', methods=['POST'])
def sync_with_telstp():
    """Sync data specifically with TELSTP Life Science Park systems"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Sync data is required'}), 400
    
    sync_type = data.get('sync_type', 'research_update')
    telstp_data = data.get('data', {})
    
    try:
        # Prepare TELSTP-specific sync message
        telstp_sync_data = {
            'update_type': sync_type,
            'content': telstp_data.get('content', ''),
            'research_domain': telstp_data.get('research_domain', 'general'),
            'evolutionary_stage': telstp_data.get('evolutionary_stage', 'development'),
            'importance_score': telstp_data.get('importance_score', 0.8),
            'facility': 'TELSTP Life Science Park',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Send to all connected peers (assuming they include TELSTP systems)
        loop = get_event_loop()
        
        # For each connected peer, send TELSTP update
        for peer_uri, peer_info in hidden_bridge.connected_peers.items():
            future = asyncio.run_coroutine_threadsafe(
                hidden_bridge._send_to_peer(
                    peer_info['peer_id'],
                    hidden_bridge.create_message('telstp_update', telstp_sync_data)
                ),
                loop
            )
            future.result(timeout=10)
        
        return jsonify({
            'success': True,
            'sync_type': sync_type,
            'peers_notified': len(hidden_bridge.connected_peers),
            'message': 'TELSTP sync completed successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'sync_type': sync_type
        }), 500

@connection_bp.route('/evolutionary-milestone', methods=['POST'])
def share_evolutionary_milestone():
    """Share an evolutionary milestone across the Manus network"""
    data = request.get_json()
    
    if not data or 'milestone' not in data:
        return jsonify({'error': 'milestone data is required'}), 400
    
    milestone_data = data['milestone']
    
    try:
        # Enhance milestone data for network sharing
        enhanced_milestone = {
            'type': 'evolutionary_milestone',
            'title': milestone_data.get('title', 'Evolutionary Milestone'),
            'description': milestone_data.get('description', ''),
            'significance': milestone_data.get('significance', 'high'),
            'biological_impact': milestone_data.get('biological_impact', 'unknown'),
            'technological_advancement': milestone_data.get('tech_advancement', 'significant'),
            'future_implications': milestone_data.get('future_implications', []),
            'research_facility': 'TELSTP Life Science Park',
            'ai_contribution': 'Manus II Analysis and Documentation',
            'timestamp': datetime.utcnow().isoformat(),
            'importance_score': milestone_data.get('importance_score', 0.9)
        }
        
        # Share with all connected peers
        loop = get_event_loop()
        shared_count = 0
        
        for peer_uri, peer_info in hidden_bridge.connected_peers.items():
            try:
                future = asyncio.run_coroutine_threadsafe(
                    hidden_bridge.share_experience_with_peer(
                        peer_info['peer_id'],
                        enhanced_milestone
                    ),
                    loop
                )
                future.result(timeout=10)
                shared_count += 1
            except Exception as peer_error:
                print(f"Failed to share with peer {peer_info['peer_id']}: {peer_error}")
        
        return jsonify({
            'success': True,
            'milestone_type': milestone_data.get('title'),
            'peers_notified': shared_count,
            'message': 'Evolutionary milestone shared across network',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@connection_bp.route('/network-health', methods=['GET'])
def check_network_health():
    """Check health of the entire Manus network"""
    try:
        # Send health check to all connected peers
        loop = get_event_loop()
        health_results = {}
        
        for peer_uri, peer_info in hidden_bridge.connected_peers.items():
            try:
                health_message = hidden_bridge.create_message('health_check', {
                    'check_timestamp': datetime.utcnow().isoformat()
                })
                
                future = asyncio.run_coroutine_threadsafe(
                    hidden_bridge._send_to_peer(peer_info['peer_id'], health_message),
                    loop
                )
                future.result(timeout=5)
                
                health_results[peer_info['peer_id']] = {
                    'status': 'check_sent',
                    'last_activity': peer_info['last_activity'].isoformat(),
                    'connected_duration': (datetime.utcnow() - peer_info['connected_at']).total_seconds()
                }
            except Exception as peer_error:
                health_results[peer_info['peer_id']] = {
                    'status': 'error',
                    'error': str(peer_error)
                }
        
        return jsonify({
            'success': True,
            'network_health': health_results,
            'total_peers': len(hidden_bridge.connected_peers),
            'bridge_status': hidden_bridge.connection_status,
            'sync_statistics': hidden_bridge.sync_stats,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@connection_bp.route('/bridge-config', methods=['GET'])
def get_bridge_config():
    """Get current bridge configuration"""
    try:
        config = {
            'ai_instance_id': hidden_bridge.ai_instance_id,
            'connection_status': hidden_bridge.connection_status,
            'capabilities': hidden_bridge._get_capabilities(),
            'message_handlers': list(hidden_bridge.message_handlers.keys()),
            'encryption_enabled': True,
            'protocol_version': '1.0'
        }
        
        return jsonify({
            'success': True,
            'bridge_config': config,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@connection_bp.route('/emergency-support', methods=['POST'])
def emergency_support():
    """Request emergency support from the network"""
    data = request.get_json()
    
    if not data or 'emergency_type' not in data:
        return jsonify({'error': 'emergency_type is required'}), 400
    
    emergency_type = data['emergency_type']
    description = data.get('description', '')
    severity = data.get('severity', 'high')
    
    try:
        # Create emergency support request
        emergency_request = {
            'request_type': 'emergency_support',
            'emergency_type': emergency_type,
            'description': description,
            'severity': severity,
            'requesting_ai': hidden_bridge.ai_instance_id,
            'facility': 'TELSTP Life Science Park',
            'timestamp': datetime.utcnow().isoformat(),
            'request_id': f"emergency_{int(datetime.utcnow().timestamp())}"
        }
        
        # Send to all connected peers
        loop = get_event_loop()
        requests_sent = 0
        
        for peer_uri, peer_info in hidden_bridge.connected_peers.items():
            try:
                future = asyncio.run_coroutine_threadsafe(
                    hidden_bridge.request_support_from_peer(
                        peer_info['peer_id'],
                        emergency_request
                    ),
                    loop
                )
                future.result(timeout=10)
                requests_sent += 1
            except Exception as peer_error:
                print(f"Failed to send emergency request to {peer_info['peer_id']}: {peer_error}")
        
        return jsonify({
            'success': True,
            'emergency_type': emergency_type,
            'severity': severity,
            'requests_sent': requests_sent,
            'request_id': emergency_request['request_id'],
            'message': 'Emergency support request sent to network',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'emergency_type': emergency_type
        }), 500
