export const GoldUserIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 14"
    fill="none"
    className={className}>
    <path
      d="M13.12 13.1193C13.12 10.1 10.1828 7.65234 6.56 7.65234C2.93724 7.65234 0 10.1 0 13.1193H13.12Z"
      fill="currentColor"
    />
    <path
      d="M6.54562 6.56C8.35712 6.56 9.82562 5.09149 9.82562 3.28C9.82562 1.46851 8.35712 0 6.54562 0C4.73413 0 3.26562 1.46851 3.26562 3.28C3.26562 5.09149 4.73413 6.56 6.54562 6.56Z"
      fill="currentColor"
    />
    <path
      d="M11.9339 6.93928C12.1313 7.09937 12.1313 7.40062 11.9339 7.56071L8.65191 10.2215C8.39043 10.4335 8 10.2474 8 9.91077V4.58923C8 4.25262 8.39043 4.06653 8.6519 4.27852L11.9339 6.93928Z"
      fill="url(#g1)"
      stroke="url(#g2)"
      strokeOpacity="0.67"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6135 6.93928C14.811 7.09937 14.811 7.40062 14.6135 7.56071L11.3316 10.2215C11.0701 10.4335 10.6797 10.2474 10.6797 9.91077V4.58923C10.6797 4.25262 11.0701 4.06653 11.3316 4.27852L14.6135 6.93928Z"
      fill="url(#g3)"
      stroke="url(#g4)"
      strokeOpacity="0.67"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <defs>
      <linearGradient id="g1" x1="10.2" y1="6.37" x2="10.08" y2="10.74">
        <stop stopColor="#FFE6A5" />
        <stop offset="1" stopColor="white" />
      </linearGradient>

      <linearGradient id="g2" x1="10.15" y1="3.75" x2="10.15" y2="10.75">
        <stop stopColor="#DBB015" />
        <stop offset="0.51" stopColor="#FFDC5B" />
      </linearGradient>

      <linearGradient id="g3" x1="12.88" y1="6.37" x2="12.76" y2="10.74">
        <stop stopColor="#FFE6A5" />
        <stop offset="1" stopColor="white" />
      </linearGradient>

      <linearGradient id="g4" x1="12.83" y1="3.75" x2="12.83" y2="10.75">
        <stop stopColor="#DBB015" />
        <stop offset="0.51" stopColor="#FFDC5B" />
      </linearGradient>
    </defs>
  </svg>
);

export const UPIIcon = () => (
  <img
    src="https://cdn.gokwik.co/v4/images/upi-icons.svg"
    alt="UPI"
    className="h-5 w-auto object-contain"
    loading="lazy"
  />
);
