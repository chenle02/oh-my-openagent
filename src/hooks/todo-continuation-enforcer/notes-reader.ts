import { existsSync, readFileSync, unlinkSync } from "fs"
import { join } from "path"

import { log } from "../../shared/logger"

import { HOOK_NAME } from "./constants"

const NOTES_FILENAME = "NOTES.md"

export function readAndConsumeNotes(directory: string): string | null {
  const notesPath = join(directory, NOTES_FILENAME)

  if (!existsSync(notesPath)) {
    return null
  }

  try {
    const content = readFileSync(notesPath, "utf-8").trim()
    if (!content) {
      unlinkSync(notesPath)
      return null
    }

    unlinkSync(notesPath)
    log(`[${HOOK_NAME}] Consumed NOTES.md (${content.length} chars)`, { directory })
    return content
  } catch (error) {
    log(`[${HOOK_NAME}] Failed to read/consume NOTES.md`, { directory, error: String(error) })
    return null
  }
}
