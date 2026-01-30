import { Billboard, OrbitControls, useTexture } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as THREE from 'three';
// import MOCK_DB from '../assets/mock_data.json';



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
};

// Generate data once
function generateGalaxyData(users: UserType[]): Node[] {
  const nodes: Node[] = [];
  const NODE_COUNT = users.length;
  for (let i = 0; i < NODE_COUNT; i++) {
    const user = users[i];
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 4 + Math.random() * 4; // Closer: 4-8 instead of 8-16 

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    nodes.push({
      user,
      x, y, z,
      vec: new THREE.Vector3(x, y, z),
    });
  }
  return nodes;
}

export function GalaxyField({ 
  onSelect,
  users
}: { 
  onSelect: (node: Node | null) => void;
  users: UserType[];
}) {
  console.log('GalaxyField rendering with users:', users.length);
  
  // Generate nodes only once
  const nodes = useMemo(() => generateGalaxyData(users), [users]);
  
  // Safety check - return early if no nodes
  if (nodes.length === 0) {
    return null;
  }
  
  const textures = useTexture(nodes.map(node => node.user.profile_picture));
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  // Shared geometry - reuse across all meshes (8 segments instead of 32)
  const circleGeometry = useMemo(() => new THREE.CircleGeometry(0.5, 8), []);

  return (
    <group
      onPointerMissed={() => {
        setHoveredId(null);
        onSelect(null);
      }}
    >
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
            scale={i === hoveredId ? [1.2, 1.2, 1] : [1, 1, 1]}
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

  console.log('SocialGalaxy rendering with users:', users.length);
  console.log('Users data sample:', users.slice(0, 3).map(u => u.name));

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
            camera={{ position: [0, 0, 30], fov: 60 }}
            performance={{ min: 0.5 }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={["#101015"]} />
            <OrbitControls makeDefault enablePan={false} enableZoom={true} enableRotate={true} rotateSpeed={2} zoomSpeed={0.1} />
            <GalaxyField onSelect={setSelectedUser} users={users} />
          </Canvas>
        </Suspense>
      </View>

      <SafeAreaView style={styles.hudContainer} pointerEvents="box-none">
        <Text style={styles.header}>SOCIAL GALAXY</Text>
        
        {selectedUser ? (
          <View style={styles.card}>
            <Image source={{ uri: selectedUser.user.profile_picture }} style={styles.profileImage} />
            <Text style={styles.cardTitle}>{selectedUser.user.name}</Text>
            <Text style={styles.cardBio}>{selectedUser.user.bio}</Text>
            <Text style={styles.cardStats}>
              Events attended: {selectedUser.user.events_gone_to.length} | Hot takes: {selectedUser.user.hot_take_answers.length}
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => console.log(`Open profile for ${selectedUser.user.name}`)}
            >
              <Text style={styles.buttonText}>View Full Profile</Text>
            </TouchableOpacity>
          </View>
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