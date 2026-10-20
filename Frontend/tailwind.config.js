/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Georgia', '"Times New Roman"', 'serif'],
            },
            keyframes: {
                'pop-in': {
                    '0%': { transform: 'scale(.4)', opacity: '0' },
                    '70%': { transform: 'scale(1.12)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'fade-up': {
                    '0%': { transform: 'translateY(2rem)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'pop-in': 'pop-in .35s cubic-bezier(.34,1.56,.64,1) both',
                'fade-up': 'fade-up .7s ease-out both',
            },
        },
    },
    plugins: [],
}
