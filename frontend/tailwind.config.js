/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF4500', // Example brand color
                secondary: '#1a1a1a',
            }
        },
    },
    plugins: [],
}
