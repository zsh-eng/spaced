import { loadEnvConfig } from '@next/env'
// NOTE: this file should only be imported in parts of the project that don't have access to the Next.js
// context
// This is because the Next.js edge runtime doesn't support Node.js APIs like process.cwd()
 
const projectDir = process.cwd()
loadEnvConfig(projectDir)