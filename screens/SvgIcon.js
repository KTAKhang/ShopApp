import * as React from "react";

const SvgIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="300"
        height="300"
        viewBox="0 0 300 300"
    >
        <circle
            cx="150"
            cy="150"
            r="140"
            fill="#2E7D32"
            stroke="#1B5E20"
            strokeWidth="4"
        ></circle>
        <defs>
            <radialGradient id="innerGrad" cx="0.5" cy="0.3">
                <stop offset="0%" stopColor="#4CAF50"></stop>
                <stop offset="100%" stopColor="#2E7D32"></stop>
            </radialGradient>
            <linearGradient id="leafGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8BC34A"></stop>
                <stop offset="100%" stopColor="#4CAF50"></stop>
            </linearGradient>
        </defs>
        <circle cx="150" cy="150" r="120" fill="url(#innerGrad)"></circle>
        <path
            fill="#FFA726"
            stroke="#FF8F00"
            strokeWidth="2"
            d="M125 130h50v35h-50z"
        ></path>
        <path
            fill="#D32F2F"
            stroke="#B71C1C"
            strokeWidth="2"
            d="m115 130 35-25 35 25z"
        ></path>
        <path fill="#5D4037" d="M142 145h16v20h-16z"></path>
        <path fill="#42A5F5" d="M130 138h8v8h-8zM162 138h8v8h-8z"></path>
        <g transform="translate(100 180)">
            <path
                fill="url(#leafGrad)"
                stroke="#689F38"
                d="M0 0q-2-8 0-15Q2-8 0 0"
            ></path>
            <circle cy="-12" r="1.5" fill="#FFC107"></circle>
            <circle cy="-8" r="1.5" fill="#FFC107"></circle>
            <circle cy="-4" r="1.5" fill="#FFC107"></circle>
        </g>
        <g transform="translate(200 180)">
            <path
                fill="url(#leafGrad)"
                stroke="#689F38"
                d="M0 0q-2-8 0-15Q2-8 0 0"
            ></path>
            <circle cy="-12" r="1.5" fill="#FFC107"></circle>
            <circle cy="-8" r="1.5" fill="#FFC107"></circle>
            <circle cy="-4" r="1.5" fill="#FFC107"></circle>
        </g>
        <g stroke="#FF8F00" transform="translate(150 200)">
            <ellipse cx="-15" fill="#FFE0B2" rx="12" ry="6"></ellipse>
            <ellipse cx="15" fill="#FFE0B2" rx="12" ry="6"></ellipse>
            <path
                fill="none"
                strokeLinecap="round"
                strokeWidth="2"
                d="M-3-2q3-3 6 0"
            ></path>
        </g>
        <text
            x="150"
            y="250"
            fill="#fff"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
        >
            OCOP
        </text>
        <text
            x="150"
            y="270"
            fill="#C8E6C9"
            fontFamily="Arial, sans-serif"
            fontSize="10"
            textAnchor="middle"
        >
            MỘT XÃ MỘT SẢN PHẨM
        </text>
        <g fill="#FFF176">
            <path
                d="m75 50 2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6zM225 70l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"
                opacity="0.8"
            ></path>
            <path
                d="m60 200 2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6zM240 220l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"
                opacity="0.6"
            ></path>
        </g>
        <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="#81C784"
            strokeDasharray="5,5"
            strokeWidth="2"
            opacity="0.5"
        ></circle>
    </svg>
);

export default SvgIcon;