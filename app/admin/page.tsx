export const dynamic =
  "force-dynamic"
"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  Upload,
  Crop,
  Move,
  Trash2,
  Pencil,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

type Slot = {
  x: number
  y: number
  width: number
  height: number
}

type Frame = {
  id: string
  name: string
  layout: string
  image_url: string
  slots: Slot[]
}

export default function AdminPage() {

  // LOGIN
  const [loggedIn, setLoggedIn] =
    useState(false)

  const [username, setUsername] =
    useState("")

  const [password, setPassword] =
    useState("")

  // TABS
  const [tab, setTab] =
    useState<"upload" | "manage">(
      "upload"
    )

  // FORM
  const [name, setName] =
    useState("")

  const [layout, setLayout] =
    useState("1×4 Strip")

  const [file, setFile] =
    useState<File | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState("")

  // EDIT
  const [editingId, setEditingId] =
    useState<string | null>(null)

  // FRAMES
  const [frames, setFrames] =
    useState<Frame[]>([])

  // SLOTS
  const [slots, setSlots] =
    useState<Slot[]>([])

  // ZOOM
  const [zoom, setZoom] =
    useState(1)

  // DRAGGING
  const [draggingSlot, setDraggingSlot] =
    useState<number | null>(null)

  // RESIZE
  const [resizingSlot, setResizingSlot] =
    useState<number | null>(null)

  const dragOffset =
    useRef({
      x: 0,
      y: 0,
    })

  const frameRef =
    useRef<HTMLDivElement>(null)

  // AUTO SLOT
  useEffect(() => {

    const total =
      layout === "2×3 (6 ảnh)"
        ? 6
        : 4

    const slotWidth =
      layout === "1×4 Strip"
        ? 260
        : 220

    const slotHeight =
      layout === "1×4 Strip"
        ? 180
        : 290

    setSlots(

      Array.from({
        length: total
      }).map((_, index) => ({
        x: 50,
        y:
          80 +
          index *
            (slotHeight + 25),
        width: slotWidth,
        height: slotHeight,
      }))

    )

  }, [layout])

  // LOGIN
  const handleLogin = () => {

    if (
      username === "admin" &&
      password === "Nsvd@1811"
    ) {

      setLoggedIn(true)

      loadFrames()

      return
    }

    alert("Sai tài khoản 😭")
  }

  // LOAD FRAMES
  const loadFrames = async () => {

    const { data } =
      await supabase
        .from("frames")
        .select("*")
        .order("created_at", {
          ascending: false,
        })

    if (data) {
      setFrames(data)
    }
  }

  // START DRAG
  const startDrag = (
    index: number,
    e: React.MouseEvent
  ) => {

    const rect =
      e.currentTarget.getBoundingClientRect()

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setDraggingSlot(index)
  }

  // MOVE
  const onMove = (
    e: React.MouseEvent
  ) => {

    if (!frameRef.current)
      return

    const rect =
      frameRef.current.getBoundingClientRect()

    const x =
      (e.clientX - rect.left) / zoom

    const y =
      (e.clientY - rect.top) / zoom

    // RESIZE
    if (
      resizingSlot !== null
    ) {

      const updated = [...slots]

      updated[resizingSlot] = {

        ...updated[resizingSlot],

        width:
          x -
          updated[resizingSlot].x,

        height:
          y -
          updated[resizingSlot].y,
      }

      setSlots(updated)

      return
    }

    // DRAG
    if (
      draggingSlot !== null
    ) {

      const updated = [...slots]

      updated[draggingSlot] = {

        ...updated[draggingSlot],

        x:
          x -
          dragOffset.current.x /
            zoom,

        y:
          y -
          dragOffset.current.y /
            zoom,
      }

      setSlots(updated)
    }
  }

  // STOP
  const stopDrag = () => {

    setDraggingSlot(null)

    setResizingSlot(null)
  }

  // UPLOAD
  const uploadFrame = async () => {

    if (!file) {
      alert("Chưa chọn frame 😭")
      return
    }

    const fileName =
      `${Date.now()}-${file.name}`

    // upload storage
    const { error: uploadError } =
      await supabase.storage
        .from("frames")
        .upload(fileName, file)

    if (uploadError) {

      console.error(uploadError)

      alert("Upload fail 😭")

      return
    }

    // public url
    const { data } =
      supabase.storage
        .from("frames")
        .getPublicUrl(fileName)

    const imageUrl =
      data.publicUrl

    // UPDATE
    if (editingId) {

      await supabase
        .from("frames")
        .update({
          name,
          layout,
          image_url: imageUrl,
          slots,
        })
        .eq("id", editingId)

      alert("Updated 💖")

      loadFrames()

      return
    }

    // INSERT
    const { error: dbError } =
      await supabase
        .from("frames")
        .insert({
          name,
          layout,
          image_url: imageUrl,
          slots,
        })

    if (dbError) {

      console.error(dbError)

      alert("Database fail 😭")

      return
    }

    alert("Upload thành công 💖")

    loadFrames()
  }

  // DELETE
  const deleteFrame = async (
    id: string
  ) => {

    const confirmDelete =
      confirm("Xóa frame?")

    if (!confirmDelete)
      return

    await supabase
      .from("frames")
      .delete()
      .eq("id", id)

    loadFrames()
  }

  // LOGIN PAGE
  if (!loggedIn) {

    return (

      <main className="
        min-h-screen
        bg-gradient-to-br
        from-pink-100
        via-rose-50
        to-purple-100
        flex
        items-center
        justify-center
        p-6
      ">

        <div className="
          w-full
          max-w-md
          bg-white/80
          backdrop-blur-xl
          rounded-[40px]
          p-8
          shadow-2xl
        ">

          <h1 className="
            text-5xl
            font-black
            text-pink-500
            text-center
            mb-8
          ">
            Admin ✨
          </h1>

          <div className="
            space-y-5
          ">

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Username"
              className="
                w-full
                px-5 py-4
                rounded-2xl
                border
              "
            />

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Password"
              className="
                w-full
                px-5 py-4
                rounded-2xl
                border
              "
            />

            <button
              onClick={handleLogin}
              className="
                w-full
                py-4
                rounded-2xl
                bg-pink-500
                text-white
                font-bold
              "
            >
              Đăng nhập
            </button>

          </div>

        </div>

      </main>
    )
  }

  return (

    <main className="
      min-h-screen
      bg-gradient-to-br
      from-pink-100
      via-rose-50
      to-purple-100
      p-8
    ">

      {/* HEADER */}
      <div className="
        mb-10
      ">

        <h1 className="
          text-5xl
          font-black
          text-pink-500
        ">
          Frame Admin ✨
        </h1>

        <div className="
          flex
          gap-4
          mt-6
        ">

          <button
            onClick={() =>
              setTab("upload")
            }
            className={`
              px-6 py-3
              rounded-2xl
              font-bold
              ${
                tab === "upload"
                  ? "bg-pink-500 text-white"
                  : "bg-white"
              }
            `}
          >
            Upload Frame
          </button>

          <button
            onClick={() =>
              setTab("manage")
            }
            className={`
              px-6 py-3
              rounded-2xl
              font-bold
              ${
                tab === "manage"
                  ? "bg-pink-500 text-white"
                  : "bg-white"
              }
            `}
          >
            Manage Frames
          </button>

        </div>

      </div>

      {/* UPLOAD TAB */}
      {tab === "upload" && (

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-10
        ">

          {/* LEFT */}
          <div className="
            bg-white/70
            backdrop-blur-xl
            rounded-[40px]
            p-8
            shadow-2xl
            space-y-6
          ">

            {/* NAME */}
            <div>

              <p className="
                font-black
                text-pink-500
                mb-2
              ">
                Tên frame
              </p>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Cute frame"
                className="
                  w-full
                  px-5 py-4
                  rounded-2xl
                  border
                "
              />

            </div>

            {/* LAYOUT */}
            <div>

              <p className="
                font-black
                text-pink-500
                mb-2
              ">
                Layout
              </p>

              <select
                value={layout}
                onChange={(e) =>
                  setLayout(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-5 py-4
                  rounded-2xl
                  border
                "
              >
                <option>
                  1×4 Strip
                </option>

                <option>
                  2×2 (4 ảnh)
                </option>

                <option>
                  2×3 (6 ảnh)
                </option>

              </select>

            </div>

            {/* FILE */}
            <div>

              <p className="
                font-black
                text-pink-500
                mb-2
              ">
                Upload frame
              </p>

              <input
                type="file"
                accept="image/png"
                onChange={(e) => {

                  const selected =
                    e.target.files?.[0]

                  if (!selected)
                    return

                  setFile(selected)

                  setPreviewUrl(
                    URL.createObjectURL(
                      selected
                    )
                  )
                }}
                className="
                  w-full
                  px-5 py-4
                  rounded-2xl
                  border
                  bg-white
                "
              />

            </div>

            {/* SLOT INFO */}
            <div className="
              bg-pink-50
              rounded-3xl
              p-5
            ">

              <div className="
                flex
                items-center
                gap-3
                mb-4
              ">

                <Crop
                  className="
                    text-pink-500
                  "
                />

                <p className="
                  font-black
                  text-pink-500
                ">
                  Crop vùng ảnh
                </p>

              </div>

              <div className="
                space-y-3
                text-sm
                text-zinc-600
              ">

                <p>
                  • Kéo box để đổi vị trí
                </p>

                <p>
                  • Kéo góc phải dưới để resize
                </p>

                <p>
                  • Có thể zoom editor
                </p>

              </div>

            </div>

            {/* UPLOAD */}
            <button
              onClick={uploadFrame}
              className="
                w-full
                py-5
                rounded-3xl
                bg-pink-500
                hover:bg-pink-600
                text-white
                font-black
                text-lg
                shadow-xl
                transition
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Upload size={24} />

              {editingId
                ? "Update Frame"
                : "Upload Frame"}

            </button>

          </div>

          {/* RIGHT */}
          <div className="
            bg-white/70
            backdrop-blur-xl
            rounded-[40px]
            p-8
            shadow-2xl
          ">

            {/* TOP */}
            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <Move
                  className="
                    text-pink-500
                  "
                />

                <h2 className="
                  text-3xl
                  font-black
                  text-pink-500
                ">
                  Crop Editor ✨
                </h2>

              </div>

              {/* ZOOM */}
              <div className="
                flex
                gap-3
              ">

                <button
                  onClick={() =>
                    setZoom((z) =>
                      Math.max(
                        0.3,
                        z - 0.1
                      )
                    )
                  }
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-white
                    flex
                    items-center
                    justify-center
                  "
                >
                  <ZoomOut />
                </button>

                <button
                  onClick={() =>
                    setZoom((z) =>
                      z + 0.1
                    )
                  }
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-white
                    flex
                    items-center
                    justify-center
                  "
                >
                  <ZoomIn />
                </button>

              </div>

            </div>

            {/* EDITOR */}
            <div
              className="
                overflow-auto
                border
                rounded-3xl
                bg-pink-50
                p-5
              "
            >

              <div
                style={{
                  transform:
                    `scale(${zoom})`,
                  transformOrigin:
                    "top left",
                }}
              >

                <div
                  ref={frameRef}
                  onMouseMove={onMove}
                  onMouseUp={stopDrag}
                  className="
                    relative
                    w-fit
                    mx-auto
                  "
                >

                  {/* FRAME */}
                  {previewUrl && (

                    <img
                      src={previewUrl}
                      alt=""
                      className="
                        w-[700px]
                        rounded-3xl
                        shadow-xl
                        select-none
                        pointer-events-none
                      "
                    />

                  )}

                  {/* SLOTS */}
                  {slots.map(
                    (
                      slot,
                      index
                    ) => (

                      <div
                        key={index}
                        onMouseDown={(
                          e
                        ) =>
                          startDrag(
                            index,
                            e
                          )
                        }
                        className="
                          absolute
                          border-[4px]
                          border-pink-500
                          bg-pink-400/20
                          rounded-2xl
                          cursor-move
                          flex
                          items-center
                          justify-center
                          text-white
                          font-black
                          text-2xl
                          select-none
                        "
                        style={{
                          left: slot.x,
                          top: slot.y,
                          width:
                            slot.width,
                          height:
                            slot.height,
                        }}
                      >

                        {index + 1}

                        {/* RESIZE */}
                        <div
                          onMouseDown={(
                            e
                          ) => {

                            e.stopPropagation()

                            setResizingSlot(
                              index
                            )
                          }}
                          className="
                            absolute
                            bottom-0
                            right-0
                            w-6
                            h-6
                            bg-pink-500
                            rounded-tl-xl
                            cursor-se-resize
                          "
                        />

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* MANAGE */}
      {tab === "manage" && (

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-8
        ">

          {frames.map((frame) => (

            <div
              key={frame.id}
              className="
                bg-white/70
                backdrop-blur-xl
                rounded-[32px]
                p-4
                shadow-xl
              "

            >

              <img
                src={frame.image_url}
                alt=""
                className="
                  w-full
                  rounded-[24px]
                  mb-4
                "
              />

              <h2 className="
                text-2xl
                font-black
                text-pink-500
              ">
                {frame.name}
              </h2>

              <p className="
                text-zinc-500
                mt-1
              ">
                {frame.layout}
              </p>

              <div className="
                flex
                gap-3
                mt-5
              ">

                {/* EDIT */}
                <button
                  onClick={() => {

                    setTab(
                      "upload"
                    )

                    setEditingId(
                      frame.id
                    )

                    setName(
                      frame.name
                    )

                    setLayout(
                      frame.layout
                    )

                    setPreviewUrl(
                      frame.image_url
                    )

                    setSlots(
                      frame.slots
                    )
                  }}
                  className="
                    flex-1
                    py-3
                    rounded-2xl
                    bg-blue-100
                    text-blue-500
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <Pencil
                    size={18}
                  />

                  Edit

                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteFrame(
                      frame.id
                    )
                  }
                  className="
                    flex-1
                    py-3
                    rounded-2xl
                    bg-red-100
                    text-red-500
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <Trash2
                    size={18}
                  />

                  Delete

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  )
}