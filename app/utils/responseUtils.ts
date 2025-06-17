import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

// Configuration
const RESPONSES_DIR = path.join(os.tmpdir(), 'dbl-responses');
const MAX_RESPONSE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure the responses directory exists
async function ensureResponsesDir() {
  try {
    await fs.mkdir(RESPONSES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating responses directory:', error);
  }
}

// Generate a unique request ID
export function generateRequestId() {
  return crypto.randomUUID();
}

// Path to response file for a given request ID
export function getResponseFilePath(requestId: string) {
  return path.join(RESPONSES_DIR, `${requestId}.json`);
}

// Check if response exists for a request ID
export async function responseExists(requestId: string) {
  try {
    await fs.access(getResponseFilePath(requestId));
    return true;
  } catch {
    return false;
  }
}

// Save response to file
export async function saveResponse(requestId: string, data: any) {
  await ensureResponsesDir();
  // Include timestamp if not already present
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString();
  }
  await fs.writeFile(
    getResponseFilePath(requestId),
    JSON.stringify(data),
    'utf-8'
  );

  // Cleanup old files after saving new ones
  try {
    cleanupOldResponses();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Read response from file
export async function readResponse(requestId: string) {
  try {
    const data = await fs.readFile(getResponseFilePath(requestId), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading response for ${requestId}:`, error);
    return null;
  }
}

// Delete response file
export async function deleteResponse(requestId: string) {
  try {
    await fs.unlink(getResponseFilePath(requestId));
  } catch (error) {
    console.error(`Error deleting response for ${requestId}:`, error);
  }
}

// Clean up old response files
export async function cleanupOldResponses() {
  try {
    const now = Date.now();
    const files = await fs.readdir(RESPONSES_DIR);

    for (const file of files) {
      try {
        // Only process JSON files
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(RESPONSES_DIR, file);
        const stats = await fs.stat(filePath);

        // Calculate file age
        const fileAge = now - stats.mtime.getTime();

        // Delete files older than MAX_RESPONSE_AGE_MS
        if (fileAge > MAX_RESPONSE_AGE_MS) {
          await fs.unlink(filePath);
          console.log(`Deleted old response file: ${file}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old responses:', error);
  }
}
