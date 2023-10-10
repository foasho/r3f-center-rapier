import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

function App() {
  return (
    <>
      <Canvas shadows>
        <Scene />
      </Canvas>
    </>
  )
}

export default App
