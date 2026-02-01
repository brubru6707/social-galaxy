import { Billboard, OrbitControls, useTexture } from '@react-three/drei/native';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import * as THREE from 'three';
import { Grove } from '@/assets/groves_data';
import mockData from '../assets/mock_data.json';
import OtherProfile from './other-profile';

// --- Types ---
export type UserType = {
  id: string;
  name: string;
  bio: string;
  dob: string;
  profile_picture: string;
  events_gone_to: any[];
  hot_take_answers: any[];
}; 

type GroveNode = {
  user: UserType;
  x: number;
  y: number;
  z: number;
  vec: THREE.Vector3;
  isCurrentUser: boolean;
  isFriend: boolean; // Direct friend of current user
  connectionStrength: number; // How many shared events
};

type Connection = {
  from: UserType;
  to: UserType;
  strength: number; // Number of shared events
};

interface GroveSocialGalaxyProps {
  grove: Grove;
  currentUserId: string;
  groveMembers: UserType[];
}

// Calculate connection strength between two users (shared events in grove context)
function getSharedEvents(user1: UserType, user2: UserType): string[] {
  const events1 = new Set((user1.events_gone_to || []).map((e: any) => e.id));
  const events2 = (user2.events_gone_to || []).map((e: any) => e.id);
  return events2.filter((id: string) => events1.has(id));
}

// Generate grove-specific galaxy data
function generateGroveGalaxyData(
  currentUserId: string,
  groveMembers: UserType[],
  allUsers: UserType[]
): { nodes: GroveNode[]; connections: Connection[] } {
  const currentUser = allUsers.find(u => u.id === currentUserId);
  if (!currentUser) {
    return { nodes: [], connections: [] };
  }

  const nodes: GroveNode[] = [];
  const connections: Connection[] = [];
  const memberIds = new Set(groveMembers.map(m => m.id));

  // Find the current user's friends who are in the grove
  const friendsInGrove: { user: UserType; sharedEvents: string[] }[] = [];
  
  groveMembers.forEach(member => {
    if (member.id !== currentUserId) {
      const sharedEvents = getSharedEvents(currentUser, member);
      if (sharedEvents.length > 0) {
        friendsInGrove.push({ user: member, sharedEvents });
      }
    }
  });

  // Add current user at center
  const isCurrentUserMember = memberIds.has(currentUserId);
  nodes.push({
    user: currentUser,
    x: 0,
    y: 0,
    z: 0,
    vec: new THREE.Vector3(0, 0, 0),
    isCurrentUser: true,
    isFriend: false,
    connectionStrength: 0,
  });

  // Position friends in a circle around the current user
  const friendRadius = 5;
  friendsInGrove.forEach((friend, index) => {
    const angle = (index / friendsInGrove.length) * 2 * Math.PI;
    const x = friendRadius * Math.cos(angle);
    const y = friendRadius * Math.sin(angle);
    const z = (Math.random() - 0.5) * 2; // Slight z variation

    nodes.push({
      user: friend.user,
      x,
      y,
      z,
      vec: new THREE.Vector3(x, y, z),
      isCurrentUser: false,
      isFriend: true,
      connectionStrength: friend.sharedEvents.length,
    });

    // Add connection from current user to this friend
    connections.push({
      from: currentUser,
      to: friend.user,
      strength: friend.sharedEvents.length,
    });
  });

  // Find connections between friends (mutuals)
  for (let i = 0; i < friendsInGrove.length; i++) {
    for (let j = i + 1; j < friendsInGrove.length; j++) {
      const sharedEvents = getSharedEvents(friendsInGrove[i].user, friendsInGrove[j].user);
      if (sharedEvents.length > 0) {
        connections.push({
          from: friendsInGrove[i].user,
          to: friendsInGrove[j].user,
          strength: sharedEvents.length,
        });
      }
    }
  }

  // Add other grove members who are not direct friends (but connected through friends)
  const addedIds = new Set(nodes.map(n => n.user.id));
  const secondaryRadius = 9;
  
  groveMembers.forEach((member, index) => {
    if (!addedIds.has(member.id)) {
      // Check if this member is connected to any of the current user's friends
      const connectedToFriend = friendsInGrove.some(friend => {
        const shared = getSharedEvents(friend.user, member);
        if (shared.length > 0) {
          connections.push({
            from: friend.user,
            to: member,
            strength: shared.length,
          });
          return true;
        }
        return false;
      });

      if (connectedToFriend) {
        const angle = (index / groveMembers.length) * 2 * Math.PI + Math.PI / 4;
        const x = secondaryRadius * Math.cos(angle);
        const y = secondaryRadius * Math.sin(angle);
        const z = (Math.random() - 0.5) * 3;

        nodes.push({
          user: member,
          x,
          y,
          z,
          vec: new THREE.Vector3(x, y, z),
          isCurrentUser: false,
          isFriend: false,
          connectionStrength: 0,
        });
      }
    }
  });

  return { nodes, connections };
}

// --- 3D Components ---

function ConnectionLine({ 
  from, 
  to, 
  strength, 
  groveColor 
}: { 
  from: THREE.Vector3; 
  to: THREE.Vector3; 
  strength: number;
  groveColor: string;
}) {
  const points = useMemo(() => [from, to], [from, to]);
  const lineRef = useRef<THREE.Line>(null);
  
  // Animate line opacity
  useFrame(({ clock }) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color={groveColor} 
        transparent 
        opacity={0.4} 
        linewidth={Math.min(strength, 3)}
      />
    </line>
  );
}

function UserNode({ 
  node, 
  onSelect, 
  isSelected,
  groveColor,
}: { 
  node: GroveNode; 
  onSelect: (node: GroveNode) => void;
  isSelected: boolean;
  groveColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(node.user.profile_picture);
  
  // Animate the node
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle floating animation
      const offset = node.isCurrentUser ? 0 : Math.sin(clock.getElapsedTime() + node.x) * 0.1;
      meshRef.current.position.y = node.y + offset;
      
      // Scale pulse for current user
      if (node.isCurrentUser) {
        const scale = 1.2 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const size = node.isCurrentUser ? 1.0 : node.isFriend ? 0.7 : 0.5;
  const ringColor = node.isCurrentUser ? '#FFD700' : node.isFriend ? groveColor : '#666';

  return (
    <Billboard position={[node.x, node.y, node.z]}>
      <mesh 
        ref={meshRef} 
        onClick={() => onSelect(node)}
      >
        {/* Outer ring */}
        <ringGeometry args={[size, size + 0.15, 32]} />
        <meshBasicMaterial color={isSelected ? '#fff' : ringColor} />
      </mesh>
      <mesh onClick={() => onSelect(node)}>
        <circleGeometry args={[size, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Name label */}
      <Billboard position={[0, -size - 0.4, 0]}>
        <mesh>
          <planeGeometry args={[2, 0.4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Billboard>
    </Billboard>
  );
}

function GroveGalaxyScene({ 
  nodes, 
  connections, 
  onSelectUser,
  selectedNode,
  groveColor,
}: { 
  nodes: GroveNode[];
  connections: Connection[];
  onSelectUser: (node: GroveNode) => void;
  selectedNode: GroveNode | null;
  groveColor: string;
}) {
  // Create a map for quick node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, GroveNode>();
    nodes.forEach(node => map.set(node.user.id, node));
    return map;
  }, [nodes]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Connection lines */}
      {connections.map((conn, index) => {
        const fromNode = nodeMap.get(conn.from.id);
        const toNode = nodeMap.get(conn.to.id);
        if (!fromNode || !toNode) return null;
        
        return (
          <ConnectionLine
            key={`conn-${index}`}
            from={fromNode.vec}
            to={toNode.vec}
            strength={conn.strength}
            groveColor={groveColor}
          />
        );
      })}
      
      {/* User nodes */}
      {nodes.map(node => (
        <UserNode
          key={node.user.id}
          node={node}
          onSelect={onSelectUser}
          isSelected={selectedNode?.user.id === node.user.id}
          groveColor={groveColor}
        />
      ))}
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// --- Main Component ---
export default function GroveSocialGalaxy({ grove, currentUserId, groveMembers }: GroveSocialGalaxyProps) {
  const { width, height } = useWindowDimensions();
  const [selectedNode, setSelectedNode] = useState<GroveNode | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const allUsers = mockData.users as UserType[];
  
  // Generate galaxy data
  const { nodes, connections } = useMemo(() => {
    return generateGroveGalaxyData(currentUserId, groveMembers, allUsers);
  }, [currentUserId, groveMembers, allUsers]);

  const handleSelectUser = (node: GroveNode) => {
    setSelectedNode(node);
    if (!node.isCurrentUser) {
      setShowProfile(true);
    }
  };

  // Stats for display
  const directFriends = nodes.filter(n => n.isFriend).length;
  const totalConnections = connections.length;

  if (nodes.length <= 1) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🌌</Text>
        <Text style={styles.emptyTitle}>No Connections Yet</Text>
        <Text style={styles.emptySubtitle}>
          Attend events with {grove.name} members to see your connections here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: grove.color }]}>{directFriends}</Text>
          <Text style={styles.statLabel}>Friends in Grove</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: grove.color }]}>{totalConnections}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
      </View>

      {/* Galaxy Canvas */}
      <View style={[styles.canvasContainer, { height: height * 0.45 }]}>
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <Suspense fallback={null}>
            <GroveGalaxyScene
              nodes={nodes}
              connections={connections}
              onSelectUser={handleSelectUser}
              selectedNode={selectedNode}
              groveColor={grove.color}
            />
          </Suspense>
        </Canvas>
        
        {/* Loading overlay */}
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={grove.color} style={{ opacity: 0 }} />
        </View>
      </View>

      {/* Selected user info */}
      {selectedNode && (
        <View style={styles.selectedInfo}>
          <Image 
            source={{ uri: selectedNode.user.profile_picture }}
            style={styles.selectedAvatar}
          />
          <View style={styles.selectedDetails}>
            <Text style={styles.selectedName}>{selectedNode.user.name}</Text>
            <Text style={styles.selectedRelation}>
              {selectedNode.isCurrentUser 
                ? "That's you!" 
                : selectedNode.isFriend 
                  ? `${selectedNode.connectionStrength} shared events`
                  : "Friend of a friend"
              }
            </Text>
          </View>
          {!selectedNode.isCurrentUser && (
            <TouchableOpacity 
              style={[styles.viewProfileBtn, { backgroundColor: grove.color }]}
              onPress={() => setShowProfile(true)}
            >
              <Text style={styles.viewProfileBtnText}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: grove.color }]} />
          <Text style={styles.legendText}>Friends</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#666' }]} />
          <Text style={styles.legendText}>Mutuals</Text>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfile(false)}
      >
        {selectedNode && !selectedNode.isCurrentUser && (
          <OtherProfile
            user={selectedNode.user}
            onClose={() => setShowProfile(false)}
            groveContext={grove.id}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  canvasContainer: {
    width: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  selectedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedDetails: {
    flex: 1,
    marginLeft: 12,
  },
  selectedName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedRelation: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  viewProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  viewProfileBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#888',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
