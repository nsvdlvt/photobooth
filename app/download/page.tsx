"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { X, Download } from "lucide-react"
let domtoimage: any = null
import QRCode from "react-qr-code"

type Slot = {
  x: number
  y: number
  width: number
  height: number
}

type Frame = {
  id: string
  name: string
  image_url: string
  layout: string
  slots: Slot[]
}

type SelectedPhoto = {
  id: number
  src: string
}

export default function DownloadPage() {

  const [images, setImages] =
    useState<string[]>([])

  const [layout, setLayout] =
    useState("")

  const [frames, setFrames] =
    useState<Frame[]>([])

  const [loadingFrames, setLoadingFrames] =
    useState(true)

  const [selectedFrame, setSelectedFrame] =
    useState<Frame | null>(null)

  const [selectedPhotos, setSelectedPhotos] =
    useState<
      (
        | SelectedPhoto
        | null
      )[]
    >([])

  const [currentSlot, setCurrentSlot] =
    useState(0)
const [shareUrl, setShareUrl] =
  useState("")
  const [videoUrl, setVideoUrl] =
  useState("")
  // FRAME WIDTH
  const frameWidth =
    layout === "1×4 Strip"
      ? 350
      : 500

  // REQUIRED PHOTOS
  const requiredPhotos =
    layout === "2×3 (6 ảnh)"
      ? 6
      : 4

  // LOAD
  useEffect(() => {

    const storedImages =
      localStorage.getItem(
        "photobooth-images"
      )

    const storedLayout =
      localStorage.getItem(
        "photobooth-layout"
      )

    if (storedImages) {

      setImages(
        JSON.parse(storedImages)
      )
    }
const storedVideo =
  localStorage.getItem(
    "photobooth-video"
  )

if (storedVideo) {

  setVideoUrl(
    storedVideo
  )
}
    if (storedLayout) {

      setLayout(storedLayout)

      loadFrames(storedLayout)
    }

  }, [])

  // LOAD FRAMES
  const loadFrames = async (
    selectedLayout: string
  ) => {

    setLoadingFrames(true)

    const { data, error } =
  await supabase
    .from("frames")
    .select("*")
    .eq(
      "layout",
      selectedLayout
    )

    if (error) {

      console.error(error)

      setLoadingFrames(false)

      return
    }

    if (data) {

      setFrames(data)
    }

    setLoadingFrames(false)
  }

  // TOGGLE PHOTO
  const togglePhoto = (
    imageIndex: number,
    imageSrc: string
  ) => {

    if (!selectedFrame)
      return

    // EXIST?
    const existingSlot =
      selectedPhotos.findIndex(
        (photo) =>
          photo?.id === imageIndex
      )

    // REMOVE
    if (existingSlot !== -1) {

      const updated = [
        ...selectedPhotos
      ]

      updated[existingSlot] = null

      setSelectedPhotos(updated)

      setCurrentSlot(existingSlot)

      return
    }

    // ADD
    const updated = [
      ...selectedPhotos
    ]

    updated[currentSlot] = {
      id: imageIndex,
      src: imageSrc,
    }

    setSelectedPhotos(updated)

    // NEXT EMPTY SLOT
    const nextEmpty =
      updated.findIndex(
        (photo) => !photo
      )

    if (nextEmpty !== -1) {

      setCurrentSlot(nextEmpty)
    }
  }
// DOWNLOAD
const downloadImage = async () => {

  try {

    const frame =
      document.getElementById(
        "frame-preview"
      )

    if (!frame) {

      alert("No frame 😭")

      return
    }

    // CREATE IMAGE
    if (!domtoimage) {

  domtoimage =
    (
      await import(
        "dom-to-image-more"
      )
    ).default
}
    const dataUrl =
      await domtoimage.toPng(
        frame,
        {
          cacheBust: true,
          bgcolor:
            "#ffffff",
        }
      )

    // BLOB
    const blob =
      await (
        await fetch(dataUrl)
      ).blob()

    // RANDOM CODE
    const sessionCode =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
    const rawImageUrls: string[] =
  []

for (
  let i = 0;
  i < selectedPhotos.length;
  i++
) {

  const selected =
    selectedPhotos[i]

  if (!selected)
    continue

  // BLOB
  const rawBlob =
    await (
      await fetch(
        selected.src
      )
    ).blob()

  // FILE NAME
  const rawFileName =
    `${sessionCode}-raw-${i}.png`

  // UPLOAD
  const upload =
    await supabase.storage
      .from("photobooth-raw")
      .upload(
        rawFileName,
        rawBlob,
        {
          contentType:
            "image/png",
          upsert: true,
        }
      )

  console.log(upload)

  // URL
  const { data } =
    supabase.storage
      .from("photobooth-raw")
      .getPublicUrl(
        rawFileName
      )

  rawImageUrls.push(
    data.publicUrl
  )
}
    // FILE NAME
    const fileName =
      `${sessionCode}.png`

    // UPLOAD STORAGE
    const { error } =
      await supabase.storage
        .from(
          "photobooth-results"
        )
        .upload(
          fileName,
          blob,
          {
            contentType:
              "image/png",
          }
        )

    if (error) {

      console.error(error)

      alert(
        "Upload failed 😭"
      )

      return
    }

    // GET PUBLIC URL
    const { data } =
      supabase.storage
        .from(
          "photobooth-results"
        )
        .getPublicUrl(fileName)

    const imageUrl =
      data.publicUrl
   // SAVE DB
await supabase
  .from("photo_sessions")
  .insert({

    session_code:
      sessionCode,

    image_url:
      imageUrl,

    raw_images:
      rawImageUrls,

    video_url:
      videoUrl,

  })

    // FORCE DOWNLOAD
    const response =
      await fetch(imageUrl)

    const imageBlob =
      await response.blob()

    const blobUrl =
      URL.createObjectURL(
        imageBlob
      )

    const a =
      document.createElement("a")

    a.href = blobUrl

    a.download =
      `photobooth-${sessionCode}.png`

    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)

    URL.revokeObjectURL(
      blobUrl
    )

    // SHOW QR
    setShareUrl(
      `${window.location.origin}/p/${sessionCode}`
    )

  } catch (error) {

    console.error(error)

    alert(
      "Download failed 😭"
    )
  }
}
  // LOADING
  if (loadingFrames) {

    return (

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#ffd9e6]
      ">

        <p className="
          text-3xl
          font-black
          text-pink-500
          animate-pulse
        ">
          Loading frames... ✨
        </p>

      </main>
    )
  }

  return (

    <main className="
      min-h-screen
      bg-[#ffd9e6]
      p-6
      md:p-10
    ">

      {/* HEADER */}
      <div className="
        text-center
        mb-12
      ">

        <h1 className="
          text-5xl
          md:text-7xl
          font-black
          text-pink-500
        ">
          Choose Your Frame ✨
        </h1>

        <p className="
          text-gray-500
          mt-4
          text-lg
        ">
          Layout: {layout}
        </p>

      </div>

      {/* MAIN */}
      <div className="
        max-w-7xl
        mx-auto
        flex
        flex-col
        xl:flex-row
        gap-10
        items-start
      ">

        {/* LEFT */}
        <div className="
          flex-1
          w-full
        ">

          {/* FRAME LIST */}
          {!selectedFrame && (

            <>

              <h2 className="
                text-4xl
                font-black
                text-pink-500
                mb-8
              ">
                Select Frame 💖
              </h2>

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-8
              ">

                {frames.map((frame) => (

                  <button
                    key={frame.id}
                    onClick={() => {

                      setSelectedFrame(frame)

                      setSelectedPhotos(
                        Array(
                          requiredPhotos
                        ).fill(null)
                      )

                      setCurrentSlot(0)
                    }}
                    className="
                      group
                      bg-white
                      rounded-[32px]
                      p-4
                      shadow-xl
                      hover:scale-[1.02]
                      transition
                    "
                  >

                    <div className={`
                      overflow-hidden
                      rounded-[24px]
                      bg-[#ffd6e7]
                      ${
                        layout ===
                        "2×2 (4 ảnh)"
                          ? "aspect-[3/4]"
                          : "aspect-video"
                      }
                    `}>

                      <img
                        src={frame.image_url}
                        alt=""
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-105
                          transition
                          duration-300
                        "
                      />

                    </div>

                    <p className="
                      mt-4
                      text-xl
                      font-black
                      text-pink-500
                    ">
                      {frame.name}
                    </p>

                  </button>

                ))}

              </div>

            </>

          )}

          {/* PREVIEW */}
          {selectedFrame && (

            <div className="
              bg-white
              rounded-[40px]
              p-8
              shadow-2xl
            ">

              {/* TOP */}
              <div className="
                flex
                items-center
                justify-between
                mb-8
              ">

                <div>

                  <h2 className="
                    text-4xl
                    font-black
                    text-pink-500
                  ">
                    Preview ✨
                  </h2>

                  <p className="
                    text-gray-500
                    mt-2
                  ">
                    Click photos on right
                  </p>

                </div>

                <div className="
                  flex
                  items-center
                  gap-4
                ">

                  {/* SLOT */}
                  <div className="
                    px-5
                    py-3
                    rounded-2xl
                    bg-[#ffd6e7]
                    text-pink-500
                    font-black
                  ">
                    Slot {
                      currentSlot + 1
                    }
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={() => {

                      setSelectedFrame(null)

                      setSelectedPhotos([])
                    }}
                    className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-[#ffe1e1]
                      text-red-500
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <X size={22} />

                  </button>

                </div>

              </div>

              {/* FRAME */}
              <div
                id="frame-preview"
                className="
                  relative
                  mx-auto
                  overflow-hidden
                "
                style={{
                  width: frameWidth
                }}
              >

                {/* SLOT IMAGES */}
                {selectedFrame.slots?.map(
                  (
                    slot,
                    index
                  ) => {

                    const originalWidth =
                      700

                    const scale =
                      frameWidth /
                      originalWidth

                    return (

                      <div
                        key={index}
                        onClick={() =>
                          setCurrentSlot(
                            index
                          )
                        }
                        className={`
                          absolute
                          overflow-hidden
                          rounded-xl
                          transition
                          cursor-pointer
                          z-[1]
                          ${
                            currentSlot ===
                            index
                              ? "ring-4 ring-pink-500"
                              : ""
                          }
                        `}
                        style={{
                          left:
                            slot.x *
                            scale,

                          top:
                            slot.y *
                            scale,

                          width:
                            slot.width *
                            scale,

                          height:
                            slot.height *
                            scale,
                        }}
                      >

                        {/* PHOTO */}
                        {selectedPhotos[index] ? (

                          <img
                            crossOrigin="anonymous"
                            src={
                              selectedPhotos[index]
                                ?.src
                            }
                            alt=""
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />

                        ) : (

                          <div className="
                            w-full
                            h-full
                            bg-[#ffe6ef]
                            border-2
                            border-dashed
                            border-pink-300
                            flex
                            items-center
                            justify-center
                            text-pink-400
                            font-black
                            text-3xl
                          ">
                            {index + 1}
                          </div>

                        )}

                      </div>

                    )
                  }
                )}

                {/* FRAME PNG */}
                <img
                  crossOrigin="anonymous"
                  src={
                    selectedFrame.image_url
                  }
                  alt=""
                  className="
                    block
                    w-full
                    h-auto
                    relative
                    z-10
                    pointer-events-none
                  "
                />

              </div>

            </div>

          )}

        </div>

        {/* RIGHT */}
        <div className="
          w-full
          xl:w-[420px]
          bg-white
          rounded-[32px]
          p-6
          shadow-2xl
          sticky
          top-8
        ">

          <h2 className="
            text-4xl
            font-black
            text-pink-500
            text-center
            mb-8
          ">
            Your Photos 📸
          </h2>

          {/* PHOTOS */}
          <div className="
            grid
            grid-cols-2
            gap-4
          ">

            {images.map(
              (
                img,
                index
              ) => {

                const order =
                  selectedPhotos.findIndex(
                    (photo) =>
                      photo?.id ===
                      index
                  )

                const selected =
                  order !== -1

                return (

                  <button
                    key={index}
                    onClick={() =>
                      togglePhoto(
                        index,
                        img
                      )
                    }
                    className={`
                      relative
                      overflow-hidden
                      rounded-2xl
                      transition
                      ${
                        selected
                          ? `
                            ring-4
                            ring-pink-500
                            scale-[0.98]
                          `
                          : `
                            hover:scale-105
                          `
                      }
                    `}
                  >

                    {/* ORDER */}
                    {selected && (

                      <div className="
                        absolute
                        top-2
                        right-2
                        w-9
                        h-9
                        rounded-full
                        bg-pink-500
                        text-white
                        flex
                        items-center
                        justify-center
                        font-black
                        z-10
                      ">
                        {order + 1}
                      </div>

                    )}

                    <img
                      src={img}
                      alt=""
                      className={`
                        w-full
                        ${
                          layout ===
                          "2×2 (4 ảnh)"
                            ? "aspect-[3/4]"
                            : "aspect-video"
                        }
                        object-cover
                      `}
                    />

                  </button>

                )
              }
            )}

          </div>

          {/* COUNT */}
          <div className="
            mt-8
            text-center
            text-lg
            font-bold
            text-gray-500
          ">

            {
              selectedPhotos.filter(
                Boolean
              ).length
            }
            /
            {requiredPhotos}
            photos selected ✨

          </div>

          {/* DOWNLOAD */}
          <button
          
            onClick={downloadImage}
            disabled={
              selectedPhotos.filter(
                Boolean
              ).length <
              requiredPhotos
            }
            className={`
              mt-6
              w-full
              py-4
              rounded-2xl
              font-black
              text-lg
              transition
              flex
              items-center
              justify-center
              gap-3
              ${
                selectedPhotos.filter(
                  Boolean
                ).length >=
                requiredPhotos
                  ? `
                    bg-pink-500
                    text-white
                    hover:scale-[1.02]
                  `
                  : `
                    bg-gray-200
                    text-gray-400
                    cursor-not-allowed
                  `
              }
            `}
          >

            <Download size={22} />

            Download Photo

          </button>
{/* QR */}
{shareUrl && (

  <div className="
    mt-8
    bg-[#ffe6ef]
    rounded-[32px]
    p-6
    text-center
  ">

    <p className="
      text-2xl
      font-black
      text-pink-500
      mb-5
    ">
      Scan QR To Download ✨
    </p>

    <div className="
      bg-white
      p-4
      rounded-[24px]
      inline-block
    ">

      <QRCode
        value={shareUrl}
        size={180}
      />

    </div>

    <a
  href={shareUrl}
  target="_blank"
  className="
    mt-4
    block
    text-sm
    text-pink-500
    underline
    break-all
    hover:text-pink-700
  "
>
  {shareUrl}
</a>

  </div>

)}
        </div>

      </div>

    </main>
  )
}