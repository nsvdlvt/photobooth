"use client"

import Webcam from "react-webcam"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

export default function FullPage() {
const [isDesktop, setIsDesktop] =
  useState(false)

useEffect(() => {

  setIsDesktop(
    window.innerWidth >= 1024
  )

}, [])
  const router = useRouter()
const [enableRecap, setEnableRecap] =
  useState(true)
  const [capturing, setCapturing] =
  useState(false)
  const webcamRef =
    useRef<Webcam>(null)
    const mediaRecorderRef =
  useRef<MediaRecorder | null>(
    null
  )

const recordedChunksRef =
  useRef<Blob[]>([])
const previewTimerRef =
  useRef<NodeJS.Timeout | null>(
    null
  )
  const previewResolveRef =
  useRef<
    (() => void) | null
  >(null)
  const shutterAudio =
    useRef<HTMLAudioElement | null>(
      null
    )

  const [images, setImages] =
    useState<string[]>([])

  const [previewImage, setPreviewImage] =
    useState<string | null>(null)
    const previewImageRef =
  useRef<string | null>(null)
const [waitingPreviewClose, setWaitingPreviewClose] =
  useState(false)
  const [saveCountdown, setSaveCountdown] =
    useState(5)

  const [countdownNumber, setCountdownNumber] =
    useState<number | null>(null)

  const [layout, setLayout] =
    useState("2×3 (6 ảnh)")

  const [countdown, setCountdown] =
    useState("5s")

  const [devices, setDevices] =
    useState<MediaDeviceInfo[]>([])

  const [selectedDevice, setSelectedDevice] =
    useState("")

  const [openLayout, setOpenLayout] =
    useState(false)

  const [openCountdown, setOpenCountdown] =
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

  useEffect(() => {

    shutterAudio.current =
      new Audio("/shutter.mp3")

  }, [])
useEffect(() => {

  previewImageRef.current =
    previewImage

}, [previewImage])
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
        await navigator
          .mediaDevices
          .enumerateDevices()

      const videoDevices =
        mediaDevices.filter(
          (device) =>
            device.kind ===
            "videoinput"
        )

      setDevices(videoDevices)

      if (
        videoDevices.length > 0
      ) {

        setSelectedDevice(
          videoDevices[0].deviceId
        )
      }
    }

    getDevices()

  }, [])

  const startPreviewTimer =
  async (
    image: string
  ): Promise<void> => {

    return new Promise(
      (resolve) => {
previewResolveRef.current =
  resolve
        setPreviewImage(image)

setWaitingPreviewClose(true)

        let time = 5

        setSaveCountdown(time)

        if (
          previewTimerRef.current
        ) {

          clearInterval(
            previewTimerRef.current
          )
        }

        previewTimerRef.current =
          setInterval(() => {

            time--

            setSaveCountdown(time)

            if (time <= 0) {

              if (
                previewTimerRef.current
              ) {

                clearInterval(
                  previewTimerRef.current
                )
              }

              setImages((prev) => [
                ...prev,
                image,
              ])
              previewImageRef.current = null
              setPreviewImage(null)

setWaitingPreviewClose(false)

previewResolveRef.current?.()
previewResolveRef.current =
  null
            }

          }, 1000)
      }
    )
  }
  const capture =
  async (): Promise<void> => {

    const seconds =
      parseInt(countdown)

    for (
      let i = seconds;
      i > 0;
      i--
    ) {

      setCountdownNumber(i)

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1000
          )
      )
    }

    setCountdownNumber(null)

    shutterAudio.current?.play()

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          150
        )
    )

    const screenshot =
      webcamRef.current
        ?.getScreenshot()

    if (!screenshot)
      return

    await startPreviewTimer(
      screenshot
    )
  }
  const startRecording =
  async () => {

    const stream =
      webcamRef.current
        ?.video
        ?.srcObject as MediaStream

    if (!stream)
      return

    recordedChunksRef.current =
      []

    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType:
            "video/webm",
        }
      )

    recorder.ondataavailable =
      (event) => {

        if (
          event.data.size > 0
        ) {

          recordedChunksRef.current
            .push(event.data)
        }
      }

    recorder.start()

    mediaRecorderRef.current =
      recorder
  }
  const stopRecording =
  async () => {

    return new Promise<Blob>(
      (resolve) => {

        const recorder =
          mediaRecorderRef.current

        if (!recorder)
          return

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

            resolve(blob)
          }

        recorder.stop()
      }
    )
  }
if (!isDesktop) {

  return (

    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-pink-100
      via-rose-50
      to-purple-100
      p-6
    ">

      <div className="
        bg-white
        rounded-[32px]
        shadow-2xl
        p-10
        max-w-md
        text-center
      ">

        <div className="text-7xl mb-5">
          💻
        </div>

        <h1 className="
          text-4xl
          font-black
          text-pink-500
          mb-4
        ">
          Desktop Only
        </h1>

        <p className="
          text-zinc-500
          text-lg
          leading-relaxed
        ">
          Trang Full Mode chỉ hỗ trợ
          trên máy tính để có trải nghiệm
          photobooth tốt nhất ✨
        </p>

      </div>

    </main>
  )
}
  return (

    <main className="
      min-h-screen
      bg-[#fdf0f6]
      p-6
      overflow-hidden
    ">

      <div className="
        flex
        items-start
        gap-6
      ">

        {/* LEFT */}
        <div className="
          flex-1
        ">

          {/* CAMERA */}
          <div className={`
  relative
  w-full
  "w-24 aspect-[3/4]"
  
  rounded-[40px]
  overflow-hidden
  border-[14px]
  border-zinc-300
  bg-black
  shadow-2xl
`}>

            {/* COUNTDOWN */}
            {countdownNumber !== null && (

              <div className="
                absolute
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/30
              ">

                <span className="
                  text-white
                  text-[200px]
                  font-black
                  animate-pulse
                ">
                  {countdownNumber}
                </span>

              </div>

            )}

            <Webcam
  key={
    isMobile
      ? facingMode
      : selectedDevice
  }
  ref={webcamRef}
  forceScreenshotSourceSize
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
                        exact:
                          facingMode,
                      },
                    }
                  : {
                      width: 1280,
                      height: 720,

                      deviceId: {
                        exact:
                          selectedDevice,
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

          {/* PREVIEW BAR */}
          <div className="
            mt-6
            rounded-[28px]
            bg-white/70
            min-h-[120px]
            p-6
            shadow-xl
            flex
            items-start
            justify-between
          ">

            <div>

              <h2 className="
                text-3xl
                font-black
                text-pink-500
              ">
                Preview ✨
              </h2>
<div className="
  mt-4
  flex
  gap-4
  overflow-x-auto
  pb-2
">

  {images.map(
    (img, index) => (

      <img
        key={index}
        src={img}
        className="
          w-32
          h-24
          object-cover
          rounded-2xl
          border-4
          border-white
          shadow-lg
          flex-shrink-0
        "
      />

    )
  )}

</div>
            </div>

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

                  router.push(
                    "/download"
                  )
                }}
                className="
                  px-5
                  py-3
                  rounded-2xl
                  bg-pink-400
                  text-white
                  font-black
                  shadow-lg
                "
              >
                🎞️ Tạo ảnh
              </button>

            )}

          </div>

        </div>

        {/* RIGHT */}
        <div className="
          w-[220px]
          flex
          flex-col
          gap-5
        ">

          {/* CAMERA */}
          {!isMobile && (

            <div>

              <p className="
                text-blue-500
                font-bold
                mb-2
              ">
                Camera
              </p>

              <select
                value={
                  selectedDevice
                }
                onChange={(e) =>
                  setSelectedDevice(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-4
                  rounded-2xl
                  bg-white
                  shadow-lg
                "
              >

                {devices.map(
                  (device) => (

                    <option
                      key={
                        device.deviceId
                      }
                      value={
                        device.deviceId
                      }
                    >
                      {device.label}
                    </option>

                  )
                )}

              </select>

            </div>

          )}

          {/* LAYOUT */}
          <div className="
            relative
          ">

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
                w-full
                px-4
                py-4
                rounded-2xl
                bg-white
                shadow-lg
                flex
                items-center
                justify-between
              "
            >

              {layout}

              <ChevronDown />

            </button>

            {openLayout && (

              <div className="
                absolute
                top-full
                mt-2
                w-full
                bg-white
                rounded-2xl
                shadow-2xl
                overflow-hidden
                z-50
              ">

                {[
                 "2×3 (6 ảnh)",
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
                      px-4
                      py-4
                      text-left
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
          <div className="
            relative
          ">

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
                w-full
                px-4
                py-4
                rounded-2xl
                bg-white
                shadow-lg
                flex
                items-center
                justify-between
              "
            >

              {countdown}

              <ChevronDown />

            </button>

            {openCountdown && (

              <div className="
                absolute
                top-full
                mt-2
                w-full
                bg-white
                rounded-2xl
                shadow-2xl
                overflow-hidden
                z-50
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
                      px-4
                      py-4
                      text-left
                      hover:bg-purple-100
                    "
                  >
                    {item}
                  </button>

                ))}

              </div>

            )}

          </div>

          {/* BUTTONS */}
          <button
  disabled={capturing}
  onClick={async () => {

    setCapturing(true)

    await capture()

    setCapturing(false)
  }}
  className="
    h-[64px]
    rounded-full
    bg-pink-400
    text-white
    font-black
    shadow-xl
    text-lg
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  📸 Chụp thủ công
</button>

          <button
  disabled={capturing}
  onClick={async () => {
    setCapturing(true)

if (enableRecap) {

  await startRecording()
}

    for (
      let i = 0;
      i < requiredPhotos;
      i++
    ) {

      await capture()
      // ĐỢI PREVIEW ĐÓNG
      await new Promise<void>(
        (resolve) => {

          const interval =
            setInterval(() => {

              if (
  !previewImageRef.current
){

                clearInterval(
                  interval
                )

                resolve()
              }

            }, 100)
        }
      )

      // nghỉ nhẹ
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            300
          )
      )
      
    }
     if (enableRecap) {

      const blob =
        await stopRecording()

      const videoUrl =
        URL.createObjectURL(
          blob
        )

      localStorage.setItem(
        "photobooth-video",
        videoUrl
      )
    }

    setCapturing(false)
  }}
  className="
    h-[64px]
    rounded-full
    bg-purple-400
              text-white
              font-black
              shadow-xl
              text-lg
              disabled:opacity-50
disabled:cursor-not-allowed
            "
          >
            ⏳ Chụp tự động
          </button>

          <button
  disabled={capturing}
  onClick={() =>
    setEnableRecap(
      !enableRecap
    )
  }
  className={`
    h-[64px]
    rounded-full
    text-white
    font-black
    shadow-xl
    text-lg
disabled:opacity-50
disabled:cursor-not-allowed
    ${
      enableRecap
        ? `
          bg-pink-400
        `
        : `
          bg-zinc-400
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

          <button
  disabled={capturing}
  onClick={() => {

  if (
    previewTimerRef.current
  ) {

    clearInterval(
      previewTimerRef.current
    )
  }

  previewImageRef.current =
    null

  setPreviewImage(null)

  setImages([])

  setCountdownNumber(null)

  setWaitingPreviewClose(false)
}}
            className="
              h-[64px]
              rounded-full
              bg-white
              text-zinc-700
              font-black
              shadow-xl
              disabled:opacity-50
disabled:cursor-not-allowed
            "
          >
            Reset
          </button>

        </div>

      </div>

      {/* PREVIEW MODAL */}
      {previewImage && (

        <div className="
          fixed
          inset-0
          bg-black/60
          backdrop-blur-md
          flex
          items-center
          justify-center
          z-[99999]
        ">

          <div className="
            bg-white
            rounded-[40px]
            p-8
            w-[900px]
            max-w-[95vw]
            shadow-2xl
          ">

            <img
              src={previewImage}
              className="
                w-full
                max-h-[70vh]
                object-cover
                rounded-[32px]
              "
            />

            <div className="
              flex
              gap-4
              mt-6
            ">

              {/* RETAKE */}
              <button
               onClick={() => {

  if (
    previewTimerRef.current
  ) {

    clearInterval(
      previewTimerRef.current
    )
  }

  previewImageRef.current =
    null

  setPreviewImage(null)

  setWaitingPreviewClose(false)

  previewResolveRef.current?.()

  previewResolveRef.current =
    null
}}
                className="
                  flex-1
                  py-5
                  rounded-2xl
                  bg-zinc-100
                  font-black
                  text-xl
                "
              >
                Chụp lại
              </button>

              {/* SAVE */}
              <button
               onClick={() => {

  if (
    previewTimerRef.current
  ) {

    clearInterval(
      previewTimerRef.current
    )
  }

  if (!previewImage)
    return

  setImages((prev) => [
    ...prev,
    previewImage,
  ])

  previewImageRef.current =
    null

  setPreviewImage(null)

  setWaitingPreviewClose(false)

  // QUAN TRỌNG 😭🔥
  previewResolveRef.current?.()

  previewResolveRef.current =
    null
}}
                className="
                  flex-1
                  py-5
                  rounded-2xl
                  bg-pink-400
                  text-white
                  font-black
                  text-xl
                "
              >
                Lưu ảnh ({saveCountdown}s)
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}