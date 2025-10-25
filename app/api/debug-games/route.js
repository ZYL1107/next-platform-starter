'use server';

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gamesDir = path.join(process.cwd(), 'public/games');

    // Check if directory exists
    const dirExists = fs.existsSync(gamesDir);

    if (!dirExists) {
      return NextResponse.json({
        error: 'Games directory does not exist',
        path: gamesDir
      });
    }

    // List all folders
    const folders = fs.readdirSync(gamesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Test case-insensitive lookup for "knight order"
    const testGameId = 'knight order';
    const lowerGameId = testGameId.toLowerCase();
    const matchedFolder = folders.find(folder => folder.toLowerCase() === lowerGameId);

    return NextResponse.json({
      gamesDirectory: gamesDir,
      allFolders: folders,
      testLookup: {
        searchFor: testGameId,
        found: matchedFolder || null,
        method: matchedFolder ? 'case-insensitive match' : 'not found'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NETLIFY: process.env.NETLIFY,
        CONTEXT: process.env.CONTEXT
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
