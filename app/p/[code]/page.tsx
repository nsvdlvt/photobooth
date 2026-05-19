"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useParams,
} from "next/navigation"

import { supabase }
from "@/lib/supabase"

type PhotoSession = {
  session_code: string
  image_url: string
  raw_images: string[]
  video_url?: string
}

export default function PhotoPage() {

  const params =
    useParams()

  const code =
    params?.code as string

  const [photo, setPhoto] =
    useState<PhotoSession | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  // LOAD
  useEffect(() => {

    if (!code)
      return

    loadPhoto()

  }, [code])

  // LOAD PHOTO
  const loadPhoto = async () => {

    const {
      data,
      error,
    } = await supabase
      .from("photo_sessions")
      .select("*")
      .eq(
        "session_code",
        code
      )
      .limit(1)

    console.log(data)
    console.log(error)

    if (error) {

      setLoading(false)

      return
    }

    if (data?.length) {

      setPhoto(data[0])
    }

    setLoading(false)
  }

  // LOADING
  if (loading) {

    return (

      <main className="
        min-h-screen
        bg-[#ffd9e6]
        flex
        items-center
        justify-center
      ">

        <p className="
          text-5xl
          font-black
          text-pink-500
          animate-pulse
        ">
          Loading... ✨
        </p>

      </main>
    )
  }

  // NOT FOUND
  if (!photo) {

    return (

      <main className="
        min-h-screen
        bg-[#ffd9e6]
        flex
        items-center
        justify-center
        p-6
      ">

        <div className="
          bg-white
          rounded-[40px]
          p-10
          shadow-2xl
          text-center
        ">

          <div className="
            text-7xl
            mb-5
          ">
            😭
          </div>

          <h1 className="
            text-5xl
            font-black
            text-pink-500
          ">
            Photo Not Found
          </h1>

        </div>

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

      <div className="
        max-w-7xl
        mx-auto
        flex
        flex-col
        gap-10
      ">

        {/* TITLE */}
        <div className="
          text-center
        ">

          <h1 className="
            text-5xl
            md:text-7xl
            font-black
            text-pink-500
          ">
            Your Photobooth ✨
          </h1>

          <p className="
            mt-4
            text-lg
            text-gray-500
          ">
            Session:
            {" "}
            <span className="
              text-pink-500
              font-black
            ">
              {photo.session_code}
            </span>
          </p>

        </div>

        {/* FINAL PHOTO */}
        <section className="
          bg-white
          rounded-[40px]
          p-8
          shadow-2xl
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-6
            mb-8
          ">

            <div>

              <h2 className="
                text-4xl
                font-black
                text-pink-500
              ">
                Final Photo 💖
              </h2>

              <p className="
                text-gray-500
                mt-2
              ">
                Your completed frame
              </p>

            </div>

            <a
              href={photo.image_url}
              download
              className="
                px-8
                py-4
                rounded-2xl
                bg-pink-500
                text-white
                font-black
                text-lg
                hover:scale-[1.02]
                transition
              "
            >
              Download Final ✨
            </a>

          </div>

          <img
            crossOrigin="anonymous"
            src={photo.image_url}
            alt=""
            className="
              w-full
              max-w-xl
              mx-auto
              rounded-[32px]
              shadow-xl
            "
          />

        </section>

        {/* RAW IMAGES */}
        <section className="
          bg-white
          rounded-[40px]
          p-8
          shadow-2xl
        ">

          <div className="
            mb-8
          ">

            <h2 className="
              text-4xl
              font-black
              text-pink-500
            ">
              Raw Photos 📸
            </h2>

            <p className="
              text-gray-500
              mt-2
            ">
              Original captured images
            </p>

          </div>

          {/* EMPTY */}
          {(!photo.raw_images ||
            photo.raw_images.length === 0) && (

            <div className="
              bg-[#fff1f6]
              rounded-[32px]
              py-20
              text-center
            ">

              <div className="
                text-7xl
                mb-6
              ">
                😭
              </div>

              <h3 className="
                text-3xl
                font-black
                text-pink-500
              ">
                No Raw Images
              </h3>

              <p className="
                mt-3
                text-gray-500
              ">
                Raw photos were not uploaded
              </p>

            </div>

          )}

          {/* RAW GRID */}
          {photo.raw_images &&
            photo.raw_images.length >
              0 && (

              <div className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-6
              ">

                {photo.raw_images.map(
                  (
                    image,
                    index
                  ) => (

                    <div
                      key={index}
                      className="
                        bg-[#fff1f6]
                        rounded-[28px]
                        p-4
                        shadow-lg
                      "
                    >

                      {/* IMAGE */}
                      <div className="
                        overflow-hidden
                        rounded-[20px]
                        bg-pink-100
                      ">

                        <img
                          crossOrigin="anonymous"
                          src={image}
                          alt=""
                          className="
                            w-full
                            h-auto
                            object-contain
                            block
                            rounded-[20px]
                          "
                          onError={(e) => {

                            console.log(
                              "RAW IMAGE ERROR:",
                              image
                            )

                            e.currentTarget.style.display =
                              "none"
                          }}
                        />

                      </div>

                      {/* INDEX */}
                      <div className="
                        mt-4
                        text-center
                        text-pink-500
                        font-black
                        text-lg
                      ">
                        Photo {
                          index + 1
                        }
                      </div>

                      {/* DOWNLOAD */}
                      <a
                        href={image}
                        download
                        className="
                          mt-4
                          block
                          w-full
                          py-3
                          rounded-2xl
                          bg-pink-500
                          text-white
                          text-center
                          font-black
                        "
                      >
                        Download
                      </a>

                    </div>

                  )
                )}

              </div>

            )}

        </section>

        {/* VIDEO */}
        {photo.video_url && (

          <section className="
            bg-white
            rounded-[40px]
            p-8
            shadow-2xl
          ">

            <div className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-6
              mb-8
            ">

              <div>

                <h2 className="
                  text-4xl
                  font-black
                  text-pink-500
                ">
                  Behind The Scenes 🎥
                </h2>

                <p className="
                  text-gray-500
                  mt-2
                ">
                  Your photobooth recording
                </p>

              </div>

              <a
                href={photo.video_url}
                download
                className="
                  px-8
                  py-4
                  rounded-2xl
                  bg-pink-500
                  text-white
                  font-black
                  text-lg
                  hover:scale-[1.02]
                  transition
                "
              >
                Download Video ✨
              </a>

            </div>

            <div className="
              overflow-hidden
              rounded-[32px]
              bg-black
              shadow-xl
            ">

              <video
                src={photo.video_url}
                controls
                playsInline
                className="
                  w-full
                  block
                "
              />

            </div>

          </section>

        )}

      </div>

    </main>
  )
}