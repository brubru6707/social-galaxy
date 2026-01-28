import { OrbitControls } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as THREE from 'three';

// --- Types ---
type Node = {
  id: string;
  matchScore: number;
  x: number;
  y: number;
  z: number;
  color: string;
  // We keep position as a Vector3 for easy math later
  vec: THREE.Vector3; 
};

const NODE_COUNT = 30; // Increased for more stars 
const TEMP_OBJECT = new THREE.Object3D(); // A dummy object to help with math

// Generate data once
function generateGalaxyData(): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 4 + Math.random() * 4; // Closer: 4-8 instead of 8-16 

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const score = Math.random();
    const isHighMatch = score > 0.7;

    nodes.push({
      id: `User ${i + 1}`,
      matchScore: score,
      x, y, z,
      vec: new THREE.Vector3(x, y, z),
      color: isHighMatch ? '#FFFF00' : '#00FFFF', // Neon Yellow / Cyan
    });
  }
  return nodes;
}

function GalaxyField({ 
  onSelect 
}: { 
  onSelect: (node: Node | null) => void 
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Generate nodes only once
  const nodes = useMemo(() => generateGalaxyData(), []);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // This effect runs whenever we select/hover to update colors/sizes
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const color = new THREE.Color();

    nodes.forEach((node, i) => {
      const isSelected = i === hoveredId;
      
      // 1. Position & Scale
      TEMP_OBJECT.position.copy(node.vec);
      // Scale up if selected
      const scale = isSelected ? 1.0 : 0.3; // Smaller stars: 0.3 base, 1.0 selected 
      TEMP_OBJECT.scale.set(scale, scale, scale);
      
      TEMP_OBJECT.updateMatrix();
      meshRef.current!.setMatrixAt(i, TEMP_OBJECT.matrix);

      // 2. Color
      if (isSelected) {
        color.set('#00FF00'); // Green when selected
      } else {
        color.set(node.color);
      }
      meshRef.current!.setColorAt(i, color);
    });

    // Tell GPU to update
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

  }, [nodes, hoveredId]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, NODE_COUNT]}
      onClick={(e) => {
        e.stopPropagation();
        // The instanceId tells us WHICH sphere was clicked
        const id = e.instanceId;
        if (id !== undefined) {
          setHoveredId(id);
          onSelect(nodes[id]);
        }
      }}
      onPointerMissed={() => {
        setHoveredId(null);
        onSelect(null);
      }}
    >
      {/* LOW POLY SPHERE (8,8) for max speed on mobile */}
      <sphereGeometry args={[1, 6, 6]} />
      {/* Basic Material = No Lighting Calculations = Fast */}
      <meshBasicMaterial />
    </instancedMesh>
  );
}

export default function SocialGalaxyFast() {
  const [selectedUser, setSelectedUser] = useState<Node | null>(null);
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={[styles.canvasLayer, { width, height }]}>
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 60 }}
          performance={{ min: 0.5 }}
          frameloop="demand" // Only render when something changes
        >
          <color attach="background" args={["#101015"]} />
          <OrbitControls makeDefault enablePan={false} enableZoom={true} enableRotate={true} rotateSpeed={2} />
          
          <GalaxyField onSelect={setSelectedUser} />
        </Canvas>
      </View>

      <SafeAreaView style={styles.hudContainer} pointerEvents="box-none">
        <Text style={styles.header}>SOCIAL GALAXY</Text>
        
        {selectedUser ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{selectedUser.id}</Text>
            <Text style={styles.cardScore}>
              Match: {Math.round(selectedUser.matchScore * 100)}%
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => console.log(`Open ${selectedUser.id}`)}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Tap a star to inspect</Text>
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
  cardTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  cardScore: { color: '#FFD700', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#4455aa', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  hint: { padding: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, marginBottom: 20 },
  hintText: { color: '#ccc', fontSize: 14 },
});