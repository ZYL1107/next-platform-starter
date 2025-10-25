'use server';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    allEnvVars: Object.keys(process.env).sort(),
    relevantVars: {
      NODE_ENV: process.env.NODE_ENV,
      NETLIFY: process.env.NETLIFY,
      CONTEXT: process.env.CONTEXT,
      NETLIFY_DEV: process.env.NETLIFY_DEV,
      SITE_NAME: process.env.SITE_NAME,
      URL: process.env.URL,
      DEPLOY_URL: process.env.DEPLOY_URL,
    }
  });
}
