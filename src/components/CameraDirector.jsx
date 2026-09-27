import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const HOME_POSITION = new Vector3(0, 5.8, 13.4)
const HOME_TARGET = new Vector3(0, 1.1, 0)

export default function CameraDirector({ activeBooth }) {
  const { camera, invalidate } = useThree()
  const goalPosition = useRef(HOME_POSITION.clone())
  const goalTarget = useRef(HOME_TARGET.clone())
  const lookTarget = useRef(HOME_TARGET.clone())
  const moving = useRef(true)

  useEffect(() => {
    if (activeBooth) {
      goalPosition.current.fromArray(activeBooth.camera)
      goalTarget.current.fromArray(activeBooth.target)
    } else {
      goalPosition.current.copy(HOME_POSITION)
      goalTarget.current.copy(HOME_TARGET)
    }
    moving.current = true
    invalidate()
  }, [activeBooth, invalidate])

  useFrame((_, delta) => {
    if (!moving.current) return

    const positionAlpha = 1 - Math.exp(-delta * 4.8)
    const lookAlpha = 1 - Math.exp(-delta * 5.6)
    camera.position.lerp(goalPosition.current, positionAlpha)
    lookTarget.current.lerp(goalTarget.current, lookAlpha)
    camera.lookAt(lookTarget.current)

    const positionDone = camera.position.distanceToSquared(goalPosition.current) < 0.0009
    const targetDone = lookTarget.current.distanceToSquared(goalTarget.current) < 0.0009
    if (positionDone && targetDone) moving.current = false
    else invalidate()
  })

  return null
}
