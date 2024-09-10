import React from 'react'
import TypeBadge from './TypeBadge'

type UploadedFileLike = {
  fileName?: string
  type: string
}

export default function UploadFileList({
  files,
  onChange,
}: {
  files: UploadedFileLike[]
  onChange?: (updatedFiles: UploadedFileLike[]) => void
}): JSX.Element {
  function handleRemove(index: number): void {
    if (onChange) {
      const updatedFiles = files.filter((_, i) => i !== index)
      onChange(updatedFiles)
    }
  }

  const items = files.map((f: UploadedFileLike, i: number) => (
    <div
      key={f.fileName}
      className="w-full border border-stone-300 rounded-md mb-2 group"
    >
      <div className="flex justify-between items-center py-2 px-2.5">
        <p className="truncate text-sm font-medium">{f.fileName}</p>
        <div className="flex items-center">
          <TypeBadge type={f.type} />
          {onChange && (
            <button
              onClick={() => handleRemove(i)}
              className="text-stone-500 hover:text-stone-700 focus:outline-none"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  ))

  return <div className="w-full">{items}</div>
}
