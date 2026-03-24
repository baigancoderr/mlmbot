import { useEffect, useState } from "react";
import "./index.css";



const App = () => {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    joined: 0,
    points: 0,
    earning: 0
  });

  // 🚀 LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      try {
        const tg = window?.Telegram?.WebApp;

        // 👉 Telegram check
        if (!tg) {
          console.log("Not inside Telegram");

          // 🔥 Browser fallback
          setUser({ username: "DemoUser" });
          setReferralLink("https://t.me/demo_ref");

          setStats({
            joined: 5,
            points: 100,
            earning: 50
          });

          setLoading(false);
          return;
        }

        tg.ready();

        const tgUser = tg?.initDataUnsafe?.user;

        if (!tgUser) {
          console.log("No Telegram user");

          setLoading(false);
          return;
        }

        const ref = tg?.initDataUnsafe?.start_param;

        // 🔗 Backend API call
        const res = await fetch("https://mlmbackend-production.up.railway.app/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            telegramId: tgUser.id.toString(),
            username: tgUser.username,
            ref
          })
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error("API failed");
        }

        setUser(data.user);
        setReferralLink(data.referralLink);

        setStats({
          joined: data.user?.referrals?.length || 0,
          points: 340,
          earning: 120
        });

        setLoading(false);

      } catch (err) {
        console.log("Error:", err);

        // fallback on error
        setUser({ username: "ErrorUser" });
        setReferralLink("Error generating link");

        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 📋 COPY
  const handleCopy = () => {
    if (!referralLink) return;

    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-main text-white px-4">

      <div className="absolute inset-0 bg-gradient-overlay"></div>

      <div className="relative z-10 w-full max-w-md">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 text-center">

          {/* USER */}
          <div className="mb-6">
            <div className="text-4xl mb-2">👤</div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
              {loading ? "Loading..." : user?.username}
            </h2>
          </div>

          {/* REF LINK */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-3 mb-4">
            <p className="text-xs opacity-70 mb-1">Your Referral Link</p>

            <p className="text-sm break-all">
              {loading ? "Generating..." : referralLink}
            </p>
          </div>

          {/* COPY BUTTON */}
          <button
            onClick={handleCopy}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold py-2 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            {copied ? "Copied ✅" : "Copy Referral Link"}
          </button>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mt-6">

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold">
                {loading ? "..." : stats.joined}
              </p>
              <p className="text-xs opacity-70">Joined</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold">
                {loading ? "..." : stats.points}
              </p>
              <p className="text-xs opacity-70">Points</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold">
                {loading ? "..." : `₹${stats.earning}`}
              </p>
              <p className="text-xs opacity-70">Earning</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default App;