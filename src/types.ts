import type { DataConnection } from 'peerjs'

export type UploadedFile = File & { entryFullPath?: string }

export enum UploaderConnectionStatus {
  Pending = 'PENDING',
  Paused = 'PAUSED',
  Uploading = 'UPLOADING',
  Done = 'DONE',
  InvalidPassword = 'INVALID_PASSWORD',
  Closed = 'CLOSED',
}

export type UploaderConnection = {
  status: UploaderConnectionStatus
  dataConnection: DataConnection
  browserName?: string
  browserVersion?: string
  osName?: string
  osVersion?: string
  mobileVendor?: string
  mobileModel?: string
  uploadingFileName?: string
  uploadingOffset?: number
  completedFiles: number
  totalFiles: number
  currentFileProgress: number
}
