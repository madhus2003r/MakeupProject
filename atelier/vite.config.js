import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// In development, /api calls are forwarded to the Spring Boot backend (same origin, so the session cookie just works).
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:8080'}}})
