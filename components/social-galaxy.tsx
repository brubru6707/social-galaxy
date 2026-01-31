import { Billboard, OrbitControls, useTexture } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useMemo, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as THREE from 'three';
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

type Node = {
  user: UserType;
  x: number;
  y: number;
  z: number;
  // We keep position as a Vector3 for easy math later
  vec: THREE.Vector3;
  clusterId: number;
};

type Cluster = {
  id: number;
  users: UserType[];
  center: THREE.Vector3;
};

// Calculate similarity score between two users based on hot takes
function calculateSimilarity(user1: UserType, user2: UserType): number {
  const answers1 = user1.hot_take_answers || [];
  const answers2 = user2.hot_take_answers || [];
  console.log('[DEBUG] Comparing users:', user1.id, user2.id);
  // console.log('[DEBUG] answers1:', answers1);
  // console.log('[DEBUG] answers2:', answers2);
  if (answers1.length === 0 || answers2.length === 0) {
    console.log('[DEBUG] One or both users have no hot_take_answers');
    return 0;
  }
  // Use 'answer' or 'selected_option' for answer value
  const getAnswerValue = (a: any) => a.answer ?? a.selected_option;
  // console.log('[DEBUG] answers1 fields:', answers1.map(a => ({ q: a.question_text, a: a.answer, so: a.selected_option })));
  // console.log('[DEBUG] answers2 fields:', answers2.map(a => ({ q: a.question_text, a: a.answer, so: a.selected_option })));
  // Create a map of question to answer for user1
  const answerMap1 = new Map();
  answers1.forEach((a: any) => {
    const val = getAnswerValue(a);
    if (a.question_text && val) {
      answerMap1.set(a.question_text, val);
    }
  });
  // Count matching answers
  let matches = 0;
  let totalComparisons = 0;
  answers2.forEach((a: any) => {
    const val = getAnswerValue(a);
    if (a.question_text && val && answerMap1.has(a.question_text)) {
      totalComparisons++;
      if (answerMap1.get(a.question_text) === val) {
        matches++;
      }
    }
  });
  console.log('[DEBUG] matches:', matches, 'totalComparisons:', totalComparisons);
  const score = totalComparisons > 0 ? matches / totalComparisons : 0;
  console.log('[DEBUG] similarity score:', score);
  return score;
}

// --- 1. Tuning Parameters ---
const GALAXY_RADIUS = 10; // Spread clusters far apart
const CLUSTER_JITTER = 3; // Keep users tight within their cluster

// --- OBJECTIVE CLUSTERING ALGORITHM ---
function clusterUsers(users: UserType[]): Cluster[] {
  if (users.length === 0) return [];

  // 1. Calculate ALL relationships first
  type Relation = { u1: UserType; u2: UserType; score: number };
  const allRelations: Relation[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const score = calculateSimilarity(users[i], users[j]);
      // Only care about matches that are actually meaningful (>50%)
      if (score > 0.5) { 
        allRelations.push({ u1: users[i], u2: users[j], score });
      }
    }
  }

  // 2. Sort relationships: Strongest matches get first dibs!
  // This removes the bias of "who comes first in the array"
  allRelations.sort((a, b) => b.score - a.score);

  const clusters: Cluster[] = [];
  const assigned = new Set<string>();
  const userToClusterMap = new Map<string, number>(); // Map UserId -> ClusterIndex

  // 3. Build clusters based on sorted strengths
  allRelations.forEach((rel) => {
    const u1Assigned = assigned.has(rel.u1.id);
    const u2Assigned = assigned.has(rel.u2.id);

    if (!u1Assigned && !u2Assigned) {
      // CASE A: Neither is assigned. Create a NEW cluster.
      // These two are a "Power Couple" (highest remaining match)
      const newClusterId = clusters.length;
      
      // Random position for this new group
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = GALAXY_RADIUS; // Using your radius constant
      
      const center = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      clusters.push({
        id: newClusterId,
        users: [rel.u1, rel.u2],
        center
      });

      assigned.add(rel.u1.id);
      assigned.add(rel.u2.id);
      userToClusterMap.set(rel.u1.id, newClusterId);
      userToClusterMap.set(rel.u2.id, newClusterId);

    } else if (u1Assigned && !u2Assigned) {
      // CASE B: U1 is already in a cluster. U2 wants to join.
      // Since we are sorting by strength, this is a strong link. Let them in.
      const clusterId = userToClusterMap.get(rel.u1.id)!;
      clusters[clusterId].users.push(rel.u2);
      assigned.add(rel.u2.id);
      userToClusterMap.set(rel.u2.id, clusterId);

    } else if (!u1Assigned && u2Assigned) {
      // CASE C: U2 is already in a cluster. U1 wants to join.
      const clusterId = userToClusterMap.get(rel.u2.id)!;
      clusters[clusterId].users.push(rel.u1);
      assigned.add(rel.u1.id);
      userToClusterMap.set(rel.u1.id, clusterId);
    }
    // CASE D: Both assigned. Do nothing (they are already in groups).
    // In a more complex algo, you might merge clusters here, but skip for now.
  });

  // 4. Handle Loners (Anyone not strong enough to join a group)
  users.forEach(user => {
    if (!assigned.has(user.id)) {
      // Create a solo cluster for them
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = GALAXY_RADIUS; 

      clusters.push({
        id: clusters.length,
        users: [user],
        center: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      });
    }
  });

  return clusters;
}

// Generate data with clustering
function generateGalaxyData(users: UserType[]): Node[] {
  const clusters = clusterUsers(users);
  const nodes: Node[] = [];

  clusters.forEach((cluster) => {
    cluster.users.forEach((user) => {
      // --- VISUAL FIX 2: Tight Grouping ---
      // Random offset is small (Jitter 4) relative to Galaxy Radius (20)
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * CLUSTER_JITTER,
        (Math.random() - 0.5) * CLUSTER_JITTER,
        (Math.random() - 0.5) * CLUSTER_JITTER
      );
      const position = cluster.center.clone().add(offset);
      nodes.push({
        user,
        x: position.x,
        y: position.y,
        z: position.z,
        vec: position,
        clusterId: cluster.id
      });
    });
  });
  return nodes;
}

// Calculate match percentage between current user and selected user
export function calculateMatchScore(currentUser: UserType, selectedUser: UserType): number {
  return Math.round(calculateSimilarity(currentUser, selectedUser) * 100);
}

export function GalaxyField({ 
  onSelect,
  users
}: { 
  onSelect: (node: Node | null) => void;
  users: UserType[];
}) {
  // Generate nodes only once
  const nodes = useMemo(() => {
    const generatedNodes = generateGalaxyData(users);
    return generatedNodes;
  }, [users]);

  // Safety check - return early if no nodes
  if (nodes.length === 0) {
    return null;
  }

  const textures = useTexture(nodes.map(node => node.user.profile_picture));
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Shared geometry - reuse across all meshes (8 segments instead of 32)
  const circleGeometry = useMemo(() => new THREE.CircleGeometry(0.5, 8), []);

  // --- Draw lines to mutuals (friends) ---
  // Get current user from mockData
  const currentUserId = mockData.current_user;
  const currentUserNode = nodes.find(n => n.user.id === currentUserId);

  // Get mutuals (friends) from the current user's mutuals attribute
  const currentUserMutualIds = currentUserNode?.user.mutuals || [];
  // Find nodes for each mutual friend
  const mutualNodes = nodes.filter(n => currentUserMutualIds.includes(n.user.id));

  return (
    <group
      onPointerMissed={() => {
        setHoveredId(null);
        onSelect(null);
      }}
    >
      {/* Draw lines from current user to mutuals (friends) */}
      {currentUserNode && mutualNodes.map((node, idx) => (
        <line key={"mutual-" + node.user.id}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                currentUserNode.x, currentUserNode.y, currentUserNode.z,
                node.x, node.y, node.z
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#A259FF" linewidth={0.5} />
        </line>
      ))}

      {nodes.map((node, i) => (
        <Billboard
          key={i}
          position={[node.x, node.y, node.z]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <mesh
            geometry={circleGeometry}
            scale={i === hoveredId ? [2.4, 2.4, 1] : [2, 2, 1]}
            onClick={(e) => {
              e.stopPropagation();
              setHoveredId(i);
              onSelect(nodes[i]);
            }}
          >
            <meshBasicMaterial map={textures[i]} side={THREE.FrontSide} transparent />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}


export function SocialGalaxy({ users }: { users: UserType[] }) {
  const [selectedUser, setSelectedUser] = useState<Node | null>(null);
  const { width, height } = useWindowDimensions();
  const [showProfile, setShowProfile] = useState(false);

  if (!users || users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>No attendees found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.canvasLayer, { width, height }]}> 
        <Suspense fallback={<Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Loading galaxy...</Text>}>
          <Canvas 
            camera={{ 
              position: [0, 0, 30], 
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            performance={{ min: 0.5 }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={["#000000"]} />
            <OrbitControls 
              makeDefault 
              enablePan={false} 
              enableZoom={true} 
              enableRotate={true} 
              rotateSpeed={2.0}
              zoomSpeed={0.5}
              minDistance={15}
              maxDistance={50}
              target={[0, 0, 0]}
            />
            <GalaxyField onSelect={setSelectedUser} users={users} />
          </Canvas>
        </Suspense>
      </View>

      <SafeAreaView style={styles.hudContainer} pointerEvents="box-none">
        <Text style={styles.header}>SOCIAL GALAXY</Text>
        
        {selectedUser ? (
          <>
            <View style={styles.card}>
              <Image source={{ uri: selectedUser.user.profile_picture }} style={styles.profileImage} />
              <Text style={styles.cardTitle}>{selectedUser.user.name}</Text>
              {/* Match Score */}
              {(() => {
                // Get current user from mockData
                const currentUserId = mockData.current_user;
                const currentUserData = mockData.users.find((u: any) => u.id === currentUserId);
                if (currentUserData) {
                  const score = require('./social-galaxy').calculateMatchScore(currentUserData, selectedUser.user);
                  return (
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16 }}>Match Score</Text>
                      <Text style={{ color: '#FFD700', fontSize: 20 }}>{score}%</Text>
                    </View>
                  );
                }
                return null;
              })()}
              <Text style={styles.cardBio}>{selectedUser.user.bio}</Text>
              <Text style={styles.cardStats}>
                Events attended: {selectedUser.user.events_gone_to.length} | Hot takes: {selectedUser.user.hot_take_answers.length}
              </Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => setShowProfile(true)}
              >
                <Text style={styles.buttonText}>View Full Profile</Text>
              </TouchableOpacity>
            </View>
            <Modal visible={showProfile} transparent animationType="fade" onRequestClose={() => setShowProfile(false)}>
              <OtherProfile user={selectedUser.user} onClose={() => setShowProfile(false)} />
            </Modal>
          </>
        ) : (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Tap a star to view profile</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvasLayer: { position: 'absolute', top: 0, left: 0, zIndex: 1 },
  hudContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 2 },
  header: { color: 'white', fontSize: 22, fontWeight: '900', letterSpacing: 2, marginTop: 10 },
  card: { backgroundColor: 'rgba(30, 30, 40, 0.95)', padding: 24, borderRadius: 20, width: '85%', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  cardTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  cardBio: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  cardStats: { color: '#FFD700', fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#4455aa', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  hint: { padding: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, marginBottom: 20 },
  hintText: { color: '#ccc', fontSize: 14 },
});