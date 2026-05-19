"use client"

import Webcam from "react-webcam"
import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

export default function Home() {

  const webcamRef = useRef<Webcam>(null)

  const shutterAudio = useRef<HTMLAudioElement | null>(null)

  const layoutRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)

  const [flash, setFlash] = useState(false)

  const [images, setImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [layout, setLayout] = useState("2×3 (6 ảnh)")
  const [countdown, setCountdown] = useState("3s")

  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
const [selectedDevice, setSelectedDevice] = useState<string>("")

const [openCameraSelect, setOpenCameraSelect] = useState(false)

const cameraRef = useRef<HTMLDivElement>(null)
  const [openLayout, setOpenLayout] = useState(false)
  const [openCountdown, setOpenCountdown] = useState(false)

  useEffect(() => {
    shutterAudio.current = new Audio("/shutter.mp3")
  }, [])
useEffect(() => {

  const getDevices = async () => {

    const mediaDevices =
      await navigator.mediaDevices.enumerateDevices()

    const videoDevices = mediaDevices.filter(
      (device) => device.kind === "videoinput"
    )

    setDevices(videoDevices)

    if (videoDevices.length > 0) {
      setSelectedDevice(videoDevices[0].deviceId)
    }
  }

  getDevices()

}, [])
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
if (
  cameraRef.current &&
  !cameraRef.current.contains(event.target as Node)
) {
  setOpenCameraSelect(false)
}
      if (
        layoutRef.current &&
        !layoutRef.current.contains(event.target as Node)
      ) {
        setOpenLayout(false)
      }

      if (
        countdownRef.current &&
        !countdownRef.current.contains(event.target as Node)
      ) {
        setOpenCountdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])

  const triggerFlash = () => {

    setFlash(true)

    setTimeout(() => {
      setFlash(false)
    }, 150)
  }

  const capture = () => {

    triggerFlash()

    shutterAudio.current?.play()

    const screenshot = webcamRef.current?.getScreenshot()

    if (screenshot) {
      setPreviewImage(screenshot)
    }
  }

  const autoCapture = async () => {

    const seconds = parseInt(countdown)

    const remaining = 8 - images.length

    if (remaining <= 0) return

    for (let shot = 0; shot < remaining; shot++) {

      // countdown
      for (let i = seconds; i > 0; i--) {

        setCountdownNumber(i)

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        )
      }

      setCountdownNumber(null)

      // flash
      triggerFlash()

      // sound
      shutterAudio.current?.play()

      // capture
      const screenshot = webcamRef.current?.getScreenshot()

      if (screenshot) {

        setImages((prev) => {

          if (prev.length >= 8) return prev

          return [...prev, screenshot]
        })
      }

      // delay giữa các ảnh
      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      )
    }
  }

  return (
    <main className="
      min-h-screen
      overflow-hidden
      bg-gradient-to-br
      from-pink-100
      via-rose-50
      to-purple-100
      flex
      flex-col
      items-center
      p-6
      relative
    ">

      {/* background blobs */}
      <div className="
        absolute
        w-72
        h-72
        bg-pink-300/30
        blur-3xl
        rounded-full
        top-0
        left-0
      " />

      <div className="
        absolute
        w-72
        h-72
        bg-purple-300/30
        blur-3xl
        rounded-full
        bottom-0
        right-0
      " />

      {/* HEADER */}
      <div className="mb-10 text-center z-10">

        <h1 className="
          text-5xl
          md:text-6xl
          font-black
          text-pink-500
          drop-shadow
        ">
          ✨ NSVD's Memory Booth ✨
        </h1>

        <p className="text-zinc-500 mt-3 text-lg">
          Mỗi lần chụp 08 ảnh, sau đó chọn những bức đẹp nhất để in tùy theo layout 💖
        </p>

      </div>

      {/* MAIN LAYOUT */}
      <div className="
        flex
        flex-col
        lg:flex-row
        gap-8
        items-start
        justify-center
        w-full
        max-w-7xl
      ">

        {/* LEFT SIDE */}
        <div className="
          flex-1
          w-full
          flex
          flex-col
          items-center
        ">
{/* TOP CONTROLS */}
      <div className="
        flex
        gap-4
        mb-8
        flex-wrap
        items-end
        justify-center
        z-10
      ">

        {/* layout */}
        <div ref={layoutRef} className="relative">

          <p className="text-pink-500 font-bold mb-2">
            Layout Ảnh
          </p>

          <button
            onClick={() => setOpenLayout(!openLayout)}
            className="
              w-52
              px-5 py-3
              rounded-2xl
              bg-white/80
              backdrop-blur-xl
              border border-pink-200
              shadow-lg
              flex items-center justify-between
              hover:scale-[1.02]
              transition
            "
          >
            <span>{layout}</span>

            <ChevronDown size={20} />
          </button>

          {openLayout && (

            <div className="
              absolute
              mt-2
              w-52
              bg-white/90
              backdrop-blur-xl
              rounded-2xl
              shadow-2xl
              border border-pink-100
              overflow-hidden
              z-[999]
            ">

              {[
                "2×3 (6 ảnh)",
                "2×2 (4 ảnh)",
                "1×4 Strip",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() => {
                    setLayout(item)
                    setOpenLayout(false)
                  }}
                  className="
                    w-full
                    text-left
                    px-5 py-3
                    hover:bg-pink-100
                    transition
                  "
                >
                  {item}
                </button>

              ))}

            </div>

          )}

        </div>

        {/* countdown */}
        <div ref={countdownRef} className="relative">

          <p className="text-purple-500 font-bold mb-2">
            Đếm Ngược
          </p>

          <button
            onClick={() => setOpenCountdown(!openCountdown)}
            className="
              w-40
              px-5 py-3
              rounded-2xl
              bg-white/80
              backdrop-blur-xl
              border border-purple-200
              shadow-lg
              flex items-center justify-between
              hover:scale-[1.02]
              transition
            "
          >
            <span>{countdown}</span>

            <ChevronDown size={20} />
          </button>

          {openCountdown && (

            <div className="
              absolute
              mt-2
              w-40
              bg-white/90
              backdrop-blur-xl
              rounded-2xl
              shadow-2xl
              border border-purple-100
              overflow-hidden
              z-[999]
            ">

              {["3s", "5s", "10s"].map((item) => (

                <button
                  key={item}
                  onClick={() => {
                    setCountdown(item)
                    setOpenCountdown(false)
                  }}
                  className="
                    w-full
                    text-left
                    px-5 py-3
                    hover:bg-purple-100
                    transition
                  "
                >
                  {item}
                </button>

              ))}

            </div>

          )}

        </div>
{/* CAMERA SELECT */}
<div
  ref={cameraRef}
  className="
    relative
    mt-6
    z-20
  "
>

  <p className="
    text-blue-500
    font-bold
    mb-2
    text-center
  ">
    Camera
  </p>

  <button
    onClick={() =>
      setOpenCameraSelect(!openCameraSelect)
    }
    className="
      w-52
      px-5 py-3
      rounded-2xl
      bg-white/80
      backdrop-blur-xl
      border border-blue-200
      shadow-lg
      flex items-center justify-between
      hover:scale-[1.02]
      transition
    "
  >

    <span className="truncate">

      {devices.find(
        (d) => d.deviceId === selectedDevice
      )?.label || "Choose Camera"}

    </span>

    <ChevronDown size={20} />

  </button>

  {openCameraSelect && (

    <div className="
      absolute
      mt-2
      w-72
      bg-white/90
      backdrop-blur-xl
      rounded-2xl
      shadow-2xl
      border border-blue-100
      overflow-hidden
      z-[999]
      max-h-52
      overflow-y-auto
    ">

      {devices.map((device) => (

        <button
          key={device.deviceId}
          onClick={() => {

            setSelectedDevice(device.deviceId)

            setOpenCameraSelect(false)
          }}
          className="
            w-full
            text-left
            px-5 py-3
            hover:bg-blue-100
            transition
          "
        >
          {device.label || "Camera"}
        </button>

      ))}

    </div>

  )}

</div>
        {/* preview button */}
        <div className="flex items-end">

          <button
            className="
              px-6 py-3
              rounded-2xl
              bg-pink-200
              hover:bg-pink-300
              text-pink-700
              font-bold
              shadow-lg
              transition
              hover:scale-105
            "
          >
            Xem Khung
          </button>

        </div>
        </div>
          {/* CAMERA */}
          <div className="relative z-0 w-full flex justify-center">

            {/* stickers */}
            <div className="
              absolute
              -top-5
              -left-5
              text-4xl
              rotate-[-20deg]
              z-20
            ">
              💖
            </div>

            <div className="
              absolute
              -bottom-5
              -right-5
              text-4xl
              rotate-[15deg]
              z-20
            ">
              ✨
            </div>

            {/* countdown */}
            {countdownNumber !== null && (

              <div className="
                absolute
                inset-0
                flex items-center justify-center
                z-30
                pointer-events-none
              ">

                <div className="
                  w-28
                  h-28
                  rounded-full
                  bg-black/55
                  backdrop-blur-md
                  border-4
                  border-white/40
                  flex items-center justify-center
                  shadow-2xl
                ">

                  <span className="
                    text-5xl
                    font-black
                    text-white
                    animate-pulse
                  ">
                    {countdownNumber}
                  </span>

                </div>

              </div>

            )}

            <Webcam
  key={selectedDevice}
              ref={webcamRef}
              screenshotFormat="image/png"
              mirrored
              videoConstraints={{
  width: 1280,
  height: 720,
  deviceId: {
  exact: selectedDevice,
},
}}
              className="
                w-full
                max-w-4xl
                aspect-video
                rounded-[32px]
                border-8
                border-white/70
                shadow-2xl
                backdrop-blur-xl
                hover:scale-[1.01]
                transition
                duration-300
              "
            />

          </div>

          {/* BUTTONS */}
          
          <div className="
            w-full
            flex
            gap-4
            mt-8
            z-10
            flex-wrap
            justify-center
            items-center
          ">

            {/* manual */}
            <button
              onClick={capture}
              className="
                h-[58px]
                px-8
                rounded-full
                bg-pink-400
                hover:bg-pink-500
                text-white
                font-bold
                shadow-lg
                transition
                hover:scale-105
              "
            >
              📸 Chụp thủ công
            </button>

            {/* auto */}
            <button
              onClick={autoCapture}
              className="
                h-[58px]
                px-8
                rounded-full
                bg-purple-400
                hover:bg-purple-500
                text-white
                font-bold
                shadow-lg
                transition
                hover:scale-105
              "
            >
              ⏳ Chụp tự động
            </button>

            {/* reset */}
            <button
              onClick={() => {
                setImages([])
                setPreviewImage(null)
              }}
              className="
                h-[58px]
                px-8
                rounded-full
                bg-white/70
                backdrop-blur-md
                text-zinc-700
                font-semibold
                shadow-lg
                hover:scale-105
                transition
              "
            >
              Reset
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="
          w-full
          lg:w-[360px]
          lg:sticky
          lg:top-8
          min-h-[520px]
          bg-white/60
          backdrop-blur-xl
          rounded-[32px]
          border border-white/50
          shadow-2xl
          p-6
          z-10
        ">

          <div className="
  flex
  items-center
  justify-between
  mb-6
">

  <h2 className="
    text-2xl
    font-black
    text-pink-500
  ">
    Preview ✨
  </h2>

  {images.length >= 4 && (

    <button
      className="
        px-4 py-2
        rounded-xl
        bg-pink-400
        hover:bg-pink-500
        text-white
        text-sm
        font-bold
        shadow-lg
        transition
        hover:scale-105
      "
    >
      🎞️ Tạo ảnh
    </button>

  )}

</div>

          {images.length > 0 ? (

            <div className="
              grid
              grid-cols-1
              gap-4
            ">

              {images.map((img, index) => (

                <div
                  key={index}
                  className="relative"
                >

                  <img
                    src={img}
                    alt={`capture-${index}`}
                    className="
                      w-full
                      aspect-video
                      object-contain
                      rounded-2xl
                      border-4
                      border-white
                      shadow-md
                    "
                  />

                  <button
                    onClick={() => {
                      setImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }}
                    className="
                      absolute
                      top-3
                      right-3
                      w-10
                      h-10
                      rounded-full
                      bg-black/50
                      text-white
                      font-black
                      hover:bg-red-500
                      transition
                    "
                  >
                    ✕
                  </button>

                </div>

              ))}

            </div>

          ) : (

            <div className="
              aspect-[3/4]
              rounded-3xl
              border-2
              border-dashed
              border-pink-200
              flex
              items-center
              justify-center
              text-zinc-400
              text-center
              p-6
            ">

              <div className="
                flex
                flex-col
                items-center
                gap-4
              ">

                <div className="text-6xl">
                  📸
                </div>

                <p>
                  Your captured photo will appear here 💖
                </p>

              </div>

            </div>

          )}

          <div className="
            mt-6
            text-center
            text-sm
            text-zinc-500
          ">
            {images.length}/8 photos captured ✨
          </div>

        </div>

      </div>

      {/* FLASH */}
      {flash && (

        <div className="
          fixed
          inset-0
          bg-white
          z-[9997]
          pointer-events-none
          animate-pulse
        " />

      )}

      {/* PREVIEW MODAL */}
      {previewImage && (

        <div className="
          fixed
          inset-0
          bg-black/50
          backdrop-blur-md
          flex
          items-center justify-center
          z-[9999]
          p-6
        ">

          <div className="
  bg-white/95
  backdrop-blur-xl
  rounded-[40px]
  p-8
  w-[95vw]
  h-[92vh]
  shadow-2xl
  flex
  flex-col
">

            <h2 className="
              text-3xl
              font-black
              text-pink-500
              text-center
              mb-6
            ">
              Your Photo ✨
            </h2>

            <div className="
  flex-1
  flex
  items-center
  justify-center
  overflow-hidden
">

  <img
    src={previewImage}
    alt="preview"
    className="
      w-full
      h-full
      max-h-[70vh]
      object-contain
      rounded-[32px]
      border-4
      border-pink-100
      shadow-lg
      bg-black
    "
  />

</div>
<div className="
  flex
  gap-4
  mt-6
  pt-4
">
              {/* retake */}
              <button
                onClick={() => setPreviewImage(null)}
                className="
                  flex-1
                  py-4
                  rounded-2xl
                  bg-zinc-100
                  hover:bg-zinc-200
                  font-bold
                  transition
                "
              >
                Chụp lại
              </button>

              {/* save */}
              <button
                onClick={() => {

                  if (images.length >= 8) return

                  setImages((prev) => [
                    ...prev,
                    previewImage,
                  ])

                  setPreviewImage(null)

                }}
                className="
                  flex-1
                  py-4
                  rounded-2xl
                  bg-pink-400
                  hover:bg-pink-500
                  text-white
                  font-bold
                  shadow-lg
                  transition
                "
              >
                Lưu ảnh
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}