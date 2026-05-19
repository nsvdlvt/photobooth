"use client"

import Webcam from "react-webcam"
import { useRef, useState } from "react"
import { Camera } from "lucide-react"

export default function PhotoBoothPage() {
  const webcamRef = useRef<Webcam>(null)

  const [image, setImage] = useState<string | null>(null)

  const capture = () => {
    const screenshot = webcamRef.current?.getScreenshot()

    if (screenshot) {
      setImage(screenshot)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">

      <h1 className="text-5xl font-black mb-8">
        PhotoBooth
      </h1>

      <div className="w-full max-w-3xl">

        {!image ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            mirrored
            className="w-full rounded-3xl border-4 border-white"
          />
        ) : (
          <img
            src={image}
            alt="captured"
            className="w-full rounded-3xl border-4 border-white"
          />
        )}

      </div>

      <div className="flex gap-4 mt-8">

        <button
          onClick={capture}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition"
        >
          <Camera size={22} />
          Capture
        </button>

        <button
          onClick={() => setImage(null)}
          className="bg-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-600 transition"
        >
          Retake
        </button>

      </div>

    </main>
  )
}