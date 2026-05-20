"use client"

import Webcam from "react-webcam"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Home() {

  const router = useRouter()

  const webcamRef =
    useRef<Webcam>(null)

  const shutterAudio =
    useRef<HTMLAudioElement | null>(
      null
    )

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    )

  const recordingStreamRef =
    useRef<MediaStream | null>(
      null
    )

  const recordedChunksRef =
    useRef<Blob[]>([])

  const stopAutoCaptureRef =
    useRef(false)

  const layoutRef =
    useRef<HTMLDivElement>(null)

  const countdownRef =
    useRef<HTMLDivElement>(null)

  const cameraRef =
    useRef<HTMLDivElement>(null)

  const [flash, setFlash] =
    useState(false)

  const [images, setImages] =
    useState<string[]>([])

  const [previewImage, setPreviewImage] =
    useState<string | null>(null)

  const [layout, setLayout] =
    useState("2×3 (6 ảnh)")

  const [countdown, setCountdown] =
    useState("3s")

  const [countdownNumber, setCountdownNumber] =
    useState<number | null>(null)

  const [recording, setRecording] =
    useState(false)

  const [autoMode, setAutoMode] =
    useState(false)

  const [enableRecap, setEnableRecap] =
    useState(true)

  const [devices, setDevices] =
    useState<MediaDeviceInfo[]>([])

  const [selectedDevice, setSelectedDevice] =
    useState("")

  const [openLayout, setOpenLayout] =
    useState(false)

  const [openCountdown, setOpenCountdown] =
    useState(false)

  const [openCameraSelect, setOpenCameraSelect] =
    useState(false)

  const [isMobile, setIsMobile] =
    useState(false)

  const [facingMode, setFacingMode] =
    useState<"user" | "environment">(
      "user"
    )

  const requiredPhotos =
    layout === "2×3 (6 ảnh)"
      ? 6
      : 4

  const cameraAspect =

  layout === "2×3 (6 ảnh)"
    ? "aspect-[4/3]"

  : layout === "2×2 (4 ảnh)"
    ? "aspect-[2/3]"

  : "aspect-[2/3]"

  useEffect(() => {

    shutterAudio.current =
      new Audio("/shutter.mp3")

  }, [])

  useEffect(() => {

    const mobileCheck =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      )

    setIsMobile(mobileCheck)

  }, [])

  useEffect(() => {

    const getDevices = async () => {

      const mediaDevices =
        await navigator.mediaDevices.enumerateDevices()

      const videoDevices =
        mediaDevices.filter(
          (device) =>
            device.kind === "videoinput"
        )

      setDevices(videoDevices)

      if (videoDevices.length > 0) {

        setSelectedDevice(
          videoDevices[0].deviceId
        )
      }
    }

    getDevices()

  }, [])

  useEffect(() => {

    const handleClickOutside =
      (event: MouseEvent) => {

        if (
          cameraRef.current &&
          !cameraRef.current.contains(
            event.target as Node
          )
        ) {

          setOpenCameraSelect(false)
        }

        if (
          layoutRef.current &&
          !layoutRef.current.contains(
            event.target as Node
          )
        ) {

          setOpenLayout(false)
        }

        if (
          countdownRef.current &&
          !countdownRef.current.contains(
            event.target as Node
          )
        ) {

          setOpenCountdown(false)
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
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

    const screenshot =
      webcamRef.current?.getScreenshot()

    if (screenshot) {

      setPreviewImage(screenshot)
    }
  }

  const startRecording =
    async () => {

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({

            video: {
              width: 640,
              height: 360,
              frameRate: 24,
            },

            audio: false,
          })

      recordingStreamRef.current =
        stream

      recordedChunksRef.current =
        []

      const mimeType =
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp9"
        )
          ? "video/webm;codecs=vp9"
          : "video/webm"

      const recorder =
        new MediaRecorder(
          stream,
          {
            mimeType,
            videoBitsPerSecond:
              250000,
          }
        )

      recorder.ondataavailable =
        (event) => {

          if (
            event.data.size > 0
          ) {

            recordedChunksRef.current.push(
              event.data
            )
          }
        }

      recorder.start()

      mediaRecorderRef.current =
        recorder

      setRecording(true)
    }

  const stopRecording =
    async (): Promise<Blob | null> => {

      return new Promise(
        (resolve) => {

          const recorder =
            mediaRecorderRef.current

          if (
            !recorder ||
            recorder.state ===
            "inactive"
          ) {

            resolve(null)

            return
          }

          recorder.onstop =
            () => {

              const blob =
                new Blob(
                  recordedChunksRef.current,
                  {
                    type:
                      "video/webm",
                  }
                )

              recordingStreamRef.current
                ?.getTracks()
                .forEach(
                  (track) =>
                    track.stop()
                )

              setRecording(false)

              resolve(blob)
            }

          recorder.stop()
        }
      )
    }

  const autoCapture =
    async () => {

      if (autoMode)
        return

      setAutoMode(true)

      stopAutoCaptureRef.current =
        false

      setImages([])

      const seconds =
        parseInt(countdown)

      const autoShots = 10

      if (enableRecap) {

        await startRecording()
      }

      for (
        let shot = 0;
        shot < autoShots;
        shot++
      ) {

        if (
          stopAutoCaptureRef.current
        ) {
          break
        }

        for (
          let i = seconds;
          i > 0;
          i--
        ) {

          if (
            stopAutoCaptureRef.current
          ) {

            setCountdownNumber(null)

            break
          }

          setCountdownNumber(i)

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000
              )
          )
        }

        if (
          stopAutoCaptureRef.current
        ) {
          break
        }

        setCountdownNumber(null)

        triggerFlash()

        shutterAudio.current?.play()

        const screenshot =
          webcamRef.current
            ?.getScreenshot()

        if (screenshot) {

          setImages(
            (prev) => [
              ...prev,
              screenshot,
            ]
          )
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              800
            )
        )
      }

      const videoBlob =
        enableRecap
          ? await stopRecording()
          : null

      if (videoBlob) {

        const sessionCode =
          Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()

        const fileName =
          `${sessionCode}.webm`

        await supabase.storage
          .from(
            "photobooth-videos"
          )
          .upload(
            fileName,
            videoBlob,
            {
              contentType:
                "video/webm",

              upsert: true,
            }
          )

        const { data } =
          supabase.storage
            .from(
              "photobooth-videos"
            )
            .getPublicUrl(
              fileName
            )

        localStorage.setItem(
          "photobooth-video",
          data.publicUrl
        )
      }

      setAutoMode(false)
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

      {/* FLASH */}
      {flash && (

        <div className="
          fixed
          inset-0
          bg-white
          z-[9999]
          animate-pulse
          pointer-events-none
        " />

      )}
{/* CONVERT MODE */}
{!isMobile && (

  <button
    onClick={() => {

      router.push("/admin")
    }}
    className="
      fixed
      top-6
      right-6
      z-[99999]

      px-5
      py-3

      rounded-2xl

      bg-white/80
      backdrop-blur-xl

      border
      border-pink-200

      shadow-xl

      text-pink-500
      font-black

      hover:scale-105
      hover:bg-pink-100

      transition
    "
  >
    👤 Admin
  </button>

)}
{/* GALLERY */}
{!isMobile && (

  <button
    onClick={() => {

      router.push("/full")
    }}
    className="
      fixed
      top-6
      left-6
      z-[99999]

      px-5
      py-3

      rounded-2xl

      bg-white/80
      backdrop-blur-xl

      border
      border-purple-200

      shadow-xl

      text-purple-500
      font-black

      hover:scale-105
      hover:bg-purple-100

      transition
    "
  >
    🔁 Switch Mode
  </button>

)}
      {/* HEADER */}
      <div className="
        mb-10
        text-center
        z-10
      ">

        <h1 className="
          text-5xl
          md:text-6xl
          font-black
          text-pink-500
        ">
          NSVD's Memory Booth
        </h1>

      </div>

      <div className="
        flex
        flex-col
        lg:flex-row
        gap-8
        w-full
        max-w-7xl
      ">

        {/* LEFT */}
        <div className="
          flex-1
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

  {/* LAYOUT */}
  <div
    ref={layoutRef}
    className="relative"
  >

    <p className="
      text-pink-500
      font-bold
      mb-2
    ">
      Layout Ảnh
    </p>

    <button
      onClick={() =>
        setOpenLayout(
          !openLayout
        )
      }
      className="
        w-52
        px-5
        py-3
        rounded-2xl
        bg-white/80
        backdrop-blur-xl
        border
        border-pink-200
        shadow-lg
        flex
        items-center
        justify-between
      "
    >

      <span>
        {layout}
      </span>

      <ChevronDown
        size={20}
      />

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
        border
        border-pink-100
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

              setOpenLayout(
                false
              )
            }}
            className="
              w-full
              text-left
              px-5
              py-3
              hover:bg-pink-100
            "
          >
            {item}
          </button>

        ))}

      </div>

    )}

  </div>

  {/* COUNTDOWN */}
  <div
    ref={countdownRef}
    className="relative"
  >

    <p className="
      text-purple-500
      font-bold
      mb-2
    ">
      Đếm Ngược
    </p>

    <button
      onClick={() =>
        setOpenCountdown(
          !openCountdown
        )
      }
      className="
        w-40
        px-5
        py-3
        rounded-2xl
        bg-white/80
        backdrop-blur-xl
        border
        border-purple-200
        shadow-lg
        flex
        items-center
        justify-between
      "
    >

      <span>
        {countdown}
      </span>

      <ChevronDown
        size={20}
      />

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
        border
        border-purple-100
        overflow-hidden
        z-[999]
      ">

        {[
          "3s",
          "5s",
          "10s",
        ].map((item) => (

          <button
            key={item}
            onClick={() => {

              setCountdown(
                item
              )

              setOpenCountdown(
                false
              )
            }}
            className="
              w-full
              text-left
              px-5
              py-3
              hover:bg-purple-100
            "
          >
            {item}
          </button>

        ))}

      </div>

    )}

  </div>

  {/* DESKTOP CAMERA */}
  {!isMobile && (

    <div
      ref={cameraRef}
      className="
        relative
      "
    >

      <p className="
        text-blue-500
        font-bold
        mb-2
      ">
        Camera
      </p>

      <button
        onClick={() =>
          setOpenCameraSelect(
            !openCameraSelect
          )
        }
        className="
          w-64
          px-5
          py-3
          rounded-2xl
          bg-white/80
          backdrop-blur-xl
          border
          border-blue-200
          shadow-lg
          flex
          items-center
          justify-between
        "
      >

        <span className="
          truncate
        ">

          {devices.find(
            (d) =>
              d.deviceId ===
              selectedDevice
          )?.label ||
            "Choose Camera"}

        </span>

        <ChevronDown
          size={20}
        />

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
          border
          border-blue-100
          overflow-hidden
          z-[999]
          max-h-52
          overflow-y-auto
        ">

          {devices.map(
            (device) => (

              <button
                key={
                  device.deviceId
                }
                onClick={() => {

                  setSelectedDevice(
                    device.deviceId
                  )

                  setOpenCameraSelect(
                    false
                  )
                }}
                className="
                  w-full
                  text-left
                  px-5
                  py-3
                  hover:bg-blue-100
                "
              >

                {device.label ||
                  "Camera"}

              </button>

            )
          )}

        </div>

      )}

    </div>

  )}

  {/* MOBILE SWITCH */}
  {isMobile && (

    <div className="
      flex
      gap-3
      items-end
    ">

      <button
        onClick={() =>
          setFacingMode(
            "user"
          )
        }
        className={`
          px-5
          py-3
          rounded-2xl
          font-bold
          shadow-lg

          ${
            facingMode ===
            "user"
              ? `
                bg-pink-400
                text-white
              `
              : `
                bg-white/80
                text-zinc-700
              `
          }
        `}
      >
        🤳 Cam trước
      </button>

      <button
        onClick={() =>
          setFacingMode(
            "environment"
          )
        }
        className={`
          px-5
          py-3
          rounded-2xl
          font-bold
          shadow-lg

          ${
            facingMode ===
            "environment"
              ? `
                bg-pink-400
                text-white
              `
              : `
                bg-white/80
                text-zinc-700
              `
          }
        `}
      >
        📷 Cam sau
      </button>

    </div>

  )}

</div>
          {/* CAMERA */}
          <div
  className={`
    relative
    overflow-hidden
    rounded-[32px]
    border-8
    border-white/70
    shadow-2xl
    bg-black

    ${
      layout === "2×2 (4 ảnh)"
        ? `
          w-[340px]
          h-[510px]
        `
        : `
          w-[720px]
          h-[405px]
        `
    }

    ${
      isMobile
        ? `
          w-[92vw]
          h-[72vh]
          max-w-[420px]
        `
        : ""
    }
  `}
>

            {/* COUNTDOWN */}
            {countdownNumber !== null && (

              <div className="
                absolute
                top-4
                right-4
                z-50
              ">

                <span className="
                  text-6xl
                  font-black
                  text-white
                  drop-shadow-[0_0_12px_rgba(0,0,0,1)]
                  animate-pulse
                ">
                  {countdownNumber}
                </span>

              </div>

            )}

            <Webcam
  ref={webcamRef}
  screenshotFormat="image/png"
  mirrored={
    isMobile
      ? facingMode === "user"
      : true
  }
  videoConstraints={
    isMobile
      ? {
          width: 720,
          height: 1280,
          facingMode: {
            exact: facingMode,
          },
        }
      : {
          width:
            layout === "2×2 (4 ảnh)"
              ? 900
              : 1280,

          height:
            layout === "2×2 (4 ảnh)"
              ? 1350
              : 720,

          deviceId: {
            exact: selectedDevice,
          },
        }
  }
  className="
    w-full
    h-full
    object-cover
  "
/>
</div>
          {/* BUTTONS */}
          <div className="
            flex
            gap-4
            flex-wrap
            justify-center
            mt-8
          ">

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
              "
            >
              📸 Chụp thủ công
            </button>

            <button
              disabled={autoMode}
              onClick={autoCapture}
              className="
                h-[58px]
                px-8
                rounded-full
                bg-purple-400
                hover:bg-purple-500
                text-white
                font-bold
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              ⏳ Chụp tự động
            </button>

            {/* VIDEO RECAP */}
            <button
              disabled={autoMode}
              onClick={() =>
                setEnableRecap(
                  !enableRecap
                )
              }
              className={`
                h-[58px]
                px-8
                rounded-full
                font-bold
                shadow-lg
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed

                ${
                  enableRecap
                    ? `
                      bg-pink-400
                      text-white
                    `
                    : `
                      bg-white/70
                      text-zinc-700
                    `
                }
              `}
            >
              🎥 Video Recap:
              {" "}
              {enableRecap
                ? "ON"
                : "OFF"}
            </button>

            {/* RESET */}
            <button
              onClick={async () => {

                stopAutoCaptureRef.current =
                  true

                setCountdownNumber(
                  null
                )

                if (
                  recording &&
                  mediaRecorderRef.current
                    ?.state !==
                  "inactive"
                ) {

                  await stopRecording()
                }

                setImages([])
                setPreviewImage(
                  null
                )

                setAutoMode(false)
              }}
              className="
                h-[58px]
                px-8
                rounded-full
                bg-white/70
                text-zinc-700
                font-bold
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
  border
  border-white/50
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

    {images.length >= requiredPhotos && (

      <button
        onClick={() => {

          localStorage.setItem(
            "photobooth-images",
            JSON.stringify(images)
          )

          localStorage.setItem(
            "photobooth-layout",
            layout
          )

          router.push("/download")
        }}
        className="
          px-4
          py-2
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
          className="
            relative
          "
        >

          <img
            src={img}
            alt={`capture-${index}`}
            className={`
              w-full
              ${
                layout === "2×2 (4 ảnh)"
                  ? "aspect-[3/4]"
                  : "aspect-video"
              }
              object-cover
              rounded-2xl
              border-4
              border-white
              shadow-md
            `}
          />

          <button
            onClick={() => {

              setImages((prev) =>
                prev.filter(
                  (_, i) =>
                    i !== index
                )
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

    <div className={`
      ${
        layout === "2×2 (4 ảnh)"
          ? "aspect-[3/4]"
          : "aspect-video"
      }
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
    `}>

      <div className="
        flex
        flex-col
        items-center
        gap-4
      ">

        <div className="
          text-6xl
        ">
          📸
        </div>

        <p>
          Your captured photo
          will appear here 💖
        </p>

      </div>

    </div>

  )}

  <div className={`
    mt-6
    text-center
    text-sm
    font-semibold
    transition
    ${
      images.length >=
      requiredPhotos
        ? "text-pink-500"
        : "text-zinc-500"
    }
  `}>

    {images.length}/
    {requiredPhotos}
    {" "}
    photos needed ✨

  </div>

</div>
      </div>
{/* PREVIEW MODAL */}
{previewImage && (

  <div className="
    fixed
    inset-0
    bg-black/50
    backdrop-blur-md
    flex
    items-center
    justify-center
    z-[9999]
    p-6
  ">

    <div className={`
      bg-white/95
      backdrop-blur-xl
      rounded-[40px]
      p-8
      shadow-2xl
      flex
      flex-col
      ${
        layout === "2×2 (4 ảnh)"
          ? "w-[520px]"
          : "w-[1000px]"
      }
      max-w-[95vw]
    `}>

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
        flex
        items-center
        justify-center
        overflow-hidden
      ">

        <img
          src={previewImage}
          alt="preview"
          className={`
            w-full
            ${
              isMobile
                ? "aspect-[3/4]"
                : "max-h-[70vh]"
            }
            object-cover
            rounded-[32px]
            border-4
            border-pink-100
            shadow-lg
            bg-black
          `}
        />

      </div>

      <div className="
        flex
        gap-4
        mt-6
        pt-4
      ">

        {/* RETAKE */}
        <button
          onClick={() =>
            setPreviewImage(null)
          }
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

        {/* SAVE */}
        <button
          disabled={
            images.length >= 10
          }
          onClick={() => {

            if (
              images.length >= 10
            ) return

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
            disabled:opacity-50
            disabled:cursor-not-allowed
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