import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [3, 2, 3] }} style={{ borderRadius: 20 }}>
        <Scene />
      </Canvas>
    </>
  )
}

export default App
