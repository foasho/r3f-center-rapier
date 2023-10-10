
import { Physics, RigidBody, RapierRigidBody, BallCollider } from "@react-three/rapier";
import { type Vector } from "@dimforge/rapier3d";
import { OrbitControls, GizmoHelper, GizmoViewport, useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { easing } from "maath";

interface SceneProps {
  isGizmo?: boolean;
  isOrbit?: boolean;
}
export const Scene = (
  { 
    isGizmo=true,
    isOrbit=true
  }:SceneProps
) => {

  const connectors: ConnectorProps[] = [
    { modelProps: { color: '#a2cc89', roughness: 0.1}  },
    { modelProps: { color: '#a2cc89', roughness: 0.75 } },
    { modelProps: { color: '#a2cc89', roughness: 0.75 } },
    { modelProps: { color: '#80c8ef', roughness: 0.1 } },
    { modelProps: { color: '#80c8ef', roughness: 0.75 } },
    { modelProps: { color: '#ff4060', roughness: 0.1 }},
    { modelProps: {  color: '#ff4060', roughness: 0.1 }, accent: true },
    { modelProps: { color: '#ff4060', roughness: 0.75 }, accent: true },
    { modelProps: {  color: '#a2cc89', roughness: 0.1 }, accent: true },
    { modelProps: { color: '#80c8ef', roughness: 0.75 }, accent: true },

  ];

  return (
    <>
      <color attach="background" args={["#ececec"]} />
      <ambientLight intensity={0.75} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Physics gravity={[0, 0, 0]}>
        <Pointer />
        {connectors.map((connector, i) => (
          <Connector key={i} {...connector}>
            <Model {...connector.modelProps} />
          </Connector>
        ))}
        <Connector position={[10, 10, 5]}>
          <Model>
            <MeshTransmissionMaterial 
              clearcoat={1} 
              thickness={0.1} 
              anisotropicBlur={0.1} 
              chromaticAberration={0.1} 
              samples={8} 
              resolution={512} 
              distortionScale={0} 
              temporalDistortion={0} 
            />
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model>
            <MeshTransmissionMaterial 
              clearcoat={1} 
              thickness={0.1} 
              anisotropicBlur={0.1} 
              chromaticAberration={0.1} 
              samples={8} 
              resolution={512} 
              distortionScale={0} 
              temporalDistortion={0} 
            />
          </Model>
        </Connector>
      </Physics>
      {isOrbit && <OrbitControls />}
      {isGizmo &&
        <GizmoHelper alignment="top-right" margin={[75, 75]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
        </GizmoHelper>
      }
    </>
  )
}

type ConnectorProps = {
  position?: Vector3 | [number, number, number];
  children?: React.ReactNode;
  vec?: Vector3;
  accent?: boolean;
  r?: (n: number) => number;
  modelProps?: ModelProps;
};
const Connector = (
  {
    position,
    children,
    vec = new Vector3(),
    accent = false,
    r = MathUtils.randFloatSpread,
    modelProps,
  }: ConnectorProps
) => {

  const api = useRef<RapierRigidBody>(null);
  const pos: Vector3|[number, number, number] = useMemo(() => position || [r(10), r(10), r(10)], []);

  useFrame(() => {
    if (api.current) {
      const moveVec =  vec.copy(api.current.translation() as Vector3);
      const negateMoveVec = moveVec.negate().multiplyScalar(0.2);
      api.current.applyImpulse(negateMoveVec as Vector, false);
    }
  });

  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[0.5]} />
      {children ? children : <Model {...modelProps} />}
      {accent && <pointLight intensity={4} distance={2.5} color={modelProps? modelProps.color: "#FFF"} />}
    </RigidBody>
  )
}

/**
 * マウスの位置を追従するポインターコライダー
 */
const Pointer = ({ vec = new Vector3(), scale=1.0}: { 
  vec?: Vector3;
  scale?: number;
}) => {

  const  ref = useRef<RapierRigidBody>(null);

  useFrame(({ mouse, viewport }) => {
    if (ref.current) {
      ref.current.setNextKinematicTranslation(vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0));
    }
  });

  return (
    <RigidBody ref={ref} position={[0, 0, 0]} type="kinematicPosition" colliders={false}>
      <BallCollider args={[scale]} />
    </RigidBody>
  )
}

/**
 * 利用するModel
 */
type ModelProps = {
  children?: React.ReactNode;
  color?: string;
  roughness?: number;
};
const Model = (
  {
    children,
    color = "white",
    roughness = 0.75,
  }: ModelProps
) => {

  const ref = useRef<Mesh>(null);

  const { nodes, materials } = useGLTF("apple.gltf") as any;

  useFrame((_, delta) => {
    if (ref.current && ref.current.material){
      easing.dampC((ref.current.material as MeshStandardMaterial).color, color, 0.2, delta);
    }
  });

  return (
    // size: 0.17程度 1/0.17 = 5.88
    <group scale={5.88}>
      <mesh ref={ref} castShadow receiveShadow geometry={nodes.Mesh_apple.geometry}>
        <meshStandardMaterial color={color} roughness={roughness} />
        {children}
      </mesh>
      {children ? 
      <>
        <mesh geometry={nodes.Mesh_apple_1.geometry} >
          {children}
        </mesh>
        <mesh geometry={nodes.Mesh_apple_2.geometry}>
          {children}
        </mesh>
      </>
      : 
      <>
        <mesh geometry={nodes.Mesh_apple_1.geometry} material={materials.brown} />
        <mesh geometry={nodes.Mesh_apple_2.geometry} material={materials.green} />
      </>}
    </group>
  )
}