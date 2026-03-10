export const GoogleButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full py-3 mb-5 rounded-lg border border-gray-300 flex items-center justify-center gap-3 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-70">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADmUlEQVR4Ab1XA5AjQRQ9G6UrnV0627Zt27Zt27Zt27Z9FyeXiZN3v1NzW9vTmd3J6lW9cKbf6690EmlFIBDIQGzr9/vXE+8RjUSPTIP82Xq6pg27VvPCGoTz08KbiE5oBF3rIG6ge/PGWBhAGlpkAdEHzRCMeInzyEjqcHedj258gbgBM/KU1syjVbwo3aBHCPh+foe0YyMsw/vC0KI2dDVLQ1ejFAzNasI8tDekLWvh+/5VzYQOQGENOxfFfb9+wDplNHTVS0JXrUTUpGusk0aye0Ka4CPBi6cNFXbn2RPQ16vIi2igvn4luC6dVUuHWBOs4KCAtGtzOKICbXOnqKVjbqhW8yl2rrqwqUcb2Nctg/P4QThPHKLXy2Hq2ZYXXzgTCARUu4NLBetzZbHp61YQhI3tG8N9/zbU4L53C4bW9fF3+XwtnbH+f79nVA4Z++IBgri5fxcEbDZEh4Bk19qaEkUhPQt/W24Bxwd4z6SEdVSOCHHWcn6LCXEN0m7Fwr+ec/ZpJrznkwcpLcsEfZ3icJ4+hvgAaa9hBu5x+X9Qk4lH0H0wJ+D1xpeB28yAEZHgvZqFM+B71gZRoeoMu2ZeeuEVBhMz4OEMXEjJGfC/nxBnBnbc8CgNuBPUwKYr7pAGDFGm4GnrODOw97YQAZ1YhA9rcQa+Xy0Ij9+LcPFR5xcMXHnlFYtQbMPZEeLHTuRE+d2NcfjDeYSL3bc8goFfloDYhuwMxw+iT3CcT42Zh4uh+O5mQdY83BUGpxla8dcZQPPFEifeeY0j1CBqGTxskhPu20W3pjJhju3PjIDFHf0o9viAUbucwu73iPmXAKT7/2O0AZHw065Dxf3tBBP1j/bC1R/3oYa35s/odmQ3CVo5cRYNh1sI/9rIP8d5/X6+0k59vioLi2x+ciAWPNyEvW9PYd+701jxdAe6nx+HErubB78vtXkUqsz5FmHg2mufUtxDmrmVB5J5UGDb6yOCuFaW2NEZFRfeFXpfNjBL7Rj+DAqc+XKd0tE+bAOl9rTEuqdHQok/BpBK7VyYRz69cvgl6THu5iKU3NNck3ivixPxyvQhlPhvALmi+0NSmDfBF+eWV4fQ//JU1DnSA6X3tmQ7pTbthh4XJgRr4bXpI2QI4rTBQurKYiSeIo7Awi7sXIOJ1Oz0SvTGQthDnKWW83CisZ4ohSEsEdfKrRY3YAdIYis2v4m3iTqiW6ZO/mwNG6/yhNOEf6HhfzYhUKeuAAAAAElFTkSuQmCC"
      alt="Google"
      className="w-5 h-5"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "block";
      }}
    />
    <svg
      className="w-5 h-5 hidden"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    </svg>
    {loading ? "Loading..." : "Continue with Google"}
  </button>
);
