/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FC',
        card: '#FFFFFF',
        border: '#E5E7EB',
        'border-light': 'rgba(15, 23, 42, 0.06)',
        primary: {
          DEFAULT: '#4F7CFF',
          hover: '#3D6AEF',
          active: '#2E58D9'
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF'
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '20px'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        'soft-hover': '0 2px 4px rgba(15,23,42,0.06), 0 8px 16px rgba(15,23,42,0.04)',
        dialog: '0 12px 40px rgba(15,23,42,0.12)'
      },
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'HarmonyOS Sans SC',
          'system-ui',
          'sans-serif'
        ]
      },
      spacing: {
        'content': '860px'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '300ms'
      }
    }
  },
  plugins: []
}
