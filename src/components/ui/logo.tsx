export default function Logo() {
  return (
    <div>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="#FF0000"
          stroke="#CC0000"
          strokeWidth="2"
        />

        <g transform="translate(32,32)">
          <path
            d="M 0,-20 A 20,20 0 0,1 14.14,-14.14"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="14.14,-14.14 18,-18 18,-10 10,-10" fill="white" />

          <path
            d="M 0,20 A 20,20 0 0,1 -14.14,14.14"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="-14.14,14.14 -18,18 -18,10 -10,10" fill="white" />
        </g>

        <g transform="translate(32,32)">
          <circle cx="0" cy="0" r="12" fill="white" />
          <polygon points="-4,-6 -4,6 8,0" fill="#FF0000" />
        </g>
      </svg>
    </div>
  );
}
