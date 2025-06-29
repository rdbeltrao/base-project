/** @type {import('tailwindcss').Config} */
import baseConfig from '@test-pod/tailwind-config'

export default {
  ...baseConfig,
  content: [...(baseConfig.content || []), './src/**/*.{js,ts,jsx,tsx}'],
}
